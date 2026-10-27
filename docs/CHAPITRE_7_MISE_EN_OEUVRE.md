# CHAPITRE 7 : MISE EN ŒUVRE

## 7.1 Architecture du système

### 7.1.1 Architecture générale

L'application SRSP Fitovinany est déployée selon une architecture **3-tiers** :

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Navigateur)                      │
│  React 18 + Vite (port 5173) — SPA, composants fonctionnels    │
│  Tailwind CSS, React Router, Axios, Socket.io-client            │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP REST (axios) + WebSocket (Socket.io)
┌──────────────────────────┴──────────────────────────────────────┐
│                        SERVEUR (Node.js)                        │
│  Express 4 (port 5000) — API REST                               │
│  Middlewares : auth (JWT), RBAC, scope, upload (multer), erreurs │
│  Services : dossier, document, dépouillement, rapport, perf,     │
│             dashboard, scope, workflow, notification, etc.        │
│  Models : accès PostgreSQL via pg (node-postgres)                │
└──────────────────────────┬──────────────────────────────────────┘
                           │ SQL (pg)
┌──────────────────────────┴──────────────────────────────────────┐
│                        BASE DE DONNÉES                          │
│  PostgreSQL 18 — srsp_db (61 tables, ICU ci, Africa/Nairobi)    │
│  Fonction datediff(), contraintes, index, triggers              │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────────────┐
│                        SYSTÈME DE FICHIERS                      │
│  uploads/ (fichiers UUID), logs/ (api.out.log, api.err.log)     │
└─────────────────────────────────────────────────────────────────┘
```

### 7.1.2 Flux de données

1. **Réception** : le Secrétaire saisit le dossier dans le formulaire React → envoi POST à l'API → validation Joi → service → modèle → INSERT PostgreSQL.
2. **Traitement** : l'agent instruit le dossier → données d'opération, dépôt de pièces, dépouillement → mise à jour du statut.
3. **Vérification** : le Chef de Division vérifie les pièces et les données → validation ou correction.
4. **Signature** : le Chef de Service signe → passage en SIGNE.
5. **Archivage** : archivage avec référence, emplacement, localisation.
6. **Temps réel** : chaque changement de statut émet un événement WebSocket → les écrans concernés se rafraîchissent.

### 7.1.3 Sécurité de l'architecture

- **Authentification** : JWT signé avec `JWT_SECRET`, expiration 8h
- **Autorisation** : RBAC avec 13 rôles et permissions granulaires
- **Cloisonnement** : par division (chef de division) et par agent (agent technique), appliqué par le serveur
- **Sessions** : révocation immédiate si compte désactivé ou mot de passe modifié (cache invalidé)
- **Upload** : Multer, nom UUID, validation extension/taille (5 Mo max), stockage privé
- **Téléchargement** : route authentifiée, résolution de chemin sous la racine uploads
- **SQL** : requêtes paramétrées (placeholders `?`), pas de concaténation
- **CORS** : origines configurées, credentials activés
- **Helmet** : headers de sécurité HTTP

---

## 7.2 Configuration des outils de conception

### 7.2.1 Outils et versions

| Outil | Version | Usage |
|---|---|---|
| Node.js | 22+ | Runtime backend |
| PostgreSQL | 18.6 | Base de données |
| React | 19.3 | Interface utilisateur |
| Vite | 8.3 | Bundler frontend |
| Express | 4.22 | Framework HTTP backend |
| Tailwind CSS | 4.3 | Styles utilitaires |
| Vitest | 5.0 | Tests unitaires frontend |
| Oxlint | 1.81 | Linting frontend |
| Git | 2.x | Versionnement |
| GitHub | — | Dépôt distant |

### 7.2.2 Environnement de développement

| Composant | Port | Commande |
|---|---|---|
| Frontend (Vite) | 5173 | `npm run dev` (dans `Frontend/`) |
| Backend (Express) | 5000 | `node src/server.js` (dans `Backend/`) |
| PostgreSQL | 5432 | Service Windows `postgresql-x64-18` |

### 7.2.3 Configuration (.env)

```ini
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=010622
DB_NAME=srsp_db
JWT_SECRET=<chaîne aléatoire longue>
JWT_EXPIRES_IN=8h
UPLOAD_DIR=./src/uploads
MAX_FILE_SIZE=5242880
FRONTEND_URL=http://localhost:5173
```

### 7.2.4 Démarrage rapide

```powershell
# Démarrage complet (PostgreSQL + backend + frontend)
.\start-all.ps1

