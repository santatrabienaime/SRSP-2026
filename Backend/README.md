# Backend — API REST SRSP Fitovinany

API Express (ESM) qui expose le back-office de la plateforme SRSP Fitovinany :
gestion des dossiers, workflow métier, documents, mandatement, ordonnancement,
dépouillement, rapports et notifications.

## Prérequis

- Node.js 18+
- MariaDB (instance projet : port 3307 par défaut, schéma dans `srsp_db.sql`)

## Installation

```bash
cd Backend
npm install
cp .env.example .env   # puis définir JWT_SECRET
```

## Variables d'environnement

| Variable | Obligatoire | Description |
|---|---|---|
| `JWT_SECRET` | ✅ oui | Clé de signature des tokens (min. 32 caractères en production). Sans elle, le démarrage est refusé. |
| `JWT_EXPIRES_IN` | non | Durée de validité du token (défaut : `8h`). |
| `DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASSWORD` / `DB_NAME` | non | Connexion MariaDB (défauts : `localhost:3306`, `srsp_db`). |
| `PORT` | non | Port HTTP (défaut : `5000`). |
| `FRONTEND_URL` | non | Origine CORS autorisée (défaut : `http://localhost:5173`). |

## Démarrage

```bash
npm run dev    # développement (nodemon)
npm start      # production
```

- Health check : `GET /api/health`
- Socket.IO : `ws://localhost:5000`

## Modules principaux

- `src/routes` — routeurs Express (un par domaine : dossiers, workflow, documents, …)
- `src/controllers` / `src/services` / `src/models` — logique métier et accès données
- `src/middlewares` — auth, RBAC, scope (périmètre division/agent), upload, rate limit
- `src/realtime` — notifications temps réel

## Tests

```bash
npm test
```
