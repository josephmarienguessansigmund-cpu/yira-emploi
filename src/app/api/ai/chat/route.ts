import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { profile, error } = await requireAuth(req);
    if (error || !profile) {
      return NextResponse.json({ error: error || 'Non authentifié' }, { status: 401 });
    }

    if (profile.tokensCount <= 0) {
      return NextResponse.json(
        { error: 'credits_epuises', message: 'Votre solde de crédits YIRA est épuisé. Veuillez recharger.' },
        { status: 402 }
      );
    }

    const body = await req.json();
    const { message, beneficiaireId } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message requis' }, { status: 400 });
    }

    let contextData = '';
    if (beneficiaireId) {
      const beneficiaire = await prisma.talent.findUnique({
        where: { id: beneficiaireId },
        include: { testsSigmund: true },
      });

      if (beneficiaire) {
        const isAdmin = profile.role === 'admin';
        if (!isAdmin && beneficiaire.assignedExpertId !== profile.id) {
          return NextResponse.json({ error: 'Accès non autorisé à ce bénéficiaire' }, { status: 403 });
        }

        contextData = `
--- PROFIL DU BÉNÉFICIAIRE ---
Nom: ${beneficiaire.prenom} ${beneficiaire.nom}
Code YIRA: ${beneficiaire.codeYira || 'N/A'}
Niveau: ${beneficiaire.niveau || 'N/A'}
Spécialité: ${beneficiaire.specialite || 'N/A'}
Situation: ${beneficiaire.situationActuelle || 'N/A'}
District: ${beneficiaire.district || 'N/A'}
Parcours: ${beneficiaire.statutParcours}
`;

        if (beneficiaire.testsSigmund.length > 0) {
          contextData += '\n--- RÉSULTATS DES TESTS SIGMUND ---\n';
          for (const test of beneficiaire.testsSigmund) {
            if (test.rapport) {
              try {
                const rapport = JSON.parse(test.rapport);
                contextData += `\nTest complété le ${test.completedAt?.toLocaleDateString() || 'N/A'}:\n`;
                contextData += JSON.stringify(rapport, null, 2);
              } catch {
                contextData += `\nRapport brut: ${test.rapport}\n`;
              }
            }
          }
        }
      }
    }

    const systemPrompt = `Tu es YIRA Coach, un assistant IA spécialisé dans l'insertion professionnelle des jeunes en Côte d'Ivoire. Tu travailles pour le programme YIRA Emploi de NOHAMA Consulting.

Ton rôle est d'aider les experts à analyser les profils des bénéficiaires et les résultats de leurs tests psychométriques (Big Five/OCEAN, RIASEC/Holland, Soft Skills, Motivation) pour proposer des recommandations de coaching personnalisées.

Tu dois:
- Analyser les scores des tests et identifier les forces et axes d'amélioration
- Proposer des parcours de formation adaptés
- Suggérer des métiers compatibles avec le profil RIASEC
- Donner des conseils de développement des soft skills
- Être encourageant et constructif dans tes recommandations

Réponds toujours en français.${contextData ? '\n\nVoici les données du bénéficiaire actuel:\n' + contextData : ''}`;

    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicKey) {
      return NextResponse.json({ error: 'Clé API Anthropic non configurée' }, { status: 500 });
    }

    const aiResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: message }],
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error('[AI/Chat] Erreur Anthropic:', errText);
      return NextResponse.json({ error: 'Erreur du service IA' }, { status: 502 });
    }

    const aiData = await aiResponse.json();
    const reply = aiData.content?.[0]?.text || 'Aucune réponse générée.';

    // Deduct 1 token
    await prisma.yiraExpert.update({
      where: { id: profile.id },
      data: { tokensCount: { decrement: 1 } },
    });

    return NextResponse.json({
      reply,
      tokensRemaining: profile.tokensCount - 1,
    });
  } catch (error) {
    console.error('[AI/Chat] Erreur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
