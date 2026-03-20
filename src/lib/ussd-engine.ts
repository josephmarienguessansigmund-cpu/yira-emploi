// ============================================================
// lib/ussd-engine.ts — Machine à états pour le menu USSD
// Compatible Africa's Talking / MTN CI / Orange CI
// ============================================================
import type { USSDSession, USSDResponse, ProfilTalent } from "@/types";
import prisma from "./db";

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
        return await menuOffres();
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
    const profil: ProfilTalent = {
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
async function menuOffres(): Promise<USSDResponse> {
  // No job offers table exists yet — return a placeholder message
  return {
    continueSession: false,
    response: "Aucune offre disponible pour le moment.\nRevenez bientôt !",
  };
}

// -------------------------------------------------------
// Menu résultats SIGMUND
// -------------------------------------------------------
async function menuResultats(phone: string): Promise<USSDResponse> {
  try {
    const talent = await prisma.talent.findUnique({
      where: { telephone: phone },
      include: {
        testsSigmund: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!talent) {
      return {
        continueSession: false,
        response: "Aucun profil trouvé.\nInscrivez-vous d'abord : *789# > 1",
      };
    }

    if (talent.testsSigmund.length === 0) {
      return {
        continueSession: false,
        response:
          "Aucun test SIGMUND trouvé.\nPassez votre évaluation via le lien SMS reçu.",
      };
    }

    const test = talent.testsSigmund[0];

    if (!test.completedAt) {
      return {
        continueSession: false,
        response:
          "Votre test SIGMUND est en cours.\nComplétez-le via le lien SMS reçu.",
      };
    }

    // Parse rapport if available
    let profilGlobal = "N/A";
    let codeHolland = "N/A";
    if (test.rapport) {
      try {
        const rapport = JSON.parse(test.rapport);
        profilGlobal = rapport.profil_global || rapport.profile_summary || "N/A";
        codeHolland = rapport.riasec?.holland_code || rapport.code_holland || "N/A";
      } catch {
        // rapport is not valid JSON
      }
    }

    return {
      continueSession: false,
      response:
        `VOS RÉSULTATS SIGMUND\n` +
        `Profil: ${profilGlobal}\n` +
        `Code Holland: ${codeHolland}\n` +
        `Pour le rapport complet: rapport@nohama.ci`,
    };
  } catch (err) {
    console.error("[USSD] Erreur résultats:", err);
    return {
      continueSession: false,
      response: "Service résultats temporairement indisponible.",
    };
  }
}

// -------------------------------------------------------
// Persistence en base — using Prisma Talent model
// -------------------------------------------------------
async function sauvegarderProfil(profil: ProfilTalent): Promise<void> {
  await prisma.talent.upsert({
    where: { telephone: profil.telephone },
    create: {
      telephone: profil.telephone,
      prenom: profil.prenom || "",
      nom: profil.nom || "",
      niveau: profil.niveau_etude || null,
      specialite: profil.secteur_interet || null,
      district: profil.region || null,
      situationActuelle: profil.statut || "NEET",
      consentementRGPD: false,
    },
    update: {
      prenom: profil.prenom || undefined,
      nom: profil.nom || undefined,
      niveau: profil.niveau_etude || undefined,
      specialite: profil.secteur_interet || undefined,
      district: profil.region || undefined,
    },
  });
}
