import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const offres = await prisma.offre.findMany({
      where: { statut: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ offres });
  } catch (error) {
    console.error('[Offres] Erreur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
