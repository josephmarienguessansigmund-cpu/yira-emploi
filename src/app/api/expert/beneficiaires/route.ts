import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { profile, error } = await requireAuth(req);
    if (error || !profile) {
      return NextResponse.json({ error: error || 'Non authentifié' }, { status: 401 });
    }

    const isAdmin = profile.role === 'admin';

    const whereClause = isAdmin
      ? { completedAt: { not: null }, estValideParExpert: false }
      : {
          completedAt: { not: null },
          estValideParExpert: false,
          jeune: { assignedExpertId: profile.id },
        };

    const tests = await prisma.testSigmund.findMany({
      where: whereClause,
      include: { jeune: true },
      orderBy: { completedAt: 'desc' },
    });

    const beneficiaires = isAdmin
      ? await prisma.jeune.findMany({
          include: { testsSigmund: true },
          orderBy: { createdAt: 'desc' },
        })
      : await prisma.jeune.findMany({
          where: { assignedExpertId: profile.id },
          include: { testsSigmund: true },
          orderBy: { createdAt: 'desc' },
        });

    return NextResponse.json({ tests, beneficiaires, role: profile.role });
  } catch (error) {
    console.error('[Expert/Beneficiaires] Erreur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
