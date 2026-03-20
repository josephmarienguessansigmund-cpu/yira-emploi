import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { session_id, status, results } = body;

    console.log(`[Sigmund Webhook] session=${session_id} status=${status}`);

    if (!session_id) {
      return NextResponse.json({ error: 'session_id manquant' }, { status: 400 });
    }

    const test = await prisma.testSigmund.findFirst({
      where: { sigmundTestId: session_id },
    });

    if (!test) {
      console.warn(`[Sigmund Webhook] Test non trouvé pour session: ${session_id}`);
      return NextResponse.json({ received: true });
    }

    if (status === 'completed') {
      await prisma.testSigmund.update({
        where: { id: test.id },
        data: {
          completedAt: new Date(),
          rapport: results ? JSON.stringify(results) : null,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Sigmund Webhook] Erreur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
