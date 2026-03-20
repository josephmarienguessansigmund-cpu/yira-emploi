import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { message, jeuneId } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message requis' }, { status: 400 });
    }

    let contexte = '';
    if (jeuneId) {
      try {
        const jeune = await prisma.jeune.findUnique({
          where: { id: jeuneId },
          include: { testsSigmund: true }
        });
        if (jeune) {
          contexte = `Jeune: ${jeune.nom} ${jeune.prenom}`;
        }
      } catch (e) {
        console.error('Erreur profil:', e);
      }
    }

    const reponse = `Bonjour ! Je suis l'assistant YIRA. Comment puis-je vous aider ?`;

    return NextResponse.json({ reponse });

  } catch (error) {
    console.error('Erreur chat IA:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}