import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { requireAuth } from '@/lib/auth-helpers';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

let _openai: OpenAI | null = null;
function getOpenAI() {
  if (!_openai) {
    _openai = new OpenAI();
  }
  return _openai;
}

const SYSTEM_PROMPT = `Tu es le Coach IA de YIRA Emploi (NOHAMA Consulting), spécialisé en insertion professionnelle des jeunes en Côte d'Ivoire.

Règles :
- Réponses courtes (3-5 phrases max), concrètes et actionnables.
- Utilise le profil du bénéficiaire (résultats SIGMUND, code Holland, niveau, secteur) pour personnaliser tes conseils.
- Propose des orientations métier précises adaptées au marché ivoirien.
- Si aucun profil n'est fourni, donne un conseil général d'orientation.
- Langue : français simple et professionnel.`;

export async function POST(request: NextRequest) {
  try {
    const { message, beneficiaireId } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message requis' }, { status: 400 });
    }

    // Authenticate expert
    const { profile, error: authError } = await requireAuth(request);
    if (authError || !profile) {
      return NextResponse.json({ error: authError || 'Non authentifié' }, { status: 401 });
    }

    // Check token balance
    if (profile.tokensCount <= 0) {
      return NextResponse.json({ error: 'Crédits YIRA épuisés' }, { status: 402 });
    }

    // Build context from beneficiary profile if provided
    let contextMessage = '';
    if (beneficiaireId) {
      try {
        const talent = await prisma.talent.findUnique({
          where: { id: beneficiaireId },
          include: {
            testsSigmund: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        });

        if (talent) {
          contextMessage = `\n\nProfil du bénéficiaire :\n- Nom : ${talent.prenom} ${talent.nom}\n- Niveau : ${talent.niveau || 'Non renseigné'}\n- Secteur : ${talent.specialite || 'Non renseigné'}\n- District : ${talent.district || 'Non renseigné'}\n- Statut : ${talent.statutParcours}`;

          if (talent.testsSigmund.length > 0) {
            const test = talent.testsSigmund[0];
            if (test.rapport) {
              try {
                const rapport = JSON.parse(test.rapport);
                const codeHolland = rapport.riasec?.holland_code || rapport.code_holland || 'N/A';
                const profilGlobal = rapport.profil_global || rapport.profile_summary || 'N/A';
                contextMessage += `\n- Code Holland : ${codeHolland}\n- Profil global : ${profilGlobal}`;
              } catch {
                // rapport is not valid JSON
              }
            }
            if (test.scoreEmployabilite) contextMessage += `\n- Score employabilité : ${test.scoreEmployabilite}/100`;
            if (test.syntheseIA) contextMessage += `\n- Synthèse IA : ${test.syntheseIA}`;
          }
        }
      } catch {
        // Continue without beneficiary context
      }
    }

    const userContent = contextMessage
      ? `${contextMessage}\n\nQuestion de l'expert : ${message}`
      : message;

    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4.1-mini',
      max_tokens: 300,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userContent },
      ],
    });

    const reply = completion.choices[0]?.message?.content || 'Désolé, je n\'ai pas pu générer de réponse.';

    // Deduct one token
    const updated = await prisma.yiraExpert.update({
      where: { id: profile.id },
      data: { tokensCount: { decrement: 1 } },
    });

    return NextResponse.json({
      reply,
      tokensRemaining: updated.tokensCount,
    });
  } catch (error) {
    console.error('Erreur chat IA:', error);
    return NextResponse.json({ error: 'Erreur serveur IA' }, { status: 500 });
  }
}
