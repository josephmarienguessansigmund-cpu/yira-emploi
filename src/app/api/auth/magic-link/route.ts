// ============================================================
// API: /api/auth/magic-link
// Envoie un Magic Link de connexion par SMS
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { smsService } from "@/lib/sms-service";
import { isWhitelisted, FEATURES } from "@/lib/config";
import { alphaSync } from "@/lib/alpha-sync";
import prisma from "@/lib/db";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { telephone } = body;

    if (!telephone) {
      return NextResponse.json(
        { error: "Le numéro de téléphone est requis." },
        { status: 400 }
      );
    }

    // Normaliser le numéro
    let phone = telephone.replace(/[\s\-]/g, "");
    if (phone.startsWith("0") && phone.length === 10) {
      phone = "+225" + phone.substring(1);
    } else if (!phone.startsWith("+") && phone.length >= 8) {
      phone = "+225" + phone;
    }

    // Vérification whitelist en mode Alpha
    if (FEATURES.ALPHA_MODE && !isWhitelisted(phone)) {
      alphaSync("WHITELIST_CHECK", {
        phone,
        details: { allowed: false, endpoint: "magic-link" },
      });
      return NextResponse.json(
        { error: "Accès restreint en mode Alpha. Contactez NOHAMA Consulting." },
        { status: 403 }
      );
    }

    // Vérifier si le talent existe
    const talent = await prisma.talent.findUnique({
      where: { telephone: phone },
    });

    if (!talent) {
      return NextResponse.json(
        { error: "Aucun compte trouvé pour ce numéro. Inscrivez-vous d'abord." },
        { status: 404 }
      );
    }

    // Générer et envoyer le Magic Link
    const result = await smsService.sendMagicLink(phone);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Erreur lors de l'envoi du SMS." },
        { status: 500 }
      );
    }

    // Stocker le token avec expiration (15 min)
    // On utilise le champ canalPrefere temporairement pour le token hash
    // En production, utiliser une table dédiée magic_link_tokens
    const tokenHash = crypto
      .createHash("sha256")
      .update(result.token!)
      .digest("hex");

    await prisma.talent.update({
      where: { telephone: phone },
      data: {
        canalPrefere: `magic:${tokenHash}:${Date.now() + 15 * 60 * 1000}`,
      },
    });

    alphaSync("SMS_MAGIC_LINK_SENT", {
      phone,
      details: {
        talentId: talent.id,
        codeYira: talent.codeYira,
      },
    });

    console.log(
      `[Magic Link] Envoyé à ${phone} | Talent: ${talent.prenom} ${talent.nom}`
    );

    return NextResponse.json({
      success: true,
      message: `Magic Link envoyé par SMS au ${telephone}.`,
      data: {
        prenom: talent.prenom,
        codeYira: talent.codeYira,
      },
    });
  } catch (error) {
    console.error("[API/Magic-Link] Erreur:", error);
    return NextResponse.json(
      { error: "Erreur serveur. Veuillez réessayer." },
      { status: 500 }
    );
  }
}
