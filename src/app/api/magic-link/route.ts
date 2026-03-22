/**
 * YIRA – Magic Link API
 * POST /api/magic-link — Génère et envoie un Magic Link par SMS
 * Le lien permet une connexion directe à l'interface mobile.
 */

import { NextRequest, NextResponse } from "next/server";
import { isAlphaUser } from "@/lib/whitelist";
import { smsService } from "@/lib/sms-service";
import prisma from "@/lib/db";
import crypto from "crypto";

export const dynamic = "force-dynamic";

// Store des magic tokens (en production: Redis ou DB)
const magicTokenStore = new Map<
  string,
  { telephone: string; talentId: string; expiresAt: number }
>();

// Nettoyage automatique toutes les 5 min
setInterval(() => {
  const now = Date.now();
  const keys = Array.from(magicTokenStore.keys());
  for (const key of keys) {
    const val = magicTokenStore.get(key);
    if (val && val.expiresAt < now) magicTokenStore.delete(key);
  }
}, 5 * 60 * 1000);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, telephone, token } = body as {
      action: "generate" | "verify";
      telephone?: string;
      token?: string;
    };

    if (action === "generate") {
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

      // Vérifier que le talent existe
      const talent = await prisma.talent.findUnique({
        where: { telephone: phone },
      });

      if (!talent) {
        return NextResponse.json(
          { error: "Aucun profil trouvé pour ce numéro." },
          { status: 404 }
        );
      }

      // Générer un token unique
      const magicToken = crypto.randomBytes(32).toString("hex");

      // Stocker le token (expire dans 24h)
      magicTokenStore.set(magicToken, {
        telephone: phone,
        talentId: talent.id,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      });

      // Construire le lien
      const baseUrl =
        process.env.SITE_URL || "https://yira-evaluationpro.netlify.app";
      const magicLink = `${baseUrl}/app?token=${magicToken}&tel=${encodeURIComponent(phone)}`;

      // Envoyer le SMS
      const message =
        `YIRA Emploi: Bonjour ${talent.prenom}! ` +
        `Accédez directement à votre profil YIRA: ${magicLink} ` +
        `Ce lien est valide 24h. NOHAMA Consulting`;

      const smsResult = await smsService.send(phone, message);

      // Logs spécifiques pour les comptes Alpha
      if (isAlphaUser(telephone)) {
        console.log(
          `[ALPHA SYNC LOG] Magic Link généré pour Alpha ${phone} — Token: ${magicToken.substring(0, 8)}... — SMS envoyé: ${smsResult.success}`
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          telephone: phone,
          magicLink,
          smsSent: smsResult.success,
          expiresIn: "24h",
          isAlpha: isAlphaUser(telephone),
          message: smsResult.success
            ? "Magic Link envoyé par SMS."
            : "Magic Link généré (SMS non envoyé — vérifiez AT_API_KEY).",
        },
      });
    }

    if (action === "verify") {
      if (!token) {
        return NextResponse.json(
          { error: "Token requis" },
          { status: 400 }
        );
      }

      const stored = magicTokenStore.get(token);
      if (!stored) {
        return NextResponse.json(
          { error: "Lien invalide ou expiré." },
          { status: 404 }
        );
      }

      if (stored.expiresAt < Date.now()) {
        magicTokenStore.delete(token);
        return NextResponse.json(
          { error: "Ce lien a expiré. Demandez un nouveau lien." },
          { status: 410 }
        );
      }

      // Récupérer le profil talent
      const talent = await prisma.talent.findUnique({
        where: { id: stored.talentId },
        include: {
          testsSigmund: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      });

      // Invalider le token après utilisation
      magicTokenStore.delete(token);

      if (isAlphaUser(stored.telephone)) {
        console.log(
          `[ALPHA SYNC LOG] Magic Link vérifié pour Alpha ${stored.telephone} — Accès accordé`
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          authenticated: true,
          talentId: stored.talentId,
          telephone: stored.telephone,
          prenom: talent?.prenom,
          nom: talent?.nom,
          codeYira: talent?.codeYira,
          soldePoints: talent?.soldePoints,
          creditFcfa: talent?.creditFcfa,
          isAlpha: isAlphaUser(stored.telephone),
        },
      });
    }

    return NextResponse.json(
      { error: "Action invalide. Utilisez 'generate' ou 'verify'." },
      { status: 400 }
    );
  } catch (error) {
    console.error("[API/MagicLink] Erreur:", error);
    return NextResponse.json(
      { error: "Erreur serveur." },
      { status: 500 }
    );
  }
}
