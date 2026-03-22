import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

const OFFRES_TYPES = [
  {
    titre: 'Technicien Agricole',
    description: 'Exploitation cacaoyère cherche technicien pour suivi de parcelles. Formation assurée.',
    secteur: 'Agriculture',
    region: 'San-Pédro',
    district: 'San-Pédro',
    employeur: 'COOPAGRI Nawa',
    profilHolland: 'RIA',
    niveauMin: 'BEPC/BEF',
  },
  {
    titre: 'Développeur Web Junior',
    description: 'Startup tech recrute développeur front-end. Connaissance HTML/CSS/JS requise.',
    secteur: 'Tech/Numérique',
    region: 'Abidjan',
    district: 'Abidjan',
    employeur: 'DigiCraft CI',
    profilHolland: 'ICE',
    niveauMin: 'BTS/DUT',
  },
  {
    titre: 'Agent Commercial Terrain',
    description: 'Entreprise de distribution alimentaire recrute agents commerciaux. Véhicule fourni.',
    secteur: 'Commerce',
    region: 'Bouaké',
    district: 'Bouaké',
    employeur: 'ProDistrib SA',
    profilHolland: 'ESC',
    niveauMin: 'BAC',
  },
  {
    titre: 'Aide-soignant(e)',
    description: 'Centre de santé communautaire recrute aide-soignants. Expérience en milieu hospitalier appréciée.',
    secteur: 'Santé',
    region: 'Korhogo',
    district: 'Korhogo',
    employeur: 'CSC Poro Santé',
    profilHolland: 'SIA',
    niveauMin: 'BEPC/BEF',
  },
  {
    titre: 'Maçon Qualifié BTP',
    description: 'Chantier immobilier recrute maçons qualifiés pour projet de logements sociaux. CDD 6 mois.',
    secteur: 'BTP',
    region: 'Daloa',
    district: 'Daloa',
    employeur: 'BatiPlus CI',
    profilHolland: 'RCS',
    niveauMin: 'Sans diplôme',
  },
];

export async function POST() {
  try {
    // Check if offers already exist
    const existing = await prisma.offre.count();
    if (existing >= 5) {
      return NextResponse.json({ message: 'Offres déjà présentes', count: existing });
    }

    const created = await prisma.offre.createMany({
      data: OFFRES_TYPES.map((o) => ({
        ...o,
        statut: 'ACTIVE',
        dateLimite: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // +90 days
      })),
      skipDuplicates: true,
    });

    return NextResponse.json({ message: 'Offres créées', count: created.count });
  } catch (error) {
    console.error('[Offres/Seed] Erreur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
