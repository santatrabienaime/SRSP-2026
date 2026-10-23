# Manuel de démarrage — SRSP Fitovinany

Guide pas à pas pour installer, configurer et lancer la plateforme (backend +
frontend + PostgreSQL), puis la remettre en marche après un arrêt.

---

## 0. Démarrage en une commande ⚡

Une fois l'installation effectuée (§ 1 à 3), lancer **tout** (PostgreSQL si
nécessaire, backend + frontend) d'un seul coup :

```bash
./start.sh          # Linux / macOS : PostgreSQL + backend + frontend
./start.sh restart  # redémarre backend + frontend
./start.sh stop     # arrête backend + frontend
./start.sh status   # état de PostgreSQL, du backend et du frontend
```

```powershell
.\start-all.ps1     # Windows PowerShell : PostgreSQL + backend + frontend
```

- Backend → `http://localhost:5000` (`/api/health`)
- Frontend → `http://localhost:5173`
- Logs → `/tmp/srsp-backend.log` et `/tmp/srsp-frontend.log` (Linux/macOS),
  `Backend\logs\api.out.log` et `Frontend\vite.out.log` (Windows)

> **Base de données** : le script vérifie PostgreSQL sur `localhost:5432`,
> crée `srsp_db` si elle manque, puis importe `database/srsp_db.sql` si la
> table `roles` n'existe pas encore. Le dump contient le schéma, les données de
> référence et les comptes de démonstration.

---

## 1. Prérequis

| Outil | Version minimale | Vérification |
|-------|------------------|--------------|
| Node.js | 20 | `node -v` |
| npm | 9 | `npm -v` |
| PostgreSQL | 18 | `psql --version` |

Le projet ne nécessite aucune dépendance globale : tout est installé localement dans
`Backend/node_modules` et `Frontend/node_modules`.

Sous Windows, `psql.exe` se trouve généralement dans
`C:\Program Files\PostgreSQL\18\bin`. Ajoutez ce dossier au `PATH` ou utilisez
le chemin complet dans les commandes ci-dessous.

---

## 2. Configuration de la base de données

### 2.1 Variables d'environnement du backend

```bash
cd Backend
cp .env.example .env
```

Puis éditer `.env` :

| Variable | Valeur par défaut | Rôle |
|----------|-------------------|------|
| `PORT` | `5000` | Port de l'API |
| `DB_HOST` | `localhost` | Hôte PostgreSQL |
| `DB_PORT` | `5432` | Port PostgreSQL |
| `DB_USER` | `postgres` | Utilisateur PostgreSQL |
| `DB_PASSWORD` | *(à renseigner)* | Mot de passe PostgreSQL |
| `DB_NAME` | `srsp_db` | Nom de la base |
| `JWT_SECRET` | *(obligatoire)* | Secret de signature des jetons — le serveur refuse de démarrer sans. |
| `JWT_EXPIRES_IN` | `8h` | Durée de validité des jetons |
| `MAX_FILE_SIZE` | `5242880` (5 Mo) | Taille max des uploads |
| `RATE_LIMIT_ENABLED` | activé hors développement | `true`/`false` — désactivé par défaut en dev |
| `RATE_LIMIT_MAX` | `200` | Requêtes autorisées par fenêtre |
| `RATE_LIMIT_WINDOW_MS` | `900000` (15 min) | Fenêtre de limitation |
| `FRONTEND_URL` | `http://localhost:5173` | Origine autorisée en CORS |

> Le mot de passe PostgreSQL demandé pour cette livraison est `010622`.
> Ne le commitez jamais : `Backend/.env` est ignoré par Git.

### 2.2 Créer la base et importer le dump

Le dépôt fournit **`database/srsp_db.sql`** : un dump PostgreSQL complet
(schéma, collation `ci`, fonctions, triggers, données de référence, comptes de
démonstration). Il ne contient pas de `CREATE DATABASE`.

**Windows PowerShell**

```powershell
$env:PGPASSWORD = "010622"
$psql = "C:\Program Files\PostgreSQL\18\bin\psql.exe"

# 1. Créer une base vide
& $psql -U postgres -h localhost -d postgres `
  -c "CREATE DATABASE srsp_db ENCODING 'UTF8' TEMPLATE template0;"

# 2. Importer le schéma et les données
& $psql -U postgres -h localhost -d srsp_db `
  -v ON_ERROR_STOP=1 -f database\srsp_db.sql
```

**Linux / macOS**

