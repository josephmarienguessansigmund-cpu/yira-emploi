import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { error } = await requireAdmin(req);
    if (error) {
      return NextResponse.json({ error }, { status: 403 });
    }

    const body = await req.json();
    const { expertId, tokens } = body;

    if (!expertId || typeof tokens !== 'number' || tokens <= 0) {
      return NextResponse.json({ error: 'expertId et tokens (nombre positif) sont requis' }, { status: 400 });
    }

    const expert = await prisma.yiraExpert.update({
      where: { id: expertId },
      data: { tokensCount: { increment: tokens } },
    });

    return NextResponse.json({
      success: true,
      expert: {
        id: expert.id,
        nom: expert.nom,
        tokensCount: expert.tokensCount,
      },
    });
  } catch (error) {
    console.error('[Admin/Tokens] Erreur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
