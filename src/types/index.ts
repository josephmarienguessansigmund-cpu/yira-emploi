// ============================================================
// TYPES YIRA EMPLOI - NOHAMA Consulting
// ============================================================

// --- USSD ---

export type USSDSession = {
  sessionId: string;
  serviceCode: string;
  phoneNumber: string;
  text: string;
  networkCode?: string;
};

export type USSDResponse = {
  response: string;
  continueSession: boolean;
};

// Étapes du menu USSD
export type USSDStep =
  | "WELCOME"
  | "MENU_PRINCIPAL"
  | "INSCRIPTION"
  | "EVALUATION"
  | "RESULTATS"
  | "OFFRES"
  | "FIN";

// Profil talent collecté via USSD
export type ProfilTalent = {
  telephone: string;
  prenom?: string;
  nom?: string;
  age?: number;
  niveau_etude?: string;
  secteur_interet?: string;
  region?: string;
  statut?: "NEET" | "EMPLOYE" | "ETUDIANT" | "AUTRE";
};

// --- SIGMUND ---

export type SigmundConfig = {
  clientId: string;      // 8937-6771-8414-4521
  productCode: string;   // 25
  baseUrl: string;
};

export type SigmundTestRequest = {
  candidatId: string;
  telephone: string;
  prenom: string;
  nom: string;
  email?: string;
  typeEvaluation: "BIG_FIVE" | "RIASEC" | "SOFT_SKILLS" | "MOTIVATION" | "COMPLET";
};

export type SigmundTestResult = {
  candidatId: string;
  sessionId: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "EXPIRED";
  lienTest?: string;
  resultats?: SigmundResultats;
  createdAt: string;
  completedAt?: string;
};

export type SigmundResultats = {
  bigFive?: BigFiveScores;
  riasec?: RIASECScores;
  softSkills?: SoftSkillsScores;
  motivation?: MotivationScores;
  profil_global?: string;
  recommandations?: string[];
};

// Big Five / OCEAN
export type BigFiveScores = {
  ouverture: number;        // Openness
  conscienciosite: number;  // Conscientiousness
  extraversion: number;     // Extraversion
  agreabilite: number;      // Agreeableness
  nevrosisme: number;       // Neuroticism
};

// RIASEC / Holland
export type RIASECScores = {
  realiste: number;
  investigateur: number;
  artistique: number;
  social: number;
  entrepreneur: number;
  conventionnel: number;
  code_holland: string; // ex: "SIE"
};

export type SoftSkillsScores = {
  communication: number;
  travail_equipe: number;
  leadership: number;
  adaptabilite: number;
  resolution_problemes: number;
  gestion_stress: number;
};

export type MotivationScores = {
  autonomie: number;
  maitrise: number;
  finalite: number;
  securite: number;
  reconnaissance: number;
};

// --- BASE DE DONNÉES ---

export type Candidat = {
  id: string;
  telephone: string;
  prenom: string;
  nom: string;
  email?: string;
  niveau_etude?: string;
  region?: string;
  statut: "NEET" | "EMPLOYE" | "ETUDIANT" | "AUTRE";
  sigmund_session_id?: string;
  evaluation_status?: "NON_COMMENCE" | "EN_COURS" | "COMPLETE";
  created_at: string;
  updated_at: string;
};

// --- API RESPONSES ---

export type ApiResponse<T> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; code?: string };