```bash
export PGPASSWORD='010622'
createdb -h localhost -U postgres -E UTF8 -T template0 srsp_db
psql -h localhost -U postgres -d srsp_db -v ON_ERROR_STOP=1 -f database/srsp_db.sql
```

> Le dump crée la collation `public.ci` (ICU, insensible à la casse et aux
> accents) et l'applique aux colonnes texte. Utilisez PostgreSQL 18, avec le
> support ICU activé.

### 2.3 Vérifier l'import

```bash
psql -h localhost -U postgres -d srsp_db -c "SELECT COUNT(*) AS tables FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE';"
psql -h localhost -U postgres -d srsp_db -c "SELECT COUNT(*) FROM roles;"
psql -h localhost -U postgres -d srsp_db -c "SELECT COUNT(*) FROM dossiers;"
```

Attendu : **61 tables**, **13 rôles**, **6 dossiers** de démonstration et
**1 442 lignes** au total.

> **Contenu de la base livrée** : le référentiel complet (rôles, permissions,
> pièces requises, schémas d'opérations, statuts, divisions, districts,
> référentiel du cahier des charges) et un jeu de démonstration cohérent de
> **6 dossiers** avec leur historique, leurs notifications et leurs archives.
> Aucune donnée de campagne de test n'y figure : la base livrée est propre,
> et les campagnes de test s'exécutent sur une copie (`srsp_test`), jamais sur
> la base de référence.

---

## 3. Lancement

### 3.1 Backend (API)

```bash
cd Backend
npm install        # première fois uniquement
npm start          # ou : npm run dev (redémarrage auto via nodemon)
```

- URL : `http://localhost:5000`
- Vérification : `curl http://localhost:5000/api/health`
  → `{"status":"OK","timestamp":"…"}`

### 3.2 Frontend (interface web)

```bash
cd Frontend
npm install        # première fois uniquement
npm run dev        # → http://localhost:5173
```

Le serveur Vite inclut un **proxy `/api` → `http://localhost:5000`** : le frontend appelle l'API
via des URL relatives, aucune configuration CORS n'est nécessaire en développement.

### 3.3 Production

```bash
cd Frontend
npm run build      # génère Frontend/dist (statique)
npm run preview    # sert le build sur http://localhost:4173 (ou via nginx/apache)
```

L'API et le build statique peuvent être servis par un même reverse-proxy (nginx) : exposer
`/` vers `Frontend/dist` et `/api` vers le backend (port 5000).

---

## 4. Comptes de démonstration

L'identifiant peut être le **username** **ou** **l'email** (champ « identifiant » du formulaire).

| Rôle | Identifiant | Email | Mot de passe |
|------|-------------|-------|--------------|
| Administrateur | `admin` | `admin@srsp.mg` | **`Admin123!`** |
| Chef de Service | `chef.service` | `chefservice@srsp.mg` ⚠️ | `Demo123!` |
| Chef BAAF | `chef.baaf` | `chefbaaf@srsp.mg` | `Demo123!` |
| Coordonnatrice | `coordinatrice` | `coordinatrice@srsp.mg` | `Demo123!` |
| Secrétaire | `secretaire` | `secretaire@srsp.mg` | `Demo123!` |
| Chef Division Visa | `chef.visa` | `chef.visa@srsp.mg` | `Demo123!` |
| Vérificateur Visa | `verif.visa` | `verif.visa@srsp.mg` | `Demo123!` |
| Chef Division Solde | `chef.solde` | `chef.solde@srsp.mg` | `Demo123!` |
| Vérificateur Solde | `verif.solde` | `verif.solde@srsp.mg` | `Demo123!` |
| Chef Division Pension | `chef.pension` | `chef.pension@srsp.mg` | `Demo123!` |
| Liquidateur Pension | `liquidateur` | `liquidateur@srsp.mg` | `Demo123!` |
| Chef Division Secours | `chef.secours` | `chef.secours@srsp.mg` | `Demo123!` |
| Chargé Secours | `charge.secours` | `charge.secours@srsp.mg` | `Demo123!` |

> ⚠️ Email du chef de service : `chefservice@srsp.mg` — **sans point** entre « chef » et « service ».
> Changez tous les mots de passe de démonstration avant la mise en production.

---

## 5. Réinitialisation / maintenance

