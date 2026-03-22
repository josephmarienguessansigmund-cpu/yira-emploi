// ============================================================
// lib/config.ts — Configuration centrale YIRA Emploi
// evaluation.yira-ci.com — NOHAMA Consulting
// ============================================================

// -------------------------------------------------------
// Tarification évaluation SIGMUND
// -------------------------------------------------------
export const PRICING = {
  /** Montant de l'évaluation SIGMUND en FCFA */
  EVALUATION_FCFA: 25_000,
  /** Devise */
  DEVISE: "XOF",
  /** Libellé affiché */
  LABEL: "Évaluation SIGMUND complète",
  /** Description pour le reçu SMS */
  DESCRIPTION_SMS: "Évaluation YIRA - 25 000 FCFA - NOHAMA Consulting",
} as const;

// -------------------------------------------------------
// Whitelist téléphones autorisés (phase Alpha)
// Format international +225 ou local 07xxxxxxxx
// -------------------------------------------------------
export const ALPHA_WHITELIST: readonly string[] = [
  "+2250707417187",  // Admin principal
  "0707417187",      // Admin principal (format local)
  "+2250505050505",  // Test interne NOHAMA
  "+2250101010101",  // Test interne QA
] as const;

/**
 * Vérifie si un numéro de téléphone est dans la whitelist Alpha.
 * Normalise les deux numéros avant comparaison.
 */
export function isWhitelisted(phone: string): boolean {
  const normalized = normalizePhoneForWhitelist(phone);
  return ALPHA_WHITELIST.some(
    (wp) => normalizePhoneForWhitelist(wp) === normalized
  );
}

function normalizePhoneForWhitelist(phone: string): string {
  let clean = phone.replace(/[\s\-().]/g, "");
  // Supprimer le 0 initial et ajouter +225
  if (clean.startsWith("0") && clean.length === 10) {
    clean = "+225" + clean.substring(1);
  } else if (!clean.startsWith("+") && clean.length >= 8) {
    clean = "+225" + clean;
  }
  return clean;
}

// -------------------------------------------------------
// Feature flags
// -------------------------------------------------------
export const FEATURES = {
  /** Mode Alpha — Restreindre l'accès à la whitelist */
  ALPHA_MODE: true,
  /** Activer les logs de synchronisation ALPHA SYNC */
  ALPHA_SYNC_LOGS: true,
  /** Activer l'envoi réel de SMS (false = log uniquement) */
  SMS_ENABLED: process.env.SMS_ENABLED === "true",
  /** Activer le pont USSD *789# */
  USSD_BRIDGE_ACTIVE: true,
} as const;

// -------------------------------------------------------
// Configuration de l'application
// -------------------------------------------------------
export const APP_CONFIG = {
  /** Nom de l'application */
  APP_NAME: "YIRA Emploi",
  /** Domaine d'évaluation */
  EVALUATION_DOMAIN: "evaluation.yira-ci.com",
  /** URL publique */
  PUBLIC_URL: process.env.NEXT_PUBLIC_APP_URL || "https://evaluation.yira-ci.com",
  /** Code USSD */
  USSD_CODE: "*789#",
  /** Indicatif pays (Côte d'Ivoire) */
  COUNTRY_CODE: "+225",
  /** Éditeur */
  PUBLISHER: "NOHAMA Consulting",
} as const;