# Ou manuellement :
cd Backend
node src/server.js          # API sur http://localhost:5000
cd ../Frontend
npm run dev                  # Frontend sur http://localhost:5173
```

---

## 7.3 Génération de la base de données

### 7.3.1 Création de la base

```sql
-- Création de la base avec encodage UTF-8
CREATE DATABASE srsp_db ENCODING 'UTF8' TEMPLATE template0;
```

### 7.3.2 Import du dump de référence

```powershell
# Via psql
$env:PGPASSWORD = "010622"
psql -h localhost -p 5432 -U postgres -d srsp_db -v ON_ERROR_STOP=1 -f database/srsp_db.sql
```

Le dump `database/srsp_db.sql` contient :
- 61 tables avec leurs contraintes, index et clés étrangères
- Les données de référence (rôles, permissions, statuts, types de dossiers, priorités, etc.)
- Les données de démonstration (7 dossiers, 13 utilisateurs, etc.)
- La fonction `datediff(timestamp, timestamp)` pour la compatibilité PostgreSQL
- La contrainte `chk_depouillements_etat` incluant l'état `REJETEE`

### 7.3.3 Migration 001 (corrections runtime)

Le fichier `Backend/scripts/db/001-fixes.sql` applique :
1. La fonction `datediff(a timestamp, b timestamp)` (compatibilité MySQL→PostgreSQL)
2. La contrainte `notifications_user_id_dossier_id_action_key` avec `NULLS NOT DISTINCT` (PG15+)
3. La resynchronisation des compteurs de numérotation (bordereaux, archives, courriers)

### 7.3.4 Migration des états de pièces

Le fichier `database/migrations/2026-10-26_etats_pieces_rejetee.sql` ajoute l'état `REJETEE` à la contrainte `chk_depouillements_etat`.

### 7.3.5 Vérification de la base

```powershell
# Vérifier le nombre de tables
psql -h localhost -U postgres -d srsp_db -c "SELECT count(*) FROM information_schema.tables WHERE table_schema='public'"

# Vérifier la contrainte des dépouillements
psql -h localhost -U postgres -d srsp_db -c "SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid='public.depouillements'::regclass AND contype='c'"

# Vérifier la fonction datediff
psql -h localhost -U postgres -d srsp_db -c "SELECT datediff('2026-10-26'::timestamp, '2026-10-20'::timestamp)"
```

---

## 7.4 Configuration de l'environnement de développement

### 7.4.1 Prérequis

| Logiciel | Version minimale | Usage |
|---|---|---|
| Node.js | 22.22.2+ | Runtime backend + frontend |
| PostgreSQL | 18 | Base de données |
| Git | 2.x | Versionnement |
| Navigateur | Chrome/Firefox/Edge | Interface utilisateur |

### 7.4.2 Installation

```bash
# 1. Cloner le dépôt
git clone https://github.com/santatrabienaime/SRSP-2026.git
cd SRSP-2026

# 2. Configurer le backend
cd Backend
cp .env.example .env
# Éditer .env : DB_PASSWORD=010622, JWT_SECRET=<chaîne aléatoire>

# 3. Installer les dépendances backend
npm install

