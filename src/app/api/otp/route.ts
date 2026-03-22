/**
 * YIRA – OTP Verification API
 * POST /api/otp/send — Envoyer un code OTP par SMS
 * POST /api/otp/verify — Vérifier un code OTP
 */

import { NextRequest, NextResponse } from "next/server";
import { smsService } from "@/lib/sms-service";

export const dynamic = "force-dynamic";

// Store OTP en mémoire (en production: Redis)
const otpStore = new Map<
  string,
  { code: string; expiresAt: number; attempts: number }
>();

// Nettoyage automatique
setInterval(() => {
  const now = Date.now();
  const keys = Array.from(otpStore.keys());
  for (const key of keys) {
    const val = otpStore.get(key);
    if (val && val.expiresAt < now) otpStore.delete(key);
  }
}, 60 * 1000);

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, telephone, code } = body as {
      action: "send" | "verify";
      telephone: string;
      code?: string;
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

    if (action === "send") {
      // Vérifier le rate limiting (max 3 envois par 10 minutes)
      const existing = otpStore.get(phone);
      if (existing && existing.expiresAt > Date.now() && existing.attempts >= 3) {
        return NextResponse.json(
          { error: "Trop de tentatives. Réessayez dans quelques minutes." },
          { status: 429 }
        );
      }

      const otpCode = generateOTP();
      otpStore.set(phone, {
        code: otpCode,
        expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
        attempts: (existing?.attempts || 0) + 1,
      });

      // Envoyer le SMS via Africa's Talking
      const message = `YIRA Emploi: Votre code de verification est ${otpCode}. Valide 5 minutes. Ne partagez ce code avec personne.`;
      const result = await smsService.send(phone, message);

      return NextResponse.json({
        success: true,
        message: "Code OTP envoyé par SMS.",
        sent: result.success,
      });
    }

    if (action === "verify") {
      if (!code) {
        return NextResponse.json(
          { error: "Code OTP requis" },
          { status: 400 }
        );
      }

      const stored = otpStore.get(phone);
      if (!stored) {
        return NextResponse.json(
          { error: "Aucun code OTP trouvé. Demandez un nouveau code." },
          { status: 404 }
        );
      }

      if (stored.expiresAt < Date.now()) {
        otpStore.delete(phone);
        return NextResponse.json(
          { error: "Code OTP expiré. Demandez un nouveau code." },
          { status: 410 }
        );
      }

      if (stored.code !== code) {
        return NextResponse.json(
          { error: "Code OTP incorrect." },
          { status: 400 }
        );
      }

      // OTP valide — supprimer du store
      otpStore.delete(phone);

      return NextResponse.json({
        success: true,
        verified: true,
        message: "Numéro vérifié avec succès.",
      });
    }

    return NextResponse.json(
      { error: "Action invalide. Utilisez 'send' ou 'verify'." },
      { status: 400 }
    );
  } catch (error) {
    console.error("[API/OTP] Erreur:", error);
    return NextResponse.json(
      { error: "Erreur serveur." },
      { status: 500 }
    );
  }
}
