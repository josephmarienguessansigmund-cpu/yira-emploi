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

    // 1. Normalisation du numéro
    let phone = telephone.replace(/[\s-]/g, '');
    if (phone.startsWith('0') && phone.length === 10) {
      phone = '+225' + phone.substring(1);
    } else if (!phone.startsWith('+') && phone.length === 10) {
      phone = '+225' + phone;
    }

    // 2. Recherche du Talent (Anciennement Jeune)
    const talent = await prisma.talent.findUnique({
      where: { telephone: phone },
      select: { id: true, prenom: true, nom: true },
    });

    // 3. Vérification avec l'opérateur "!"
    if (!talent) {
      return NextResponse.json(
        { error: 'Aucun profil trouvé avec ce numéro. Veuillez vous inscrire.' },
        { status: 404 }
      );
    }

    // 4. Retour des données (On utilise 'talent')
    return NextResponse.json({ success: true, data: talent });

  } catch (error) {
    console.error('[API/Candidat] Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la recherche du profil' },
      { status: 500 }
    );
  }
}