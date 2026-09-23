# SRSP Fitovinany — Plateforme de gestion, suivi et traçabilité des dossiers administratifs

Plateforme web de gestion du **Service Régional de la Santé Publique (SRSP) Fitovinany** pour le
suivi et la traçabilité des dossiers administratifs (visa, solde, pension, secours), conforme au
**cahier des charges v2.0** : workflow par type de dossier, RBAC sur 13 postes, 11 statuts,
numérotation automatique, historique complet, notifications et rapports.

---

## 🧱 Architecture

```
── Backend  : API REST Express + MySQL (MariaDB) — port 5000
── Frontend : SPA React 19 + Vite + Tailwind CSS v4 — port 5173 (proxy /api → 5000)
```

| Brique      | Technologie                                              |
|-------------|----------------------------------------------------------|
| API         | Node.js (ESM), Express 4, JWT, bcryptjs, Helmet, CORS    |
| Base        | MariaDB/MySQL 8, `mysql2` (pool), schéma idempotent      |
| Upload      | multer (documents, courriers) — stockage local           |
| Rapports    | PDFKit (PDF), ExcelJS (XLSX)                             |
| Frontend    | React 19, React Router 7, Tailwind v4, Recharts, axios   |
| Qualité     | Smoke test SSR (`react-dom/server`), build Vite vérifié  |

## ✨ Fonctionnalités

- **Workflow par type de dossier** : Reçu → Enregistré → Orienté → Affecté → En traitement →
  Soumis à vérification → (Correction demandée ⇄) Validé → Signé → Clôturé → Archivé, avec la
  règle stricte du cahier des charges : *« Correction demandée » ne peut pas passer directement
  à « Validé »*.
- **RBAC sur 13 postes** : administrateur, chef de service, chef BAAF, coordinatrice, secrétaire,
  4 chefs de division et 4 agents techniques (verificateurs/liquidateur/chargé).
- **Numérotation automatique** : `{TYPE}-{ANNEE}-{6 chiffres}`, ex. `VISA-2026-000001`.
- **Gestion complète** : dossiers, documents (upload/prévisualisation/téléchargement), courriers,
  agents, divisions, notifications, historique de traçabilité, archives.
- **Tableau de bord & statistiques** : répartition par division/statut, évolution, indicateurs.
- **Rapports PDF et Excel** exportables.
- **Administration** : utilisateurs, rôles et permissions.

## 🚀 Démarrage rapide

### ⚡ En une commande (recommandé)

```bash
./start.sh        # démarre backend + frontend (détecte automatiquement le port MariaDB)
./start.sh status   # état des services
./start.sh restart  # redémarre les deux
./start.sh stop     # arrête les deux
./start.sh init     # réinitialise la base (idempotent) puis démarre
```

- Backend → `http://localhost:5000` · Frontend → `http://localhost:5173`
- Logs : `tail -f /tmp/srsp-backend.log` et `tail -f /tmp/srsp-frontend.log`

### Manuel (première installation)

Prérequis : **Node.js ≥ 20** et **MariaDB/MySQL** en local.

```bash
# 1. Base de données (création du schéma + données de référence + 14 comptes)
cd Backend
cp .env.example .env        # puis renseigner les identifiants DB et JWT_SECRET
DB_PORT=3306 node database/init.js     # idempotent : peut être relancé sans risque

# 2. API
npm install
npm start                   # → http://localhost:5000  (vérifier /api/health)

# 3. Frontend (nouveau terminal)
cd ../Frontend
npm install
npm run dev                 # → http://localhost:5173
```

> Détails pas à pas (Prérequis, MariaDB, variables d'environnement, dépannage) :
> **voir [docs/MANUEL_DEMARRAGE.md](docs/MANUEL_DEMARRAGE.md)**.

## 🔑 Comptes de démonstration

L'identifiant peut être le **username** ou **l'email**.

| Rôle                              | Identifiant            | Mot de passe |
|-----------------------------------|------------------------|--------------|
| Administrateur                    | `admin` / `admin@srsp.mg` | `Admin123!` |
| Chef de Service                   | `chef.service` / `chefservice@srsp.mg` | `Demo123!` |
| Chef BAAF                         | `chef.baaf` / `chefbaaf@srsp.mg` | `Demo123!` |
| Coordonnatrice                    | `coordinatrice` / `coordinatrice@srsp.mg` | `Demo123!` |
| Secrétaire                        | `secretaire` / `secretaire@srsp.mg` | `Demo123!` |
| Chef Division Visa                | `chef.visa` / `chef.visa@srsp.mg` | `Demo123!` |
| Vérificateur Visa                 | `verif.visa` / `verif.visa@srsp.mg` | `Demo123!` |
| Chef Division Solde               | `chef.solde` / `chef.solde@srsp.mg` | `Demo123!` |
| Vérificateur Solde                | `verif.solde` / `verif.solde@srsp.mg` | `Demo123!` |
| Chef Division Pension             | `chef.pension` / `chef.pension@srsp.mg` | `Demo123!` |
| Liquidateur Pension               | `liquidateur` / `liquidateur@srsp.mg` | `Demo123!` |
| Chef Division Secours             | `chef.secours` / `chef.secours@srsp.mg` | `Demo123!` |
| Chargé Secours                    | `charge.secours` / `charge.secours@srsp.mg` | `Demo123!` |

> ⚠️ Email du chef de service : **`chefservice@srsp.mg`** (sans point).

## 📚 Documentation

| Document | Contenu |
|----------|---------|
| [docs/MANUEL_DEMARRAGE.md](docs/MANUEL_DEMARRAGE.md) | Installation, configuration, lancement backend + frontend, réinitialisation de la base, dépannage. |
| [docs/API.md](docs/API.md) | Référence complète de l'API REST : authentification, dossiers, workflow, documents, courriers, référentiel, rapports, administration. |

## 📁 Structure du dépôt

```
SRSP-2026/
├── Backend/
│   ├── database/          # schema.sql, seeds/ (idempotents), init.js
│   ├── src/
│   │   ├── config/        # env, db, cors, multer, logger
│   │   ├── controllers/   # logique métier par ressource
│   │   ├── middleware/    # auth, RBAC, validation, erreurs
│   │   ├── models/        # accès MySQL
│   │   ├── routes/        # 16 routeurs REST
│   │   ├── services/      # workflow, rapport, référentiel…
│   │   └── app.js         # configuration Express
│   └── package.json
├── Frontend/
│   └── src/
│       ├── components/    # ui/, layout/, dossier/, document/, courrier/…
│       ├── pages/         # 30+ pages métier et d'administration
│       ├── routes/        # AppRouter, routesConfig, PrivateRoute, RoleRoute
│       ├── contexts/      # AuthContext, NotificationContext (toasts)
│       ├── hooks/         # useAuth, useDossier, useApi, usePagination…
│       ├── services/      # clients API axios
│       ├── utils/         # formatDate, formatStatus, validateForm, fileHandler
│       └── config/        # constants.js (statuts, rôles, workflow)
└── docs/                  # MANUEL_DEMARRAGE.md, API.md
```

## ✅ État de validation

- Smoke test SSR : **30/30 routes** rendues sans erreur (`react-dom/server`).
- Build frontend : **`npm run build` OK** (dist généré).
- Backend : workflow v2.0, RBAC, notifications, historique, upload, rapports PDF/Excel,
  référentiel, téléchargement de documents et filtre par type — **vérifiés par curl**.