# 4. Configurer la base de données
# Créer la base et importer le dump
psql -h localhost -U postgres -c "CREATE DATABASE srsp_db ENCODING 'UTF8' TEMPLATE template0;"
psql -h localhost -U postgres -d srsp_db -v ON_ERROR_STOP=1 -f ../database/srsp_db.sql

# 5. Appliquer les migrations
psql -h localhost -U postgres -d srsp_db -v ON_ERROR_STOP=1 -f scripts/db/001-fixes.sql
psql -h localhost -U postgres -d srsp_db -v ON_ERROR_STOP=1 -f ../database/migrations/2026-10-26_etats_pieces_rejetee.sql

# 6. Installer les dépendances frontend
cd ../Frontend
npm install
```

### 7.4.3 Lancement

```powershell
# Démarrage complet (PostgreSQL + backend + frontend)
.\start-all.ps1

# Ou manuellement :
cd Backend
node src/server.js          # API sur http://localhost:5000
cd ../Frontend
npm run dev                  # Frontend sur http://localhost:5173
```

### 7.4.4 Vérification

```powershell
# Vérifier que l'API répond
curl http://localhost:5000/api/health

# Vérifier que le frontend répond
curl http://localhost:5173

# Se connecter avec le compte admin
# Identifiant : admin@srsp.mg
# Mot de passe : Admin123!
```

### 7.4.5 Comptes de démonstration

| Identifiant | Mot de passe | Rôle |
|---|---|---|
| `admin` | `Admin123!` | Administrateur |
| `secretaire` | `Demo123!` | Secrétaire |
| `chef.service` | `Demo123!` | Chef de Service |
| `chef.baaf` | `Demo123!` | Chef BAAF |
| `coordinatrice` | `Demo123!` | Coordinatrice |
| `chef.visa` | `Demo123!` | Chef de Division VISA |
| `verif.visa` | `Demo123!` | Vérificateur VISA |
| `chef.solde` | `Demo123!` | Chef de Division Solde |
| `verif.solde` | `Demo123!` | Vérificateur Solde |
| `chef.pension` | `Demo123!` | Chef de Division Pension |
| `liquidateur` | `Demo123!` | Liquidateur Pension |
| `chef.secours` | `Demo123!` | Chef de Division Secours |
| `charge.secours` | `Demo123!` | Chargé de Secours |

### 7.4.6 Commandes de test

```bash
# Tests frontend (147 tests)
cd Frontend && npm test

# Build frontend
cd Frontend && npm run build

# Lint frontend
cd Frontend && npm run lint

# Vérification syntaxe backend
cd Backend && node --check src/server.js

# Tests E2E écrans (53 vérifications)
cd Backend && node scripts/test-ecrans.mjs

# Audit API-frontend (222 routes)
cd Backend && node scripts/audit-api-frontend.mjs
```

---

## 7.5 Extraits de code des fonctionnalités principales

### 7.5.1 Marquage d'une pièce (Présente/Absente/Rejetée)

**Frontend** — `Frontend/src/components/dossier/DepouillementChecklist.jsx` :

```javascript
const ACTIONS = [
  { etat: ETATS_PIECE.PRESENTE, label: 'Présente', Icone: CircleCheck, ... },
  { etat: ETATS_PIECE.MANQUANTE, label: 'Absente', Icone: CircleX, ... },
  { etat: ETATS_PIECE.REJETEE, label: 'Rejetée', Icone: Ban, ... },
  { etat: ETATS_PIECE.NON_APPLICABLE, label: 'Non applicable', Icone: MinusCircle, ... },
];

const choisirEtat = async (piece, etat) => {
  if (ETATS_PIECE_A_MOTIVER.includes(etat)) {
    setPieceAMotiver({ piece, etat });
    setMotif(piece.motif || '');
  } else {
    await enregistrer(piece, etat, undefined);
  }
};

