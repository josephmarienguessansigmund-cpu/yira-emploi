/**
 * YIRA – API de Synchronisation Omnicanale
 * GET /api/sync?telephone=... — Fusionne les données USSD, Web et App par numéro de téléphone
 * POST /api/sync — Met à jour le profil unifié depuis n'importe quel canal
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

// Normaliser le numéro de téléphone (tous canaux)
function normalizePhone(telephone: string): string {
  let phone = telephone.replace(/[\s\-()]/g, "");
  if (phone.startsWith("0") && phone.length === 10) {
    phone = "+225" + phone.substring(1);
  } else if (!phone.startsWith("+") && phone.length === 10) {
    phone = "+225" + phone;
  } else if (phone.startsWith("225") && phone.length === 12) {
    phone = "+" + phone;
  }
  return phone;
}

/**
 * GET — Récupérer le profil unifié par numéro de téléphone
 * Fusionne les données de tous les canaux (USSD, Web, App)
 */
export async function GET(req: NextRequest) {
  const telephone = req.nextUrl.searchParams.get("telephone");

  if (!telephone) {
    return NextResponse.json(
      { error: "Paramètre 'telephone' requis" },
      { status: 400 }
    );
  }

  const phone = normalizePhone(telephone);

  try {
    const talent = await prisma.talent.findUnique({
      where: { telephone: phone },
      include: {
        testsSigmund: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        paiements: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        feedbacks: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        assignedExpert: {
          select: { nom: true, prenom: true, email: true },
        },
      },
    });

    if (!talent) {
      return NextResponse.json(
        { error: "Aucun profil trouvé pour ce numéro." },
        { status: 404 }
      );
    }

    // Profil unifié omnicanal
    return NextResponse.json({
      success: true,
      data: {
        profil: {
          id: talent.id,
          prenom: talent.prenom,
          nom: talent.nom,
          telephone: talent.telephone,
          email: talent.email,
          codeYira: talent.codeYira,
          soldePoints: talent.soldePoints,
          creditFcfa: talent.creditFcfa,
          niveau: talent.niveau,
          specialite: talent.specialite,
          district: talent.district,
          commune: talent.commune,
          situationActuelle: talent.situationActuelle,
          statutParcours: talent.statutParcours,
          canalPrefere: talent.canalPrefere,
        },
        tests: talent.testsSigmund.map((t) => ({
          id: t.id,
          sigmundTestId: t.sigmundTestId,
          completedAt: t.completedAt,
          estValideParExpert: t.estValideParExpert,
          scoreEmployabilite: t.scoreEmployabilite,
          niveauRisque: t.niveauRisque,
        })),
        paiements: talent.paiements.map((p) => ({
          id: p.id,
          montant: p.montant,
          statut: p.statut,
          operateur: p.operateur,
          typePaiement: p.typePaiement,
          date: p.createdAt,
        })),
        expert: talent.assignedExpert
          ? {
              nom: `${talent.assignedExpert.prenom || ""} ${talent.assignedExpert.nom}`.trim(),
              email: talent.assignedExpert.email,
            }
          : null,
        canal: "omnicanal",
        syncedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[API/Sync] Erreur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la synchronisation." },
      { status: 500 }
    );
  }
}

/**
 * POST — Mettre à jour le profil depuis n'importe quel canal
 * Unifie les données en utilisant le numéro de téléphone comme clé
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { telephone, canal, ...updates } = body as {
      telephone: string;
      canal?: string;
      prenom?: string;
      nom?: string;
      email?: string;
      niveau?: string;
      specialite?: string;
      district?: string;
      commune?: string;
      situationActuelle?: string;
      canalPrefere?: string;
      soldePoints?: number;
      creditFcfa?: number;
    };

    if (!telephone) {
      return NextResponse.json(
        { error: "Numéro de téléphone requis" },
        { status: 400 }
      );
    }

    const phone = normalizePhone(telephone);

    // Build update data, excluding undefined values
    const updateData: Record<string, unknown> = {};
    const allowedFields = [
      "prenom",
      "nom",
      "email",
      "niveau",
      "specialite",
      "district",
      "commune",
      "situationActuelle",
      "canalPrefere",
    ];

    for (const field of allowedFields) {
      if (updates[field as keyof typeof updates] !== undefined) {
        updateData[field] = updates[field as keyof typeof updates];
      }
    }

    // Points and credits increments
    if (updates.soldePoints !== undefined) {
      updateData.soldePoints = { increment: updates.soldePoints };
    }
    if (updates.creditFcfa !== undefined) {
      updateData.creditFcfa = { increment: updates.creditFcfa };
    }

    const talent = await prisma.talent.update({
      where: { telephone: phone },
      data: updateData,
    });

    console.log(
      `[Sync] Profil mis à jour via canal ${canal || "inconnu"}: ${phone}`
    );

    return NextResponse.json({
      success: true,
      data: {
        id: talent.id,
        telephone: talent.telephone,
        codeYira: talent.codeYira,
        soldePoints: talent.soldePoints,
        creditFcfa: talent.creditFcfa,
        syncedAt: new Date().toISOString(),
        canal: canal || "api",
      },
    });
  } catch (error) {
    console.error("[API/Sync] Erreur mise à jour:", error);
    return NextResponse.json(
      { error: "Erreur lors de la synchronisation." },
      { status: 500 }
    );
  }
}
