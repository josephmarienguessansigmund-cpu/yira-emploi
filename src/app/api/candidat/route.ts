import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const telephone = searchParams.get('telephone');

    if (!telephone) {
      return NextResponse.json(
        { error: 'Le numéro de téléphone est requis' },
        { status: 400 }
      );
    }

    // Normalize phone number
    let phone = telephone.replace(/[\s-]/g, '');
    if (phone.startsWith('0') && phone.length === 10) {
      phone = '+225' + phone.substring(1);
    } else if (!phone.startsWith('+') && phone.length === 10) {
      phone = '+225' + phone;
    }

    const jeune = await prisma.jeune.findUnique({
      where: { telephone: phone },
      select: { id: true, prenom: true, nom: true },
    });

    if (!jeune) {
      return NextResponse.json(
        { error: 'Aucun profil trouvé avec ce numéro. Veuillez vous inscrire d\'abord.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: jeune });
  } catch (error) {
    console.error('[API/Candidat] Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la recherche du profil' },
      { status: 500 }
    );
  }
}
