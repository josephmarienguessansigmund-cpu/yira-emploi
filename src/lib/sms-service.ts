// ============================================================
// lib/sms-service.ts — Service SMS avec Magic Link
// Compatible Africa's Talking / Orange CI / MTN CI
// ============================================================

import { FEATURES, APP_CONFIG, PRICING, isWhitelisted } from "./config";
import { alphaSync } from "./alpha-sync";
import crypto from "crypto";

// -------------------------------------------------------
// Génération de Magic Link
// -------------------------------------------------------

/**
 * Génère un token sécurisé pour le Magic Link.
 */
function generateMagicToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Construit l'URL complète du Magic Link.
 */
function buildMagicLinkUrl(token: string): string {
  const base = APP_CONFIG.PUBLIC_URL;
  return `${base}/auth/magic?token=${token}`;
}

// -------------------------------------------------------
// Service SMS
// -------------------------------------------------------

export const smsService = {
  /**
   * Envoi de SMS générique.
   * En mode Alpha, seuls les numéros whitelistés reçoivent des SMS.
   */
  send: async (
    to: string,
    message: string
  ): Promise<{ success: boolean; error?: string }> => {
    // Vérification whitelist en mode Alpha
    if (FEATURES.ALPHA_MODE && !isWhitelisted(to)) {
      alphaSync("WHITELIST_CHECK", {
        phone: to,
        details: { allowed: false, reason: "not_in_whitelist" },
      });
      console.warn(`[SMS] Numéro ${to} non whitelisté — SMS non envoyé.`);
      return { success: false, error: "Numéro non autorisé en mode Alpha" };
    }

    alphaSync("WHITELIST_CHECK", {
      phone: to,
      details: { allowed: true },
    });

    if (!FEATURES.SMS_ENABLED) {
      // Mode simulation — log uniquement
      console.log(`[SMS][SIMULATION] → ${to}: ${message}`);
      return { success: true };
    }

    // Envoi réel via Africa's Talking ou autre provider
    try {
      const response = await fetch(
        process.env.SMS_GATEWAY_URL || "https://api.africastalking.com/version1/messaging",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            apiKey: process.env.AT_API_KEY || "",
            Accept: "application/json",
          },
          body: new URLSearchParams({
            username: process.env.AT_USERNAME || "sandbox",
            to,
            message,
            from: process.env.AT_SENDER_ID || "YIRA",
          }).toString(),
        }
      );

      if (!response.ok) {
        throw new Error(`SMS gateway error: ${response.status}`);
      }

      console.log(`[SMS] Envoyé à ${to}`);
      return { success: true };
    } catch (err) {
      console.error("[SMS] Erreur d'envoi:", err);
      return { success: false, error: String(err) };
    }
  },

  /**
   * Envoie un Magic Link de connexion par SMS.
   * Retourne le token généré (pour stockage en base) et le statut.
   */
  sendMagicLink: async (
    phone: string
  ): Promise<{ success: boolean; token?: string; url?: string; error?: string }> => {
    const token = generateMagicToken();
    const url = buildMagicLinkUrl(token);

    const message =
      `YIRA Emploi - Connexion sécurisée\n` +
      `Cliquez sur ce lien pour vous connecter :\n${url}\n` +
      `Ce lien expire dans 15 minutes.\n` +
      `${APP_CONFIG.PUBLISHER}`;

    alphaSync("AUTH_MAGIC_LINK", {
      phone,
      details: { action: "send", tokenPrefix: token.slice(0, 8) },
    });

    const result = await smsService.send(phone, message);

    if (result.success) {
      alphaSync("SMS_MAGIC_LINK_SENT", { phone });
      return { success: true, token, url };
    } else {
      alphaSync("SMS_MAGIC_LINK_FAILED", {
        phone,
        details: { error: result.error },
      });
      return { success: false, error: result.error };
    }
  },

  /**
   * Envoie un SMS avec le lien de test SIGMUND + tarif.
   */
  sendTestLink: async (
    phone: string,
    testUrl: string
  ): Promise<{ success: boolean; error?: string }> => {
    const message =
      `YIRA Emploi: Votre test SIGMUND est prêt.\n` +
      `Cliquez ici: ${testUrl}\n` +
      `Tarif: ${PRICING.EVALUATION_FCFA.toLocaleString("fr-FR")} FCFA\n` +
      `${APP_CONFIG.PUBLISHER}`;

    return smsService.send(phone, message);
  },
};
