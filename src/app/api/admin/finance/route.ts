/**
 * YIRA – API Admin Finance
 * GET /api/admin/finance — Récapitulatif des recettes
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) {
    return NextResponse.json({ error }, { status: 403 });
  }

  try {
    // Cumul des paiements réussis
    const paiementsSucces = await prisma.paiement.findMany({
      where: { statut: "SUCCESS" },
      orderBy: { createdAt: "desc" },
    });

    const totalRecettes = paiementsSucces.reduce(
      (sum, p) => sum + p.montant,
      0
    );

    // Ventilation par type de paiement
    const parType: Record<string, { count: number; total: number }> = {};
    for (const p of paiementsSucces) {
      const type = p.typePaiement || "AUTRE";
      if (!parType[type]) parType[type] = { count: 0, total: 0 };
      parType[type].count++;
      parType[type].total += p.montant;
    }

    // Ventilation par opérateur
    const parOperateur: Record<string, { count: number; total: number }> = {};
    for (const p of paiementsSucces) {
      const op = p.operateur || "Inconnu";
      if (!parOperateur[op]) parOperateur[op] = { count: 0, total: 0 };
      parOperateur[op].count++;
      parOperateur[op].total += p.montant;
    }

    // Ventilation par mois (derniers 12 mois)
    const parMois: Record<string, { count: number; total: number }> = {};
    for (const p of paiementsSucces) {
      const mois = p.createdAt.toISOString().substring(0, 7); // YYYY-MM
      if (!parMois[mois]) parMois[mois] = { count: 0, total: 0 };
      parMois[mois].count++;
      parMois[mois].total += p.montant;
    }

    // Totaux globaux
    const totalPaiements = await prisma.paiement.count();
    const totalEnAttente = await prisma.paiement.count({
      where: { statut: "pending" },
    });
    const totalEchec = await prisma.paiement.count({
      where: { statut: "ECHEC" },
    });

    // Total des talents inscrits
    const totalTalents = await prisma.talent.count();

    // Derniers paiements (20 plus récents)
    const derniersPaiements = await prisma.paiement.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: {
        talent: {
          select: { prenom: true, nom: true, telephone: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        resume: {
          totalRecettes,
          totalTransactionsSucces: paiementsSucces.length,
          totalPaiements,
          totalEnAttente,
          totalEchec,
          totalTalents,
          devise: "FCFA",
          beneficiaire: "Nohama Consulting",
        },
        ventilationParType: parType,
        ventilationParOperateur: parOperateur,
        ventilationParMois: parMois,
        derniersPaiements: derniersPaiements.map((p) => ({
          id: p.id,
          montant: p.montant,
          statut: p.statut,
          operateur: p.operateur,
          typePaiement: p.typePaiement,
          reference: p.reference,
          talent: `${p.talent.prenom} ${p.talent.nom}`,
          telephone: p.talent.telephone,
          date: p.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("[API/Admin/Finance] Erreur:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des données financières." },
      { status: 500 }
    );
  }
}
