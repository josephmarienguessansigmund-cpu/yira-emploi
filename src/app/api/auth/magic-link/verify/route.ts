// ============================================================
// API: /api/auth/magic-link/verify
// Vérifie un Magic Link token et authentifie l'utilisateur
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { alphaSync } from "@/lib/alpha-sync";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: "Token manquant." },
        { status: 400 }
      );
    }

    // Hash le token pour le comparer
    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Rechercher le talent avec ce token
    const talents = await prisma.talent.findMany({
      where: {
        canalPrefere: {
          startsWith: `magic:${tokenHash}:`,
        },
      },
    });

    if (talents.length === 0) {
      return NextResponse.json(
        { error: "Lien invalide ou expiré." },
        { status: 401 }
      );
    }

    const talent = talents[0];

    // Vérifier l'expiration
    const parts = talent.canalPrefere?.split(":") || [];
    const expiry = parseInt(parts[2] || "0", 10);

    if (Date.now() > expiry) {
      // Nettoyer le token expiré
      await prisma.talent.update({
        where: { id: talent.id },
        data: { canalPrefere: null },
      });

      return NextResponse.json(
        { error: "Ce lien a expiré. Demandez un nouveau Magic Link." },
        { status: 401 }
      );
    }

    // Token valide — Nettoyer et confirmer
    await prisma.talent.update({
      where: { id: talent.id },
      data: { canalPrefere: "SMS" },
    });

    alphaSync("AUTH_MAGIC_LINK", {
      phone: talent.telephone,
      details: {
        action: "verified",
        talentId: talent.id,
        codeYira: talent.codeYira,
      },
    });

    console.log(
      `[Magic Link] Vérifié pour ${talent.prenom} ${talent.nom} (${talent.codeYira})`
    );

    return NextResponse.json({
      success: true,
      message: "Authentification réussie.",
      data: {
        id: talent.id,
        prenom: talent.prenom,
        nom: talent.nom,
        codeYira: talent.codeYira,
        telephone: talent.telephone,
      },
    });
  } catch (error) {
    console.error("[API/Magic-Link/Verify] Erreur:", error);
    return NextResponse.json(
      { error: "Erreur serveur." },
      { status: 500 }
    );
  }
}