const enregistrer = async (piece, etat, motifValue) => {
  await dossierService.saveDepouillement(dossierId, {
    piece: piece.code,
    presente: etat === ETATS_PIECE.PRESENTE || etat === ETATS_PIECE.NON_APPLICABLE,
    etat,
    motif: motifValue,
  });
};
```

**Backend** — `Backend/src/utils/constants.js` :

```javascript
export const ETATS_PIECE = {
  PRESENTE: 'PRESENTE',
  MANQUANTE: 'MANQUANTE',
  REJETEE: 'REJETEE',
  ILLISIBLE: 'ILLISIBLE',
  A_CORRIGER: 'A_CORRIGER',
  NON_APPLICABLE: 'NON_APPLICABLE',
};

export const ETATS_PIECE_VALIDES = [ETATS_PIECE.PRESENTE, ETATS_PIECE.NON_APPLICABLE];

export const ETATS_PIECE_A_MOTIVER = [
  ETATS_PIECE.MANQUANTE,
  ETATS_PIECE.REJETEE,
  ETATS_PIECE.ILLISIBLE,
  ETATS_PIECE.A_CORRIGER,
];
```

### 7.5.2 Suppression d'une pièce jointe

**Backend** — `Backend/src/services/documentService.js` :

```javascript
export async function supprimer(dossierId, documentId, userId) {
  const document = await documentModel.findPourDossier(documentId, dossierId);
  if (!document) throw httpError(404, 'Document introuvable.');

  const statut = await workflowService.getCurrentStatus(dossierId);
  if (statut === STATUT_ARCHIVE) {
    throw httpError(409, 'Un document d’un dossier archivé ne peut plus être supprimé.');
  }

  const permissions = await permissionsDe(userId);
  const autorise = Number(document.upload_par) === Number(userId)
    || ['manage_documents', 'verifier_dossier', 'valider_dossier', 'depouiller_pieces']
      .some((permission) => permissions.has(permission));
  if (!autorise) {
    throw httpError(403, 'Seul le déposant, un chef de division ou un administrateur peut supprimer cette pièce.');
  }

  // Détacher les références `remplace` des versions suivantes
  await db.query('UPDATE documents SET remplace = NULL WHERE remplace = ?', [documentId]);
  await documentModel.remove(documentId);

  await historiqueModel.log({
    user_id: userId,
    action: 'SUPPRESSION_DOCUMENT',
    dossier_id: Number(dossierId),
    ancienne_valeur: document.nom_fichier,
    details: `Suppression d’une pièce jointe (${document.piece_code}), version ${document.version || 1}.`,
  });

  return { message: 'Document supprimé.', version: document.version || 1 };
}
```

### 7.5.3 Validation par le Chef de Division

**Backend** — `Backend/src/services/dossierService.js` :

```javascript
export async function controlerCompletudeValidation(id, { motifException, userId }) {
  const champs = await champsVisaManquants(id);
  const pieces = await piecesObligatoiresNonSatisfaites(id);

  if (champs.length === 0 && pieces.length === 0) return;

  const motif = String(motifException || '').trim();
  const autoriseDerogation = await aPermission(userId, 'deroger_validation');

  if (!motif) {
    if (!autoriseDerogation) {
      throw httpError(422, `${messageIncompletude(champs, pieces)} Demandez une correction ou un complément : seul un chef de service autorisé peut passer outre.`);
    }
    throw httpError(422, `${messageIncompletude(champs, pieces)} Renseignez un motif de dérogation pour passer outre.`);
  }
  if (!autoriseDerogation) {
    throw httpError(403, "Vous ne pouvez pas déroger au contrôle de complétude : seul un chef de service autorisé peut le faire.");
  }
}
```

### 7.5.4 Cloisonnement des rapports par division

**Backend** — `Backend/src/routes/rapportRoutes.js` :

```javascript
router.use(async (req, res, next) => {
  try {
    req.scope = await getScope(req.user.id);
    next();
  } catch (e) { next(e); }
});
```

**Backend** — `Backend/src/services/rapportService.js` :

```javascript
async function clausePerimetre(scope) {
  if (!scope) return { condition: null, params: [] };
  const { where, params } = await perimetrePour(scope);
  return { condition: where ? where.replace(/^\s*AND\s*/i, '') : null, params };
}

