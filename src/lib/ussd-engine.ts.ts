// ============================================================
// lib/ussd-engine.ts — Machine à états pour le menu USSD
// Compatible Africa's Talking / MTN CI / Orange CI
// ============================================================
import type { USSDSession, USSDResponse, ProfilJeune } from "@/types";
import { query } from "./db";

// Store en mémoire pour sessions courtes (< 3min)
// En production: remplacer par Redis ou une table sessions en DB
const sessionStore = new Map<string, Record<string, string>>();

function getState(sessionId: string): Record<string, string> {
  return sessionStore.get(sessionId) ?? {};
}

function setState(sessionId: string, data: Record<string, string>): void {
  const existing = sessionStore.get(sessionId) ?? {};
  sessionStore.set(sessionId, { ...existing, ...data });
  // Auto-nettoyage après 5 minutes
  setTimeout(() => sessionStore.delete(sessionId), 5 * 60 * 1000);
}

// -------------------------------------------------------
// Point d'entrée principal du moteur USSD
// -------------------------------------------------------
export async function handleUSSD(session: USSDSession): Promise<USSDResponse> {
  const { sessionId, phoneNumber, text } = session;
  const inputs = text ? text.split("*") : [];
  const level = inputs.length; // profondeur dans le menu

  // Niveau 0 : accueil
  if (text === "" || text === undefined) {
    setState(sessionId, { phone: phoneNumber, step: "WELCOME" });
    return {
      continueSession: true,
      response: menuBienvenue(),
    };
  }

  const state = getState(sessionId);
  const lastInput = inputs[inputs.length - 1];

  // --- Navigation niveau 1 (menu principal) ---
  if (level === 1) {
    switch (lastInput) {
      case "1":
        setState(sessionId, { step: "INSCRIPTION" });
        return { continueSession: true, response: menuInscription() };
      case "2":
        return await menuOffres(phoneNumber);
      case "3":
        return await menuResultats(phoneNumber);
      case "0":
        return { continueSession: false, response: "Au revoir ! NOHAMA Consulting - YIRA Emploi" };
      default:
        return { continueSession: true, response: menuBienvenue("Choix invalide. ") };
    }
  }

  // --- Inscription multi-étapes ---
  if (state.step === "INSCRIPTION" || state.step?.startsWith("INS_")) {
    return await handleInscription(sessionId, inputs, phoneNumber);
  }

  return { continueSession: false, response: "Session expirée. Composez à nouveau *789#" };
}

// -------------------------------------------------------
// Menus
// -------------------------------------------------------

function menuBienvenue(prefixe = ""): string {
  return (
    `${prefixe}Bienvenue sur YIRA Emploi\n` +
    "Plateforme d'insertion - NOHAMA\n\n" +
    "1. M'inscrire\n" +
    "2. Voir les offres\n" +
    "3. Mes résultats SIGMUND\n" +
    "0. Quitter"
  );
}

function menuInscription(): string {
  return (
    "INSCRIPTION YIRA Emploi\n" +
    "Entrez votre prénom :"
  );
}

// -------------------------------------------------------
// Flux d'inscription pas à pas
// -------------------------------------------------------
async function handleInscription(
  sessionId: string,
  inputs: string[],
  phone: string
): Promise<USSDResponse> {
  const state = getState(sessionId);
  const level = inputs.length;

  // level 2 = prénom
  if (level === 2) {
    setState(sessionId, { step: "INS_NOM", prenom: inputs[1] });
    return { continueSession: true, response: "Entrez votre nom de famille :" };
  }

  // level 3 = nom
  if (level === 3) {
    setState(sessionId, { step: "INS_NIVEAU", nom: inputs[2] });
    return {
      continueSession: true,
      response:
        "Niveau d'étude :\n1. Sans diplôme\n2. BEPC/BEF\n3. BAC\n4. BTS/DUT\n5. Licence+",
    };
  }

  // level 4 = niveau d'étude
  if (level === 4) {
    const niveaux: Record<string, string> = {
      "1": "Sans diplôme",
      "2": "BEPC/BEF",
      "3": "BAC",
      "4": "BTS/DUT",
      "5": "Licence et plus",
    };
    const niveau = niveaux[inputs[3]];
    if (!niveau) {
      return { continueSession: true, response: "Choix invalide.\n1.Sans diplôme 2.BEPC 3.BAC 4.BTS 5.Licence+" };
    }
    setState(sessionId, { step: "INS_SECTEUR", niveau });
    return {
      continueSession: true,
      response:
        "Secteur d'intérêt :\n1. Agriculture\n2. Commerce\n3. Tech/Numérique\n4. BTP\n5. Santé\n6. Éducation",
    };
  }

  // level 5 = secteur
  if (level === 5) {
    const secteurs: Record<string, string> = {
      "1": "Agriculture",
      "2": "Commerce",
      "3": "Tech/Numérique",
      "4": "BTP",
      "5": "Santé",
      "6": "Éducation",
    };
    const secteur = secteurs[inputs[4]];
    if (!secteur) {
      return { continueSession: true, response: "Choix invalide.\n1.Agri 2.Commerce 3.Tech 4.BTP 5.Santé 6.Éducation" };
    }
    setState(sessionId, { step: "INS_REGION", secteur });
    return {
      continueSession: true,
      response:
        "Votre région :\n1. Abidjan\n2. Bouaké\n3. Daloa\n4. Korhogo\n5. San-Pédro\n6. Autre",
    };
  }

  // level 6 = région → enregistrement
  if (level === 6) {
    const regions: Record<string, string> = {
      "1": "Abidjan",
      "2": "Bouaké",
      "3": "Daloa",
      "4": "Korhogo",
      "5": "San-Pédro",
      "6": "Autre",
    };
    const region = regions[inputs[5]];
    if (!region) {
      return { continueSession: true, response: "Choix invalide.\n1.Abidjan 2.Bouaké 3.Daloa 4.Korhogo 5.San-Pédro 6.Autre" };
    }

    // Sauvegarder en base
    const profil: ProfilJeune = {
      telephone: phone,
      prenom: state.prenom,
      nom: state.nom,
      niveau_etude: state.niveau,
      secteur_interet: state.secteur,
      region,
      statut: "NEET",
    };

    try {
      await sauvegarderProfil(profil);
      return {
        continueSession: false,
        response:
          `Inscription réussie ${profil.prenom}!\n` +
          "Vous recevrez un SMS avec le lien pour votre test SIGMUND.\n" +
          "NOHAMA Consulting vous accompagne.",
      };
    } catch (err) {
      console.error("[USSD] Erreur inscription:", err);
      return {
        continueSession: false,
        response: "Erreur lors de l'inscription. Veuillez réessayer. *789#",
      };
    }
  }

  return { continueSession: false, response: "Session expirée. Composez *789#" };
}

