import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import prisma from '@/lib/db';
import { smsService } from '@/lib/sms-service';

export const dynamic = 'force-dynamic';

// GET: fetch test details for validation
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { profile, error } = await requireAuth(req);
    if (error || !profile) {
      return NextResponse.json({ error: error || 'Non authentifié' }, { status: 401 });
    }

    const test = await prisma.testSigmund.findUnique({
      where: { id: params.id },
      include: { talent: true },
    });

    if (!test) {
      return NextResponse.json({ error: 'Test non trouvé' }, { status: 404 });
    }

    return NextResponse.json({ test });
  } catch (error) {
    console.error('[Valider/GET] Erreur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PATCH: validate or invalidate a test
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { profile, error } = await requireAuth(req);
    if (error || !profile) {
      return NextResponse.json({ error: error || 'Non authentifié' }, { status: 401 });
    }

    const body = await req.json();
    const valide = body.valide === true;
    const commentaire = body.commentaire || '';

    const test = await prisma.testSigmund.update({
      where: { id: params.id },
      data: {
        estValideParExpert: valide,
        syntheseIA: commentaire || undefined,
      },
      include: { talent: true },
    });

    // Send SMS notification to the talent
    if (test.talent.telephone) {
      const statusText = valide ? 'validés par un expert' : 'nécessitent un complément';
      await smsService.send(
        test.talent.telephone,
        `YIRA Emploi: Vos résultats SIGMUND ont été ${statusText}. Consultez *789# > 3 pour les détails. NOHAMA Consulting`
      );
    }

    return NextResponse.json({
      success: true,
      message: valide ? 'Test validé' : 'Test marqué à revoir',
      test,
    });
  } catch (error) {
    console.error('[Valider/PATCH] Erreur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
