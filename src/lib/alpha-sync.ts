// ============================================================
// lib/alpha-sync.ts — Module de logs de synchronisation ALPHA
// Pont USSD *789# ↔ Backend YIRA
// ============================================================

import { FEATURES, APP_CONFIG } from "./config";

type SyncEvent =
  | "USSD_SESSION_START"
  | "USSD_SESSION_END"
  | "USSD_INPUT"
  | "USSD_INSCRIPTION"
  | "USSD_OFFRES"
  | "USSD_RESULTATS"
  | "SMS_MAGIC_LINK_SENT"
  | "SMS_MAGIC_LINK_FAILED"
  | "PAYMENT_RECEIVED"
  | "PAYMENT_FAILED"
  | "SIGMUND_SESSION_CREATED"
  | "SIGMUND_RESULT_RECEIVED"
  | "AUTH_MAGIC_LINK"
  | "WHITELIST_CHECK";

type SyncLogEntry = {
  timestamp: string;
  event: SyncEvent;
  phone?: string;
  sessionId?: string;
  details?: Record<string, unknown>;
  bridge: string;
};

/**
 * Enregistre un événement de synchronisation ALPHA.
 * Les logs sont préfixés par [ALPHA SYNC] pour faciliter le filtrage.
 */
export function alphaSync(
  event: SyncEvent,
  data: {
    phone?: string;
    sessionId?: string;
    details?: Record<string, unknown>;
  } = {}
): void {
  if (!FEATURES.ALPHA_SYNC_LOGS) return;

  const entry: SyncLogEntry = {
    timestamp: new Date().toISOString(),
    event,
    phone: data.phone ? maskPhone(data.phone) : undefined,
    sessionId: data.sessionId,
    details: data.details,
    bridge: `USSD ${APP_CONFIG.USSD_CODE}`,
  };

  console.log(
    `[ALPHA SYNC] [${entry.event}] ${entry.timestamp} | bridge=${entry.bridge}` +
      (entry.phone ? ` | phone=${entry.phone}` : "") +
      (entry.sessionId ? ` | session=${entry.sessionId}` : "") +
      (entry.details ? ` | ${JSON.stringify(entry.details)}` : "")
  );
}

/**
 * Log structuré pour le démarrage du pont USSD.
 */
export function logBridgeStatus(): void {
  if (!FEATURES.ALPHA_SYNC_LOGS) return;

  console.log("╔══════════════════════════════════════════╗");
  console.log("║     [ALPHA SYNC] PONT USSD *789# ACTIF  ║");
  console.log("║     evaluation.yira-ci.com               ║");
  console.log("║     NOHAMA Consulting                    ║");
  console.log("╚══════════════════════════════════════════╝");
  console.log(`[ALPHA SYNC] Bridge: ${APP_CONFIG.USSD_CODE} → ${APP_CONFIG.PUBLIC_URL}`);
  console.log(`[ALPHA SYNC] Mode: ALPHA | Sync logs: ACTIVE`);
}

/**
 * Masque partiellement un numéro de téléphone pour les logs.
 * Ex: +225070741XXXX
 */
function maskPhone(phone: string): string {
  if (phone.length <= 6) return "***";
  return phone.slice(0, -4) + "XXXX";
}