// -------------------------------------------------------
// Menu offres d'emploi
// -------------------------------------------------------
async function menuOffres(phone: string): Promise<USSDResponse> {
  try {
    const offres = await query<{ titre: string; secteur: string; region: string }>(
      "SELECT titre, secteur, region FROM offres WHERE statut = 'ACTIVE' ORDER BY created_at DESC LIMIT 3"
    );

    if (offres.length === 0) {
      return {
        continueSession: false,
        response: "Aucune offre disponible pour le moment.\nRevenez bientôt !",
      };
    }

    const liste = offres
      .map((o, i) => `${i + 1}. ${o.titre} (${o.region})`)
      .join("\n");

    return {
      continueSession: false,
      response: `OFFRES DU MOMENT\n${liste}\n\nEnvoyez CV à: recrutement@nohama.ci`,
    };
  } catch {
    return {
      continueSession: false,
      response: "Service offres temporairement indisponible.",
    };
  }
}

// -------------------------------------------------------
// Menu résultats SIGMUND
// -------------------------------------------------------
async function menuResultats(phone: string): Promise<USSDResponse> {
  try {
    const rows = await query<{ status: string; profil_global: string | null; code_holland: string | null }>(
      `SELECT c.sigmund_session_id, e.status, e.profil_global, e.code_holland
       FROM candidats c
       LEFT JOIN evaluations e ON e.candidat_telephone = c.telephone
       WHERE c.telephone = $1
       ORDER BY e.created_at DESC LIMIT 1`,
      [phone]
    );

    if (rows.length === 0) {
      return {
        continueSession: false,
        response: "Aucun profil trouvé.\nInscrivez-vous d'abord : *789# > 1",
      };
    }

    const r = rows[0];
    if (r.status !== "COMPLETED") {
      return {
        continueSession: false,
        response:
          "Votre test SIGMUND est en cours.\nComplétez-le via le lien SMS reçu.",
      };
    }

    return {
      continueSession: false,
      response:
        `VOS RÉSULTATS SIGMUND\n` +
        `Profil: ${r.profil_global ?? "N/A"}\n` +
        `Code Holland: ${r.code_holland ?? "N/A"}\n` +
        `Pour le rapport complet: rapport@nohama.ci`,
    };
  } catch {
    return {
      continueSession: false,
      response: "Service résultats temporairement indisponible.",
    };
  }
}

// -------------------------------------------------------
// Persistence en base
// -------------------------------------------------------
async function sauvegarderProfil(profil: ProfilJeune): Promise<void> {
  await query(
    `INSERT INTO candidats (telephone, prenom, nom, niveau_etude, secteur_interet, region, statut, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
     ON CONFLICT (telephone) DO UPDATE
     SET prenom = EXCLUDED.prenom, nom = EXCLUDED.nom,
         niveau_etude = EXCLUDED.niveau_etude, secteur_interet = EXCLUDED.secteur_interet,
         region = EXCLUDED.region, updated_at = NOW()`,
    [
      profil.telephone,
      profil.prenom,
      profil.nom,
      profil.niveau_etude,
      profil.secteur_interet,
      profil.region,
      profil.statut,
    ]
  );
}
