/**
 * YIRA – Initiation de paiement Mobile Money
 * POST /api/payment/initiate
 * Crée un paiement et lance le checkout via Africa's Talking
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { paymentService, TARIFS, TypeProduit } from "@/lib/payment-service";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { telephone, typeProduit } = body as {
      telephone: string;
      typeProduit?: TypeProduit;
    };

    if (!telephone) {
      return NextResponse.json(
        { error: "Numéro de téléphone requis" },
        { status: 400 }
      );
    }

    // Normaliser le numéro
    let phone = telephone.replace(/[\s-]/g, "");
    if (phone.startsWith("0") && phone.length === 10) {
      phone = "+225" + phone.substring(1);
    } else if (!phone.startsWith("+") && phone.length === 10) {
      phone = "+225" + phone;
    }

    // Vérifier que le talent existe
    const talent = await prisma.talent.findUnique({
      where: { telephone: phone },
    });

    if (!talent) {
      return NextResponse.json(
        { error: "Aucun profil trouvé pour ce numéro. Inscrivez-vous d'abord." },
        { status: 404 }
      );
    }

    const type: TypeProduit = typeProduit || "QUIZ_PREMIUM";
    const montant = TARIFS[type] || TARIFS.QUIZ_PREMIUM;

    const descriptions: Record<string, string> = {
      QUIZ_PREMIUM: "Quiz Premium YIRA",
      RAPPORT_SIGMUND: "Rapport Sigmund complet",
      PACK_COMPLET: "Pack Complet (Quiz + Rapport)",
    };

    // Créer l'enregistrement de paiement
    const paiement = await prisma.paiement.create({
      data: {
        talentId: talent.id,
        montant,
        statut: "pending",
        operateur: paymentService.detecterOperateur(phone),
        typePaiement: type,
        description: descriptions[type] || "Paiement YIRA",
        reference: `YIRA-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      },
    });

    // Lancer le paiement Mobile Money
    const result = await paymentService.initierPaiement(
      phone,
      montant,
      "YIRA Emploi"
    );

    if (result.success) {
      // Mettre à jour la référence avec l'ID de transaction
      await prisma.paiement.update({
        where: { id: paiement.id },
        data: {
          reference: result.transactionId || paiement.reference,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        paiementId: paiement.id,
        montant,
        type,
        description: descriptions[type],
        operateur: paymentService.detecterOperateur(phone),
        statut: result.success ? "en_cours" : "erreur_initiation",
        transactionId: result.transactionId,
        message: result.success
          ? "Veuillez confirmer le paiement sur votre téléphone."
          : result.error || "Le service de paiement est temporairement indisponible.",
      },
    });
  } catch (error) {
    console.error("[API/Payment/Initiate] Erreur:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'initiation du paiement." },
      { status: 500 }
    );
  }
}
