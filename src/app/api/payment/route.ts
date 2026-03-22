/**
 * YIRA – Webhook Mobile Money (Africa's Talking)
 * Reçoit les notifications de paiement et met à jour le statut.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  let payload: Record<string, string>;

  try {
    const contentType = request.headers.get('content-type') || '';
    const rawBody = await request.text();

    if (contentType.includes('application/json')) {
      payload = JSON.parse(rawBody);
    } else {
      payload = Object.fromEntries(new URLSearchParams(rawBody));
    }
  } catch {
    return NextResponse.json({ error: 'Payload invalide' }, { status: 400 });
  }

  const { status, phoneNumber, value } = payload;

  console.log(`[Payment Webhook] phone=${phoneNumber} status=${status}`);

  try {
    if (!phoneNumber) {
      return NextResponse.json({ error: 'phoneNumber manquant' }, { status: 400 });
    }

    const talent = await prisma.talent.findUnique({
      where: { telephone: phoneNumber },
      include: { paiements: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });

    if (!talent || talent.paiements.length === 0) {
      console.warn(`[Payment] Aucun talent/paiement trouvé pour ${phoneNumber}`);
      return NextResponse.json({ received: true });
    }

    const paiement = talent.paiements[0];
    const montant = parseFloat(value?.replace(/[^0-9.]/g, '') || '0');

    await prisma.paiement.update({
      where: { id: paiement.id },
      data: {
        statut: status === 'Success' ? 'SUCCESS' : 'ECHEC',
        operateur: detecterOperateur(phoneNumber),
        montant: montant || paiement.montant,
      },
    });

    // Créditer les points au talent si paiement réussi
    if (status === 'Success') {
      const pointsBonus = Math.floor((montant || paiement.montant) / 100) * 10;
      await prisma.talent.update({
        where: { telephone: phoneNumber },
        data: {
          creditFcfa: { increment: montant || paiement.montant },
          soldePoints: { increment: pointsBonus },
        },
      });
      console.log(`[Payment] Points crédités: ${pointsBonus} points, ${montant || paiement.montant} FCFA pour ${phoneNumber}`);
    }

    return NextResponse.json({ success: true, message: 'Paiement traité.' });
  } catch (error) {
    console.error('[Payment Webhook] Erreur interne:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

function detecterOperateur(telephone: string): string {
  const num = telephone.replace(/\D/g, '').slice(-8);
  const prefix = num.substring(0, 2);

  if (['07', '08', '09'].includes(prefix)) return 'Orange';
  if (['05', '06'].includes(prefix)) return 'MTN';
  if (['01', '02', '03'].includes(prefix)) return 'Moov';
  return 'Inconnu';
}
