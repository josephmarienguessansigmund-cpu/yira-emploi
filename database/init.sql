-- ============================================================
-- YIRA EMPLOI — NOHAMA Consulting
-- Script d'initialisation PostgreSQL
-- À exécuter une fois sur votre DB (Neon, Supabase, Railway...)
-- ============================================================

-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -------------------------------------------------------
-- Table candidats
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS candidats (
    id                  UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    telephone           VARCHAR(20) UNIQUE NOT NULL,
    prenom              VARCHAR(100),
    nom                 VARCHAR(100),
    email               VARCHAR(255),
    niveau_etude        VARCHAR(50),
    secteur_interet     VARCHAR(100),
    region              VARCHAR(100),
    statut              VARCHAR(20) DEFAULT 'NEET'
                        CHECK (statut IN ('NEET', 'EMPLOYE', 'ETUDIANT', 'AUTRE')),
    sigmund_session_id  VARCHAR(100),
    evaluation_status   VARCHAR(20) DEFAULT 'NON_COMMENCE'
                        CHECK (evaluation_status IN ('NON_COMMENCE', 'EN_COURS', 'COMPLETE')),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------
-- Table évaluations SIGMUND
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS evaluations (
    id                  UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    candidat_telephone  VARCHAR(20) NOT NULL REFERENCES candidats(telephone),
    sigmund_session_id  VARCHAR(100) UNIQUE NOT NULL,
    type_evaluation     VARCHAR(20) DEFAULT 'COMPLET',
    status              VARCHAR(20) DEFAULT 'PENDING'
                        CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'EXPIRED')),
    lien_test           TEXT,
    resultats           JSONB,
    profil_global       TEXT,
    code_holland        VARCHAR(10),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    completed_at        TIMESTAMPTZ
);

-- -------------------------------------------------------
-- Table offres d'emploi
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS offres (
    id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    titre       VARCHAR(200) NOT NULL,
    description TEXT,
    secteur     VARCHAR(100),
    region      VARCHAR(100),
    employeur   VARCHAR(200),
    statut      VARCHAR(20) DEFAULT 'ACTIVE'
                CHECK (statut IN ('ACTIVE', 'POURVUE', 'EXPIREE')),
    date_limite DATE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------
-- Index de performance
-- -------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_candidats_telephone ON candidats(telephone);
CREATE INDEX IF NOT EXISTS idx_evaluations_session ON evaluations(sigmund_session_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_telephone ON evaluations(candidat_telephone);
CREATE INDEX IF NOT EXISTS idx_offres_statut ON offres(statut);

-- -------------------------------------------------------
-- Données de test (à supprimer en production)
-- -------------------------------------------------------
INSERT INTO offres (titre, secteur, region, employeur, statut) VALUES
  ('Agent Commercial Junior', 'Commerce', 'Abidjan', 'NOHAMA Consulting', 'ACTIVE'),
  ('Technicien Informatique', 'Tech/Numérique', 'Abidjan', 'Client NOHAMA', 'ACTIVE'),
  ('Assistant Agricole', 'Agriculture', 'Bouaké', 'Agri-CI', 'ACTIVE')
ON CONFLICT DO NOTHING;
