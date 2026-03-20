// ============================================================
// src/app/api/ussd/route.ts
// Endpoint USSD — Compatible Africa's Talking, Orange CI, MTN CI
// Code USSD : *789# (exemple)
// ============================================================
import { NextRequest, NextResponse } from "next/server";
import { handleUSSD } from "@/lib/ussd-engine";
import type { USSDSession } from "@/types";

export const dynamic = 'force-dynamic';

// Africa's Talking envoie via POST form-urlencoded
// Orange/MTN CI peuvent envoyer via GET ou POST JSON
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const contentType = req.headers.get("content-type") ?? "";
    let session: USSDSession;

    if (contentType.includes("application/x-www-form-urlencoded")) {
      // Africa's Talking format
      const formData = await req.formData();
      session = {
        sessionId: formData.get("sessionId")?.toString() ?? "",
        serviceCode: formData.get("serviceCode")?.toString() ?? "*789#",
        phoneNumber: normalizePhone(formData.get("phoneNumber")?.toString() ?? ""),
        text: formData.get("text")?.toString() ?? "",
        networkCode: formData.get("networkCode")?.toString(),
      };
    } else {
      // JSON format (Orange CI, MTN CI ou tests internes)
      const body = await req.json();
      session = {
        sessionId: body.sessionId ?? body.session_id ?? "",
        serviceCode: body.serviceCode ?? body.service_code ?? "*789#",
        phoneNumber: normalizePhone(body.phoneNumber ?? body.phone_number ?? body.msisdn ?? ""),
        text: body.text ?? body.input ?? "",
        networkCode: body.networkCode ?? body.network_code,
      };
    }

    // Validation minimale
    if (!session.sessionId || !session.phoneNumber) {
      return NextResponse.json(
        { error: "sessionId et phoneNumber sont requis" },
        { status: 400 }
      );
    }

    // Traitement du menu USSD
    const result = await handleUSSD(session);

    // Réponse au format Africa's Talking
    const prefix = result.continueSession ? "CON " : "END ";
    return new NextResponse(prefix + result.response, {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    console.error("[API/USSD] Erreur:", err);
    return new NextResponse(
      "END Une erreur est survenue. Veuillez réessayer.",
      { status: 200, headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  }
}

// Support GET pour certains opérateurs CI
export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const session: USSDSession = {
    sessionId: searchParams.get("sessionId") ?? searchParams.get("session_id") ?? "",
    serviceCode: searchParams.get("serviceCode") ?? "*789#",
    phoneNumber: normalizePhone(
      searchParams.get("phoneNumber") ?? searchParams.get("msisdn") ?? ""
    ),
    text: searchParams.get("text") ?? searchParams.get("input") ?? "",
    networkCode: searchParams.get("networkCode") ?? undefined,
  };

  if (!session.sessionId || !session.phoneNumber) {
    return NextResponse.json(
      { error: "Paramètres manquants" },
      { status: 400 }
    );
  }

  try {
    const result = await handleUSSD(session);
    const prefix = result.continueSession ? "CON " : "END ";
    return new NextResponse(prefix + result.response, {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    console.error("[API/USSD GET] Erreur:", err);
    return new NextResponse("END Erreur système. Réessayez.", {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

// OPTIONS pour preflight CORS
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

// -------------------------------------------------------
// Normaliser le numéro de téléphone (CI = +225)
// -------------------------------------------------------
function normalizePhone(phone: string): string {
  if (!phone) return "";
  // Retirer les espaces et tirets
  let clean = phone.replace(/[\s-]/g, "");
  // Ajouter l'indicatif CI si absent
  if (clean.startsWith("0") && clean.length === 10) {
    clean = "+225" + clean.substring(1);
  } else if (!clean.startsWith("+") && clean.length === 10) {
    clean = "+225" + clean;
  }
  return clean;
}
