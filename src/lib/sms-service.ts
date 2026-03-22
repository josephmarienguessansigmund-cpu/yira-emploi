// ============================================================
// lib/sms-service.ts — Service SMS via Africa's Talking
// Envoi de SMS pour notifications, liens test Sigmund, confirmations
// ============================================================

// africastalking est un module CommonJS
// eslint-disable-next-line @typescript-eslint/no-var-requires
const AfricasTalking = require("africastalking");

const AT_USERNAME = process.env.AT_USERNAME ?? "sandbox";
const AT_API_KEY = process.env.AT_API_KEY ?? "";

function createATClient() {
  if (!AT_API_KEY) {
    console.warn("[SMS] AT_API_KEY non configurée — SMS désactivés");
    return null;
  }

  const client = AfricasTalking({
    apiKey: AT_API_KEY,
    username: AT_USERNAME,
  });

  return client.SMS;
}

interface SMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export const smsService = {
  /**
   * Envoyer un SMS à un destinataire unique
   */
  send: async (to: string, message: string): Promise<SMSResult> => {
    const sms = createATClient();

    if (!sms) {
      console.log(`[SMS STUB] Envoi à ${to}: ${message}`);
      return { success: false, error: "AT_API_KEY non configurée" };
    }

    try {
      const result = await sms.send({
        to: [to],
        message,
        from: "YIRA", // Sender ID (doit être approuvé par Africa's Talking)
      });

      const recipients = result?.SMSMessageData?.Recipients;
      if (recipients && recipients.length > 0) {
        const recipient = recipients[0];
        console.log(
          `[SMS] Envoyé à ${to} — status: ${recipient.status}, messageId: ${recipient.messageId}`
        );
        return {
          success: recipient.status === "Success",
          messageId: recipient.messageId,
        };
      }

      console.log(`[SMS] Réponse AT:`, JSON.stringify(result));
      return { success: true };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur inconnue";
      console.error(`[SMS] Erreur envoi à ${to}:`, errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Envoyer un SMS à plusieurs destinataires
   */
  sendBulk: async (
    recipients: string[],
    message: string
  ): Promise<SMSResult> => {
    const sms = createATClient();

    if (!sms) {
      console.log(
        `[SMS STUB] Envoi bulk à ${recipients.length} destinataires`
      );
      return { success: false, error: "AT_API_KEY non configurée" };
    }

    try {
      const result = await sms.send({
        to: recipients,
        message,
        from: "YIRA",
      });

      console.log(
        `[SMS] Bulk envoyé à ${recipients.length} destinataires:`,
        JSON.stringify(result?.SMSMessageData?.Recipients?.length ?? 0)
      );
      return { success: true };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur inconnue";
      console.error(`[SMS] Erreur bulk:`, errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Envoyer le lien du test Sigmund par SMS
   */
  sendTestLink: async (to: string, lienTest: string): Promise<SMSResult> => {
    const message =
      `YIRA Emploi: Votre test SIGMUND est pret. ` +
      `Cliquez ici: ${lienTest} - NOHAMA Consulting`;
    return smsService.send(to, message);
  },

  /**
   * Envoyer la confirmation d'inscription avec le code YIRA
   */
  sendInscriptionConfirmation: async (
    to: string,
    prenom: string,
    codeYira: string
  ): Promise<SMSResult> => {
    const message =
      `Bienvenue ${prenom} sur YIRA Emploi! ` +
      `Votre code: ${codeYira}. ` +
      `Félicitations! Tu as gagné 50 points. ` +
      `Télécharge l'App YIRA: https://yira-emploi.netlify.app/app?tel=${encodeURIComponent(to)} pour réclamer tes lots et voir ton analyse Sigmund. ` +
      `NOHAMA Consulting`;
    return smsService.send(to, message);
  },
};
