import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message requis' }, { status: 400 });
    }

    const reponse = `Bonjour ! Je suis l'assistant YIRA. Comment puis-je vous aider dans votre parcours d'insertion professionnelle en Côte d'Ivoire ?`;

    return NextResponse.json({ reponse });

  } catch (error) {
    console.error('Erreur chat IA:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}