// ============================================================
// lib/whitelist.ts — Système de Whitelisting Alpha YIRA
// Numéros prioritaires autorisés à accéder à tous les modules
// sans blocage de paiement pendant la phase de test.
// ============================================================

// Numéros de test Alpha (format local CI)
const ALPHA_NUMBERS_LOCAL = [
  "0707417187",
  "0140779541",
  "0707882870",
  "0708647166",
];

/**
 * Normalise un numéro de téléphone ivoirien vers le format local (10 chiffres).
 */
function normalizeToLocal(phone: string): string {
  let num = phone.replace(/[\s\-+]/g, "");
  // Retirer le préfixe +225
  if (num.startsWith("225") && num.length >= 13) {
    num = "0" + num.slice(3);
  }
  // Ajouter le 0 si nécessaire
  if (!num.startsWith("0") && num.length === 9) {
    num = "0" + num;
  }
  return num;
}

/**
 * Vérifie si un numéro de téléphone est dans la whitelist Alpha.
 */
export function isAlphaUser(telephone: string): boolean {
  const normalized = normalizeToLocal(telephone);
  return ALPHA_NUMBERS_LOCAL.includes(normalized);
}

/**
 * Retourne la liste des numéros Alpha (format local).
 */
export function getAlphaNumbers(): string[] {
  return [...ALPHA_NUMBERS_LOCAL];
}

/**
 * Retourne la liste des numéros Alpha au format international (+225).
 */
export function getAlphaNumbersInternational(): string[] {
  return ALPHA_NUMBERS_LOCAL.map((num) => "+225" + num.substring(1));
}
