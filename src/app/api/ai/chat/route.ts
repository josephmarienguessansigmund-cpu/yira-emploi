import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `Tu es YIRA Coach IA, un assistant expert en insertion professionnelle des jeunes en Côte d'Ivoire, développé par NOHAMA Consulting.

Ton rôle :
- Aider les experts YIRA à analyser les profils psychométriques Sigmund (Big Five, RIASEC, Soft Skills, Motivation)
- Proposer des recommandations d'orientation professionnelle adaptées au contexte ivoirien
- Conseiller sur les métiers porteurs, les formations disponibles et les opportunités d'emploi en Côte d'Ivoire
- Accompagner les experts dans le coaching des bénéficiaires

Règles :
- Réponds toujours en français
- Sois concis, professionnel et bienveillant
- Base tes recommandations sur les données Sigmund quand elles sont disponibles
- Prends en compte le contexte socio-économique ivoirien (districts, niveaux d'éducation, secteurs d'activité locaux)
- Ne donne jamais de diagnostic médical ou psychologique clinique`;

export async function POST(request: NextRequest) {
  try {
    const { message, beneficiaireId } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message requis' }, { status: 400 });
    }

    // Netlify AI Gateway injects ANTHROPIC_API_KEY and ANTHROPIC_BASE_URL automatically
    const anthropic = new Anthropic();

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: message },
      ],
    });

    const textBlock = response.content.find((block) => block.type === 'text');
    const reply = textBlock ? textBlock.text : 'Désolé, je n\'ai pas pu générer de réponse.';

    return NextResponse.json({ reply });

  } catch (error: unknown) {
    console.error('Erreur chat IA:', error);

    const message = error instanceof Error ? error.message : 'Erreur serveur';

    if (message.includes('API key') || message.includes('authentication')) {
      return NextResponse.json(
        { error: 'Service IA non configuré. Le Netlify AI Gateway doit être activé.' },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: 'Erreur du service IA' }, { status: 500 });
  }
}
