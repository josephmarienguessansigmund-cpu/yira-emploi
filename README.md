# YIRA Emploi — NOHAMA Consulting

Plateforme d'insertion professionnelle des jeunes en Côte d'Ivoire, combinant USSD et évaluation psychométrique SIGMUND.

---

## Architecture

```
yira-emploi/
├── src/
│   ├── app/
│   │   └── api/
│   │       ├── ussd/route.ts          # Endpoint USSD (*789#)
│   │       ├── sigmund/
│   │       │   ├── session/route.ts   # Créer/consulter sessions SIGMUND
│   │       │   └── webhook/route.ts   # Réception résultats SIGMUND
│   │       └── health/route.ts        # Health check
│   ├── lib/
│   │   ├── db.ts                      # Connexion PostgreSQL
│   │   ├── sigmund.ts                 # Client API SIGMUND
│   │   └── ussd-engine.ts             # Machine à états USSD
│   └── types/index.ts                 # Types TypeScript
├── database/
│   └── init.sql                       # Schéma DB à exécuter une fois
├── package.json
├── netlify.toml
└── tsconfig.json
```

---

## Variables d'environnement (Netlify)

| Variable | Description | Valeur |
|----------|-------------|--------|
| `DATABASE_URL` | URL PostgreSQL | `postgresql://...` |
| `SIGMUND_CLIENT_ID` | ID client SIGMUND | `8937-6771-8414-4521` |
| `SIGMUND_PRODUCT_CODE` | Code produit SIGMUND | `25` |
| `SIGMUND_BASE_URL` | URL API SIGMUND | `https://api.sigmund-assessment.com/v1` |
| `NEXT_PUBLIC_APP_URL` | URL publique du site | `https://yira-emploi.netlify.app` |
| `AT_API_KEY` | Clé API Africa's Talking | `atsk_...` |
| `AT_USERNAME` | Nom d'utilisateur Africa's Talking | `sandbox` (test) ou votre username (prod) |

---

## Déploiement

### 1. Base de données
Exécutez `database/init.sql` sur votre instance PostgreSQL (Neon, Supabase, Railway).

### 2. Netlify
```bash
npm install
# Configurer les env vars dans Netlify Dashboard
# Pousser sur GitHub → déploiement automatique
```

### 3. Configurer le code USSD
Chez votre opérateur (Africa's Talking / MTN CI / Orange CI) :
- **URL de callback** : `https://[votre-site].netlify.app/api/ussd`
- **Méthode** : POST
- **Format** : `application/x-www-form-urlencoded` ou JSON

### 4. Configurer le webhook SIGMUND
Dans votre espace SIGMUND, définir :
- **Webhook URL** : `https://[votre-site].netlify.app/api/sigmund/webhook`
- **Client ID** : `8937-6771-8414-4521`
- **Produit** : `25`

---

## Endpoints API

| Méthode | Route | Description |
|---------|-------|-------------|
| POST/GET | `/api/ussd` | Handler USSD principal |
| POST | `/api/sigmund/session` | Créer session évaluation |
| GET | `/api/sigmund/session?telephone=+225...` | Récupérer résultats |
| POST | `/api/sigmund/webhook` | Webhook retour SIGMUND |
| GET | `/api/health` | Health check |

---

## Flux utilisateur USSD

```
*789# → Bienvenue
  ├── 1. Inscription → Prénom → Nom → Niveau → Secteur → Région
  │       └── Création profil DB + envoi SMS lien SIGMUND
  ├── 2. Voir offres → Liste des 3 dernières offres actives
  └── 3. Mes résultats → Profil SIGMUND (Code Holland, profil global)
```

---

## Contact
**NOHAMA Consulting** — N'GUESSAN AKPOLET JOSEPH OSCAR  
Opérateur SIGMUND agréé — Côte d'Ivoire  
ARTCI · RCCM · DGI