export async function rapportIncomplets(_filtres = {}, scope = null) {
  const perimetre = await clausePerimetre(scope);
  const rows = await db.query(
    `SELECT d.numero, d.objet, d.demandeur, d.date_reception,
            dv.nom AS division,
            STRING_AGG(tp.libelle, ', ') AS pieces_manquantes
     FROM dossiers d
     JOIN divisions dv ON d.division_id = dv.id
     JOIN types_pieces tp ON tp.obligatoire = 1 AND tp.actif = 1
       AND tp.phase = 'DEPOUILLEMENT'
       AND (tp.type_dossier_id IS NULL OR tp.type_dossier_id = d.type_id)
       AND (tp.sous_type_id IS NULL OR tp.sous_type_id = d.sous_type_id)
     WHERE NOT EXISTS (
       SELECT 1 FROM depouillements dp
       WHERE dp.dossier_id = d.id AND dp.piece = tp.code
         AND dp.etat IN (${ETATS_PIECE_VALIDES_SQL})
     )${perimetre.condition ? ` AND ${perimetre.condition}` : ''}
     GROUP BY d.id, dv.nom
     ORDER BY d.date_reception ASC`,
    perimetre.params
  );
  return { titre: 'Dossiers incomplets (pièces obligatoires non satisfaites)', lignes: rows };
}
```

### 7.5.5 Authentification et session

**Frontend** — `Frontend/src/contexts/AuthContext.jsx` :

```javascript
const persist = useCallback((t, u) => {
  // Synchronisation immédiate avec le client HTTP, pour que les appels
  // suivants (me, permissions) disposent du jeton sans attendre un rendu.
  setAuthToken(t);
  setToken(t);
  setUser(u);
}, []);
```

**Frontend** — `Frontend/src/services/apiClient.js` :

```javascript
let jetonCourant = null;

export function setAuthToken(token) {
  jetonCourant = token || null;
}

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  if (jetonCourant) config.headers.Authorization = `Bearer ${jetonCourant}`;
  return config;
});
```

### 7.5.6 Formulaire de création de dossier (étape 3)

**Frontend** — `Frontend/src/components/dossier/DossierForm.jsx` :

```javascript
const estVisa = typeSelectionne?.code === 'VISA';

// Auto-remplissage VISA avec le nom de l'utilisateur connecté
useEffect(() => {
  if (!estVisa || initial) return;
  if (!nomUtilisateur) return;
  setForm((f) => ({
    ...f,
    origine_presentateur: f.origine_presentateur || nomUtilisateur,
    comptable_presentateur: f.comptable_presentateur || nomUtilisateur,
  }));
}, [estVisa, nomUtilisateur, initial]);
```

### 7.5.7 Contrôle des pièces (Frontend)

**Frontend** — `Frontend/src/components/dossier/DepouillementChecklist.jsx` :

```javascript
const ACTIONS = [
  { etat: ETATS_PIECE.PRESENTE, label: 'Présente', Icone: CircleCheck, ... },
  { etat: ETATS_PIECE.MANQUANTE, label: 'Absente', Icone: CircleX, ... },
  { etat: ETATS_PIECE.REJETEE, label: 'Rejetée', Icone: Ban, ... },
  { etat: ETATS_PIECE.NON_APPLICABLE, label: 'Non applicable', Icone: MinusCircle, ... },
];

const canControl = hasAnyPermission([
  'depouiller_pieces', 'gerer_ordonnancement', 'preparer_mandatement',
  'verifier_dossier', 'valider_dossier',
]);
```

---

*Fin du Chapitre 7 — Mise en œuvre du projet SRSP Fitovinany*