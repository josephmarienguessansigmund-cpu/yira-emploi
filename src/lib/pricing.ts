// ============================================================
// lib/pricing.ts — Moteur de Tarification Dynamique YIRA
// Prix configurables via variables d'environnement Netlify
// ============================================================

export type ModuleType =
  | "FULL_EVAL"
  | "BIG_FIVE"
  | "RIASEC"
  | "SOFT_SKILLS"
  | "MOTIVATION";

// Prix par défaut en FCFA
const DEFAULT_PRICES: Record<ModuleType, number> = {
  FULL_EVAL: 25000,
  BIG_FIVE: 10000,
  RIASEC: 10000,
  SOFT_SKILLS: 10000,
  MOTIVATION: 10000,
};

// Mapping vers les variables d'environnement
const ENV_KEYS: Record<ModuleType, string> = {
  FULL_EVAL: "PRICE_FULL_EVAL",
  BIG_FIVE: "PRICE_BIG_FIVE",
  RIASEC: "PRICE_RIASEC",
  SOFT_SKILLS: "PRICE_SOFT_SKILLS",
  MOTIVATION: "PRICE_MOTIVATION",
};

/**
 * Récupère le prix d'un module d'évaluation.
 * Priorité : variable d'environnement > prix par défaut.
 */
export function getModulePrice(moduleType: ModuleType): number {
  const envKey = ENV_KEYS[moduleType];
  const envValue = process.env[envKey];

  if (envValue) {
    const parsed = parseInt(envValue, 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }

  return DEFAULT_PRICES[moduleType];
}

/**
 * Récupère tous les prix des modules.
 */
export function getAllModulePrices(): Record<ModuleType, number> {
  const modules = Object.keys(DEFAULT_PRICES) as ModuleType[];
  const prices: Record<string, number> = {};

  for (const mod of modules) {
    prices[mod] = getModulePrice(mod);
  }

  return prices as Record<ModuleType, number>;
}

// Labels lisibles pour l'affichage frontend
export const MODULE_LABELS: Record<ModuleType, string> = {
  FULL_EVAL: "Évaluation Complète Sigmund",
  BIG_FIVE: "Test Big Five (Personnalité)",
  RIASEC: "Test RIASEC (Intérêts Holland)",
  SOFT_SKILLS: "Test Soft Skills",
  MOTIVATION: "Test Motivation",
};

// Descriptions courtes pour les cartes
export const MODULE_DESCRIPTIONS: Record<ModuleType, string> = {
  FULL_EVAL:
    "Pack complet : Big Five + RIASEC + Soft Skills + Motivation. Rapport Sigmund détaillé avec synthèse IA.",
  BIG_FIVE:
    "Évalue vos 5 traits de personnalité (OCEAN) pour identifier vos forces professionnelles.",
  RIASEC:
    "Découvrez votre profil Holland (6 types) et les métiers qui vous correspondent.",
  SOFT_SKILLS:
    "Mesurez vos compétences transversales : communication, leadership, adaptabilité.",
  MOTIVATION:
    "Identifiez vos facteurs de motivation pour trouver un emploi épanouissant.",
};
