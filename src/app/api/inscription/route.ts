import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { genererCodeYira } from '@/lib/yira-code';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      prenom, nom, telephone, email,
      dateNaissance, genre, niveau, specialite,
      situationActuelle, district, commune, quartier,
      zoneGeo, canalPrefere, consentementRGPD,
    } = body;

    // Validation champs obligatoires
    if (!prenom || !nom || !telephone || !niveau || !district || !dateNaissance || !genre) {
      return NextResponse.json(
        { error: 'Prénom, nom, téléphone, date de naissance, genre, niveau et district sont requis.' },
        { status: 400 }
      );
    }

    if (!consentementRGPD) {
      return NextResponse.json(
        { error: 'Vous devez accepter le consentement pour le traitement de vos données.' },
        { status: 400 }
      );
    }

    // Normaliser le numéro de téléphone
    let phone = telephone.replace(/[\s-]/g, '');
    if (phone.startsWith('0') && phone.length === 10) {
      phone = '+225' + phone.substring(1);
    } else if (!phone.startsWith('+') && phone.length === 10) {
      phone = '+225' + phone;
    }

    // Vérifier si déjà inscrit
    const existing = await prisma.talent.findUnique({
      where: { telephone: phone },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Ce numéro de téléphone est déjà inscrit. Vous pouvez passer le test directement.' },
        { status: 409 }
      );
    }

    // Générer le code YIRA unique
    const codeYira = await genererCodeYira();

    // Créer le profil
    const talent = await prisma.talent.create({
      data: {
        prenom,
        nom,
        telephone: phone,
        email: email || null,
        dateNaissance: new Date(dateNaissance),
        genre,
        niveau,
        specialite: specialite || null,
        situationActuelle: situationActuelle || null,
        district,
        commune: commune || null,
        quartier: quartier || null,
        zoneGeo: zoneGeo || null,
        canalPrefere: canalPrefere || null,
        consentementRGPD: Boolean(consentementRGPD),
        codeYira,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: talent.id,
        prenom: talent.prenom,
        nom: talent.nom,
        codeYira: talent.codeYira,
      },
    });
  } catch (error) {
    console.error('[API/Inscription] Erreur:', error);
    return NextResponse.json(
      { error: "Erreur lors de l'inscription. Veuillez réessayer." },
      { status: 500 }
    );
  }
}