| Action | Commande |
|--------|----------|
| Reconstruire le frontend | `cd Frontend && npm run build` |
| Vérifier l'API | `curl http://localhost:5000/api/health` |
| Tester un login | `curl -X POST http://localhost:5000/api/auth/login -H 'Content-Type: application/json' -d '{"identifiant":"admin@srsp.mg","password":"Admin123!"}'` |
| Tester le référentiel | `curl http://localhost:5000/api/referentiel -H "Authorization: Bearer $TOKEN"` |
| Récupérer le jeton pour les tests | voir réponse du login ci-dessus (`token` JSON) |
| Restaurer une sauvegarde | voir [SAUVEGARDE_RESTITUTION.md](SAUVEGARDE_RESTITUTION.md) |

### Réinitialiser complètement la base de démonstration

> **Opération destructive** : elle supprime toutes les saisies.

```bash
# 1. Arrêter l'API (port 5000) et le frontend (port 5173)
# 2. Recréer la base
psql -h localhost -U postgres -d postgres -c "DROP DATABASE IF EXISTS srsp_db WITH (FORCE);"
psql -h localhost -U postgres -d postgres -c "CREATE DATABASE srsp_db ENCODING 'UTF8' TEMPLATE template0;"
# 3. Réimporter
psql -h localhost -U postgres -d srsp_db -v ON_ERROR_STOP=1 -f database/srsp_db.sql
# 4. Redémarrer l'API
```

---

## 6. Dépannage

| Symptôme | Cause probable | Solution |
|----------|----------------|----------|
| `Variables d'environnement manquantes` | `.env` absent | `cp .env.example .env` puis renseigner `DB_*` et `JWT_SECRET` |
| `password authentication failed for user "postgres"` | Mauvais mot de passe PostgreSQL | Corriger `DB_PASSWORD` dans `.env` |
| `ECONNREFUSED` (port 5432) | PostgreSQL n'écoute pas | Démarrer le service PostgreSQL (`services.msc` ou `systemctl start postgresql`) |
| `relation "roles" does not exist` | Base vide ou mauvais `DB_NAME` | Importer `database/srsp_db.sql` |
| `collation "ci" for encoding "UTF8" does not exist` | Dump importé dans une base ayant déjà un schéma partiel | Recréer une base vide puis réimporter |
| `Port 5000 déjà utilisé` / `EADDRINUSE` | Un backend tourne déjà | Identifier le PID puis l'arrêter — voir ci-dessous |
| Erreurs CORS en dev | Frontend appelé par une autre origine | Vérifier `FRONTEND_URL` dans `.env` |
| Upload refusé | Taille dépassée | Augmenter `MAX_FILE_SIZE` dans `.env` |
| Accents remplacés par `?` après un import | Fichier SQL relu dans le mauvais encodage | Utiliser `psql -f` directement, sans redirection PowerShell `>` |

### Libérer le port 5000

**Windows (PowerShell)**

```powershell
# 1. Identifier le PID qui écoute sur le port 5000
netstat -ano | Select-String ":5000\s+.*LISTENING"

# 2. Arrêter ce processus (remplacer <PID> par le numéro affiché)
Stop-Process -Id <PID> -Force

# 3. Vérifier que le port est libre
netstat -ano | Select-String ":5000\s+.*LISTENING"   # ne doit rien afficher
```

**Linux / macOS**

```bash
ss -ltnp | grep 5000     # identifier le vrai PID
kill <PID>
```

> ⚠️ Ne pas utiliser `pkill -f "node src/server.js"` : il peut tuer le shell
> courant, ou le frontend si les deux tournent avec la même commande.

### Redémarrer le backend proprement

```bash
# Linux / macOS
ss -ltnp | grep 5000        # identifier le vrai PID
kill <PID>
cd Backend && nohup node src/server.js > /tmp/srsp-backend.log 2>&1 &
```

```powershell
# Windows
Get-NetTCPConnection -LocalPort 5000 -State Listen |
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
cd Backend
npm start
```

---

## 7. Validation technique

- **Campagne fonctionnelle VISA** (bout en bout, API et base réelles) :
  `node Backend/scripts/test-e2e-visa.mjs` → **78 / 78**.
- **Données attendues par chaque écran** : `node Backend/scripts/test-ecrans.mjs` → **53 / 53**.
- **Tests du frontend** : `npm test` dans `Frontend` → **104 / 104** (12 fichiers).
- **Build** : `npm run build` dans `Frontend` → OK (`dist/` généré).
- **Contrôle syntaxique du backend** : `node --check` sur tous les fichiers → OK.
- **Balayage de l'API** : `node Backend/scripts/test-e2e-balayage-api.mjs` → **1 560 appels, 0 erreur serveur**.

Le détail figure dans [RESULTS_TESTS.md](RESULTS_TESTS.md).
