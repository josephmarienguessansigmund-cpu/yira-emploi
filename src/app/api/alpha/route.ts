/**
 * YIRA – API Alpha Whitelist
 * POST /api/alpha/check — Vérifie si un numéro est dans la whitelist Alpha
 * POST /api/alpha/simulate — Simule une transaction réussie pour un numéro Alpha
 */

import { NextRequest, NextResponse } from "next/server";
import { isAlphaUser, getAlphaNumbers } from "@/lib/whitelist";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, telephone } = body as {
      action: "check" | "simulate";
      telephone: string;
    };

    if (!telephone) {
      return NextResponse.json(
        { error: "Numéro de téléphone requis" },
        { status: 400 }
      );
    }

    // Normaliser le numéro
    let phone = telephone.replace(/[\s-]/g, "");
    if (phone.startsWith("0") && phone.length === 10) {
      phone = "+225" + phone.substring(1);
    } else if (!phone.startsWith("+") && phone.length === 10) {
      phone = "+225" + phone;
    }

    if (action === "check") {
      const isAlpha = isAlphaUser(telephone);
      return NextResponse.json({
        success: true,
        data: {
          telephone,
          isAlpha,
          accessLevel: isAlpha ? "FULL_ACCESS" : "STANDARD",
          message: isAlpha
            ? "Numéro Alpha — accès complet à tous les modules sans paiement."
            : "Numéro standard — paiement requis pour les modules premium.",
        },
      });
    }

    if (action === "simulate") {
      if (!isAlphaUser(telephone)) {
        return NextResponse.json(
          { error: "Ce numéro n'est pas dans la whitelist Alpha." },
          { status: 403 }
        );
      }

      // Trouver ou informer
      const talent = await prisma.talent.findUnique({
        where: { telephone: phone },
      });

      if (!talent) {
        return NextResponse.json(
          { error: "Talent non trouvé. Inscrivez ce numéro d'abord." },
          { status: 404 }
        );
      }

      // Simuler une transaction réussie
      const paiement = await prisma.paiement.create({
        data: {
          talentId: talent.id,
          montant: 25000,
          pricePaid: 0,
          statut: "SUCCESS",
          operateur: "ALPHA_TEST",
          typePaiement: "FULL_EVAL",
          description: "Transaction simulée Alpha — accès complet gratuit",
          reference: `ALPHA-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        },
      });

      // Créditer les points
      const pointsBonus = 250;
      const creditBonus = 25000;
      await prisma.talent.update({
        where: { id: talent.id },
        data: {
          soldePoints: { increment: pointsBonus },
          creditFcfa: { increment: creditBonus },
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          paiementId: paiement.id,
          telephone,
          montantSimule: 25000,
          pricePaid: 0,
          pointsCredites: pointsBonus,
          creditFcfa: creditBonus,
          statut: "SUCCESS",
          message: `Transaction Alpha simulée avec succès. +${pointsBonus} points, +${creditBonus} FCFA crédités.`,
        },
      });
    }

    return NextResponse.json(
      { error: "Action invalide. Utilisez 'check' ou 'simulate'." },
      { status: 400 }
    );
  } catch (error) {
    console.error("[API/Alpha] Erreur:", error);
    return NextResponse.json(
      { error: "Erreur serveur." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/alpha — Liste les numéros Alpha (admin only info)
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      alphaNumbers: getAlphaNumbers(),
      count: getAlphaNumbers().length,
      phase: "Alpha Test",
      accessLevel: "FULL_ACCESS — tous modules sans paiement",
    },
  });
}
