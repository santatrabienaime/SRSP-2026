# Backend — API REST SRSP Fitovinany

API Express (ESM) qui expose le back-office de la plateforme SRSP Fitovinany :
gestion des dossiers, workflow métier, documents, mandatement, ordonnancement,
dépouillement, rapports et notifications.

## Prérequis

- Node.js 20+
- PostgreSQL 18 (base `srsp_db`, schéma et données dans `../database/srsp_db.sql`)

## Installation

```bash
cd Backend
npm install
cp .env.example .env   # puis définir DB_PASSWORD et JWT_SECRET
```

## Variables d'environnement

| Variable | Obligatoire | Description |
|---|---|---|
| `JWT_SECRET` | oui | Clé de signature des tokens (min. 32 caractères en production). Sans elle, le démarrage est refusé. |
| `JWT_EXPIRES_IN` | non | Durée de validité du token (défaut : `8h`). |
| `DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASSWORD` / `DB_NAME` | non | Connexion PostgreSQL (défauts : `localhost:5432`, `postgres`, `srsp_db`). |
| `PORT` | non | Port HTTP (défaut : `5000`). |
| `FRONTEND_URL` | non | Origine CORS autorisée (défaut : `http://localhost:5173`). |

## Démarrage

```bash
# Depuis la racine : PostgreSQL + backend + frontend
./start.sh            # Linux / macOS
.\start-all.ps1       # Windows PowerShell

# Ou uniquement le backend
npm run dev    # développement (nodemon)
npm start      # production
```

- Health check : `GET /api/health`
- Socket.IO : `ws://localhost:5000`

## Base de données

Le schéma PostgreSQL est créé par `database/srsp_db.sql`. La documentation
détaillée est dans [`../docs/BASE_DE_DONNEES.md`](../docs/BASE_DE_DONNEES.md).
La couche `src/config/db.js` utilise le pilote `pg` et conserve l'interface
`query` / `execute` / transactions utilisée par les modèles.

## Modules principaux

- `src/routes` — routeurs Express (un par domaine : dossiers, workflow, documents, …)
- `src/controllers` / `src/services` / `src/models` — logique métier et accès données
- `src/middlewares` — auth, RBAC, scope (périmètre division/agent), upload, rate limit
- `src/realtime` — notifications temps réel

## Tests

Les campagnes se lancent depuis `Backend/`, avec l'API démarrée sur le port 5000 :

```bash
node scripts/test-e2e-visa.mjs
node scripts/test-e2e-operations.mjs
node scripts/test-e2e-secours.mjs
node scripts/test-e2e-signalements.mjs
node scripts/test-e2e-balayage-api.mjs
```

Le détail et les résultats figurent dans [`../docs/RESULTS_TESTS.md`](../docs/RESULTS_TESTS.md).
