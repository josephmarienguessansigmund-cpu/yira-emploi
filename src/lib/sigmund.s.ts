// ============================================================
// lib/sigmund.ts — Client pour l'API SIGMUND
// ID Client  : 8937-6771-8414-4521
// Produit    : 25
// ============================================================
import axios, { AxiosInstance } from "axios";
import type {
  SigmundTestRequest,
  SigmundTestResult,
  SigmundResultats,
} from "@/types";

const SIGMUND_CLIENT_ID =
  process.env.SIGMUND_CLIENT_ID ?? "8937-6771-8414-4521";
const SIGMUND_PRODUCT_CODE =
  process.env.SIGMUND_PRODUCT_CODE ?? "25";
const SIGMUND_BASE_URL =
  process.env.SIGMUND_BASE_URL ?? "https://api.sigmund-assessment.com/v1";

// Création du client HTTP Sigmund
function createSigmundClient(): AxiosInstance {
  return axios.create({
    baseURL: SIGMUND_BASE_URL,
    timeout: 15000,
    headers: {
      "Content-Type": "application/json",
      "X-Client-ID": SIGMUND_CLIENT_ID,
      "X-Product-Code": SIGMUND_PRODUCT_CODE,
    },
  });
}

// -------------------------------------------------------
// Créer une session d'évaluation pour un candidat
// -------------------------------------------------------
export async function creerSessionEvaluation(
  req: SigmundTestRequest
): Promise<SigmundTestResult> {
  const client = createSigmundClient();

  const payload = {
    client_id: SIGMUND_CLIENT_ID,
    product_code: SIGMUND_PRODUCT_CODE,
    candidate: {
      external_id: req.candidatId,
      phone: req.telephone,
      first_name: req.prenom,
      last_name: req.nom,
      email: req.email ?? null,
    },
    assessment_type: mapTypeEvaluation(req.typeEvaluation),
    language: "fr",
    return_url: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/api/sigmund/webhook`,
  };

  const response = await client.post("/sessions", payload);
  const data = response.data;

  return {
    candidatId: req.candidatId,
    sessionId: data.session_id,
    status: "PENDING",
    lienTest: data.test_url,
    createdAt: new Date().toISOString(),
  };
}

// -------------------------------------------------------
// Récupérer le statut et les résultats d'une session
// -------------------------------------------------------
export async function getResultatSession(
  sessionId: string
): Promise<SigmundTestResult> {
  const client = createSigmundClient();
  const response = await client.get(`/sessions/${sessionId}`);
  const data = response.data;

  const result: SigmundTestResult = {
    candidatId: data.external_id,
    sessionId: data.session_id,
    status: mapStatutSession(data.status),
    lienTest: data.test_url,
    createdAt: data.created_at,
    completedAt: data.completed_at ?? undefined,
  };

  if (data.status === "completed" && data.results) {
    result.resultats = parseResultats(data.results);
  }

  return result;
}

// -------------------------------------------------------
// Envoyer le lien de test par SMS via USSD gateway
// (le lien court permet de répondre sur feature phone)
// -------------------------------------------------------
export async function envoyerLienTestSMS(
  telephone: string,
  lienTest: string
): Promise<boolean> {
  try {
    const client = createSigmundClient();
    await client.post("/notifications/sms", {
      client_id: SIGMUND_CLIENT_ID,
      phone: telephone,
      message: `YIRA Emploi: Votre test SIGMUND est prêt. Cliquez ici: ${lienTest} - NOHAMA Consulting`,
    });
    return true;
  } catch (err) {
    console.error("[Sigmund] Erreur envoi SMS:", err);
    return false;
  }
}

// -------------------------------------------------------
// Helpers internes
// -------------------------------------------------------

function mapTypeEvaluation(type: SigmundTestRequest["typeEvaluation"]): string {
  const map: Record<string, string> = {
    BIG_FIVE: "big_five",
    RIASEC: "riasec",
    SOFT_SKILLS: "soft_skills",
    MOTIVATION: "motivation",
    COMPLET: "full_assessment",
  };
  return map[type] ?? "full_assessment";
}

function mapStatutSession(
  status: string
): SigmundTestResult["status"] {
  const map: Record<string, SigmundTestResult["status"]> = {
    pending: "PENDING",
    in_progress: "IN_PROGRESS",
    completed: "COMPLETED",
    expired: "EXPIRED",
  };
  return map[status] ?? "PENDING";
}

function parseResultats(raw: Record<string, unknown>): SigmundResultats {
  return {
    bigFive: raw.big_five
      ? {
          ouverture: (raw.big_five as Record<string, number>).openness,
          conscienciosite: (raw.big_five as Record<string, number>).conscientiousness,
          extraversion: (raw.big_five as Record<string, number>).extraversion,
          agreabilite: (raw.big_five as Record<string, number>).agreeableness,
          nevrosisme: (raw.big_five as Record<string, number>).neuroticism,
        }
      : undefined,
    riasec: raw.riasec
      ? {
          realiste: (raw.riasec as Record<string, number>).realistic,
          investigateur: (raw.riasec as Record<string, number>).investigative,
          artistique: (raw.riasec as Record<string, number>).artistic,
          social: (raw.riasec as Record<string, number>).social,
          entrepreneur: (raw.riasec as Record<string, number>).enterprising,
          conventionnel: (raw.riasec as Record<string, number>).conventional,
          code_holland: (raw.riasec as Record<string, string>).holland_code ?? "",
        }
      : undefined,
    profil_global: (raw.profile_summary as string) ?? undefined,
    recommandations: (raw.recommendations as string[]) ?? [],
  };
}
