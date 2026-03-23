-- ============================================================
-- YIRA EMPLOI — NOHAMA Consulting
-- Script d'initialisation PostgreSQL (Optimisé & Sécurisé)
-- Joseph-Marie N'GUESSAN - Expert Certifié SIGMUND
-- ============================================================

-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -------------------------------------------------------
-- Fonction automatique de mise à jour du Timestamp
-- (Évite les boucles de calcul infinies sur Netlify)
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;   
END;
$$ language 'plpgsql';

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

-- Trigger pour candidats
DROP TRIGGER IF EXISTS trg_update_candidats ON candidats;
CREATE TRIGGER trg_update_candidats
    BEFORE UPDATE ON candidats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- -------------------------------------------------------
-- Table évaluations SIGMUND
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS evaluations (
    id                  UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    -- Ajout de ON UPDATE CASCADE pour éviter les erreurs 8600$ lors du changement de numéro
    candidat_telephone  VARCHAR(20) NOT NULL 
                        REFERENCES candidats(telephone) 
                        ON DELETE CASCADE 
                        ON UPDATE CASCADE,
    sigmund_session_id  VARCHAR(100) UNIQUE NOT NULL,
    type_evaluation     VARCHAR(20) DEFAULT 'COMPLET',
    status              VARCHAR(20) DEFAULT 'PENDING'
                        CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'EXPIRED')),
    lien_test           TEXT,
    resultats           JSONB,
    score_global        INTEGER, -- Ajout pour reporting rapide YIRA
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
-- Index de performance (Vital pour les grands volumes YIRA)
-- -------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_candidats_telephone ON candidats(telephone);
CREATE INDEX IF NOT EXISTS idx_evaluations_session ON evaluations(sigmund_session_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_telephone ON evaluations(candidat_telephone);
CREATE INDEX IF NOT EXISTS idx_offres_statut ON offres(statut);
