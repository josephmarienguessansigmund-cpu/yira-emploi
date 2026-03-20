import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

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

    // Normalisation du numéro (Format Côte d'Ivoire +225)
    let phone = telephone.replace(/[\s-]/g, '');
    if (phone.startsWith('0') && phone.length === 10) {
      phone = '+225' + phone.substring(1);
    } else if (!phone.startsWith('+') && phone.length === 10) {
      phone = '+225' + phone;
    }

    // Recherche dans la table 'talent' (et non 'jeune')
    const talent = await prisma.talent.findUnique({
      where: { telephone: phone },
      select: { id: true, prenom: true, nom: true },
    });

    // Utilisation du "!" (SI le talent n'existe pas)
    if (!talent) {
      return NextResponse.json(
        { error: "Aucun profil trouvé avec ce numéro. Veuillez vous inscrire d'abord sur YIRA." },
        { status: 404 }
      );
    }

    // On renvoie bien la variable 'talent' ici
    return NextResponse.json({ success: true, data: talent });

  } catch (error) {
    console.error('[API/Candidat] Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la recherche du profil' },
      { status: 500 }
    );
  }
}