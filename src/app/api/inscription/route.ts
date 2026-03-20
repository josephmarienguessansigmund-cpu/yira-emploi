import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prenom, nom, telephone, email, niveau, district } = body;

    if (!prenom || !nom || !telephone || !niveau || !district) {
      return NextResponse.json(
        { error: 'Prénom, nom, téléphone, niveau et district sont requis' },
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

    // Check if already registered
    const existing = await prisma.jeune.findUnique({
      where: { telephone: phone },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Ce numéro de téléphone est déjà inscrit. Vous pouvez passer le test directement.' },
        { status: 409 }
      );
    }

    // Create the profile
    const jeune = await prisma.jeune.create({
      data: {
        prenom,
        nom,
        telephone: phone,
        email: email || null,
        niveau,
        district,
      },
    });

    return NextResponse.json({
      success: true,
      data: { id: jeune.id, prenom: jeune.prenom, nom: jeune.nom },
    });
  } catch (error) {
    console.error('[API/Inscription] Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'inscription. Veuillez réessayer.' },
      { status: 500 }
    );
  }
}
