// ============================================================
// lib/payment-service.ts — Service de paiement Mobile Money
// Intégration Africa's Talking pour Orange, MTN, Moov
// ============================================================

const AfricasTalking = require("africastalking");

const AT_USERNAME = process.env.AT_USERNAME ?? "sandbox";
const AT_API_KEY = process.env.AT_API_KEY ?? "";

function createPaymentClient() {
  if (!AT_API_KEY) {
    console.warn("[Payment] AT_API_KEY non configurée — paiements désactivés");
    return null;
  }

  const client = AfricasTalking({
    apiKey: AT_API_KEY,
    username: AT_USERNAME,
  });

  return client.PAYMENTS;
}

// Tarifs en FCFA
export const TARIFS = {
  QUIZ_PREMIUM: 500,
  RAPPORT_SIGMUND: 1000,
  PACK_COMPLET: 1200,
} as const;

export type TypeProduit = keyof typeof TARIFS;

// Détection de l'opérateur à partir du numéro
function detecterOperateur(telephone: string): string {
  const num = telephone.replace(/\D/g, "").slice(-8);
  const prefix = num.substring(0, 2);
  if (["07", "08", "09"].includes(prefix)) return "Orange";
  if (["05", "06"].includes(prefix)) return "MTN";
  if (["01", "02", "03"].includes(prefix)) return "Moov";
  return "Inconnu";
}

interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export const paymentService = {
  /**
   * Initier un paiement Mobile Money via Africa's Talking
   */
  initierPaiement: async (
    telephone: string,
    montant: number,
    productName: string = "YIRA Emploi"
  ): Promise<PaymentResult> => {
    const payments = createPaymentClient();

    if (!payments) {
      console.log(
        `[Payment STUB] Initiation paiement: ${telephone} - ${montant} FCFA`
      );
      return {
        success: false,
        error: "Service de paiement non configuré (AT_API_KEY manquante)",
      };
    }

    const operateur = detecterOperateur(telephone);

    // Mapping opérateur → providerChannel Africa's Talking
    const providerChannels: Record<string, string> = {
      Orange: "Athena",
      MTN: "Athena",
      Moov: "Athena",
    };

    try {
      const result = await payments.mobileCheckout({
        productName,
        phoneNumber: telephone,
        currencyCode: "XOF",
        amount: montant,
        providerChannel: providerChannels[operateur] || "Athena",
        metadata: {
          operateur,
          plateforme: "YIRA",
        },
      });

      console.log(
        `[Payment] Checkout initié: ${telephone} - ${montant} XOF (${operateur})`,
        JSON.stringify(result)
      );

      if (
        result.status === "PendingConfirmation" ||
        result.status === "Success"
      ) {
        return {
          success: true,
          transactionId: result.transactionId,
        };
      }

      return {
        success: false,
        error: result.description || "Paiement refusé",
      };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur inconnue";
      console.error(`[Payment] Erreur checkout ${telephone}:`, errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Obtenir le tarif d'un produit
   */
  getTarif: (type: TypeProduit): number => {
    return TARIFS[type] || 0;
  },

  /**
   * Détecter l'opérateur depuis le numéro
   */
  detecterOperateur,
};
