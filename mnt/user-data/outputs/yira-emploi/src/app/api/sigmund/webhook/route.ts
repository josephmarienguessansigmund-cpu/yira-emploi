// ============================================================
// src/app/api/sigmund/webhook/route.ts
// Webhook de retour SIGMUND (quand le candidat termine le test)
// Sigmund appelle cette URL avec les résultats
// ============================================================
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

// SIGMUND_CLIENT_ID pour vérification de signature (si supporté)
const SIGMUND_CLIENT_ID = process.env.SIGMUND_CLIENT_ID ?? "8937-6771-8414-4521";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Vérification optionnelle de la signature SIGMUND
    const sigHeader = req.headers.get("x-sigmund-signature");
    if (sigHeader && !verifierSignature(sigHeader, SIGMUND_CLIENT_ID)) {
      console.warn("[Webhook/Sigmund] Signature invalide");
      return NextResponse.json({ error: "Signature invalide" }, { status: 401 });
    }

    const payload = await req.json();
    const {
      session_id,
      external_id,
      status,
      results,
      completed_at,
    } = payload;

    if (!session_id || !status) {
      return NextResponse.json({ error: "Payload incomplet" }, { status: 400 });
    }

    console.info(`[Webhook/Sigmund] Session ${session_id} - Statut: ${status}`);

    if (status === "completed" && results) {
      // Extraire les données clés des résultats
      const profilGlobal = results.profile_summary ?? null;
      const codeHolland = results.riasec?.holland_code ?? null;
      const bigFive = results.big_five ?? null;
      const softSkills = results.soft_skills ?? null;

      // Mettre à jour l'évaluation en base
      await query(
        `UPDATE evaluations
         SET status = 'COMPLETED',
             resultats = $1,
             profil_global = $2,
             code_holland = $3,
             completed_at = $4
         WHERE sigmund_session_id = $5`,
        [
          JSON.stringify(results),
          profilGlobal,
          codeHolland,
          completed_at ?? new Date().toISOString(),
          session_id,
        ]
      );

      // Mettre à jour le statut du candidat
      await query(
        `UPDATE candidats
         SET evaluation_status = 'COMPLETE', updated_at = NOW()
         WHERE sigmund_session_id = $1`,
        [session_id]
      );

      // Log pour suivi NOHAMA
      console.info(
        `[Webhook/Sigmund] Résultats sauvegardés - Session: ${session_id}, Holland: ${codeHolland}, Profil: ${profilGlobal}`
      );
    } else if (status === "expired") {
      await query(
        "UPDATE evaluations SET status = 'EXPIRED' WHERE sigmund_session_id = $1",
        [session_id]
      );
    }

    // Répondre 200 pour accuser réception
    return NextResponse.json({ received: true, session_id }, { status: 200 });
  } catch (err) {
    console.error("[Webhook/Sigmund] Erreur:", err);
    // Retourner 200 quand même pour éviter les retentatives infinies de SIGMUND
    return NextResponse.json(
      { received: false, error: "Erreur interne" },
      { status: 200 }
    );
  }
}

// -------------------------------------------------------
// Vérification de signature basique
// (à adapter selon la doc SIGMUND si signature HMAC supportée)
// -------------------------------------------------------
function verifierSignature(signature: string, clientId: string): boolean {
  // Implémentation basique - adapter selon spec SIGMUND
  return signature.includes(clientId.substring(0, 4));
}
