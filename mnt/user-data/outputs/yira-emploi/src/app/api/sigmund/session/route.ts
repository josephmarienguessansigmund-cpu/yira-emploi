// ============================================================
// src/app/api/sigmund/session/route.ts
// Créer et récupérer des sessions d'évaluation SIGMUND
// Client ID  : 8937-6771-8414-4521 | Produit : 25
// ============================================================
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { creerSessionEvaluation, getResultatSession, envoyerLienTestSMS } from "@/lib/sigmund";
import { query } from "@/lib/db";
import type { ApiResponse, SigmundTestResult } from "@/types";

// Schéma de validation
const CreateSessionSchema = z.object({
  candidatId: z.string().min(1),
  telephone: z.string().min(8),
  prenom: z.string().min(1),
  nom: z.string().min(1),
  email: z.string().email().optional(),
  typeEvaluation: z
    .enum(["BIG_FIVE", "RIASEC", "SOFT_SKILLS", "MOTIVATION", "COMPLET"])
    .default("COMPLET"),
  envoyerSMS: z.boolean().default(true),
});

// -------------------------------------------------------
// POST /api/sigmund/session — Créer une session
// -------------------------------------------------------
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const parsed = CreateSessionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Données invalides", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Vérifier si le candidat existe en base
    const existant = await query<{ telephone: string }>(
      "SELECT telephone FROM candidats WHERE telephone = $1",
      [data.telephone]
    );

    if (existant.length === 0) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "Candidat non trouvé. Inscription via USSD (*789#) requise.",
          code: "CANDIDAT_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    // Créer la session SIGMUND
    const session = await creerSessionEvaluation(data);

    // Sauvegarder la session en base
    await query(
      `INSERT INTO evaluations (candidat_telephone, sigmund_session_id, type_evaluation, status, lien_test, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (sigmund_session_id) DO NOTHING`,
      [
        data.telephone,
        session.sessionId,
        data.typeEvaluation,
        "PENDING",
        session.lienTest,
      ]
    );

    // Mettre à jour le profil candidat
    await query(
      "UPDATE candidats SET sigmund_session_id = $1, evaluation_status = 'EN_COURS', updated_at = NOW() WHERE telephone = $2",
      [session.sessionId, data.telephone]
    );

    // Envoyer le lien par SMS si demandé
    if (data.envoyerSMS && session.lienTest) {
      await envoyerLienTestSMS(data.telephone, session.lienTest);
    }

    return NextResponse.json<ApiResponse<SigmundTestResult>>(
      {
        success: true,
        data: session,
        message: data.envoyerSMS
          ? "Session créée. Lien envoyé par SMS."
          : "Session créée avec succès.",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[API/Sigmund/Session POST] Erreur:", err);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: "Erreur lors de la création de la session SIGMUND.",
        code: "SIGMUND_ERROR",
      },
      { status: 500 }
    );
  }
}

// -------------------------------------------------------
// GET /api/sigmund/session?sessionId=xxx — Récupérer résultats
// -------------------------------------------------------
export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");
  const telephone = searchParams.get("telephone");

  if (!sessionId && !telephone) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "sessionId ou telephone requis", code: "MISSING_PARAM" },
      { status: 400 }
    );
  }

  try {
    let resolvedSessionId = sessionId;

    // Résoudre via téléphone si sessionId non fourni
    if (!resolvedSessionId && telephone) {
      const rows = await query<{ sigmund_session_id: string }>(
        "SELECT sigmund_session_id FROM candidats WHERE telephone = $1",
        [telephone]
      );
      if (rows.length === 0 || !rows[0].sigmund_session_id) {
        return NextResponse.json<ApiResponse<null>>(
          { success: false, error: "Aucune session trouvée pour ce numéro.", code: "NOT_FOUND" },
          { status: 404 }
        );
      }
      resolvedSessionId = rows[0].sigmund_session_id;
    }

    const result = await getResultatSession(resolvedSessionId!);

    // Mettre à jour le statut en base si complété
    if (result.status === "COMPLETED") {
      await query(
        `UPDATE evaluations
         SET status = 'COMPLETED', resultats = $1, completed_at = NOW()
         WHERE sigmund_session_id = $2`,
        [JSON.stringify(result.resultats ?? {}), resolvedSessionId]
      );
      await query(
        "UPDATE candidats SET evaluation_status = 'COMPLETE', updated_at = NOW() WHERE sigmund_session_id = $1",
        [resolvedSessionId]
      );
    }

    return NextResponse.json<ApiResponse<SigmundTestResult>>({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error("[API/Sigmund/Session GET] Erreur:", err);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Erreur lors de la récupération des résultats.", code: "FETCH_ERROR" },
      { status: 500 }
    );
  }
}
