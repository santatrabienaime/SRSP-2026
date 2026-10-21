# Manuel de démarrage — SRSP Fitovinany

Guide pas à pas pour installer, configurer et lancer la plateforme (backend + frontend + base de
données), puis la remettre en marche après un arrêt.

---

## 0. Démarrage en une commande ⚡

Une fois l'installation effectuée (§ 1 à 3), lancer **tout** (MariaDB + backend +
frontend) d'un seul coup :

```bash
./start.sh        # lance MariaDB si à l'arrêt, puis backend + frontend — idempotent
./start.sh restart  # redémarre backend + frontend (la base reste active)
./start.sh stop     # arrête backend + frontend
./start.sh status   # état des services (MariaDB, backend, frontend)
```

- Backend → `http://localhost:5000` (`/api/health`)
- Frontend → `http://localhost:5173`
- Logs → `/tmp/srsp-backend.log` et `/tmp/srsp-frontend.log`

> **Base de données** : le script lance au besoin l'instance MariaDB du projet
> (datadir `~/.local/share/mariadb-srsp`, port `3307`, log
> `~/.local/run/mariadb-srsp.err`), puis détecte le port en sondant `3307` puis
> `3306` — en vérifiant que `srsp_db` contient bien la table `roles` ; il retombe
> sinon sur `DB_PORT` du `.env`. Sans cette instance, une autre MariaDB (3306)
> répondrait avec « Access denied for user 'root' ».

---

## 1. Prérequis

| Outil | Version minimale | Vérification |
|-------|------------------|--------------|
| Node.js | 20 | `node -v` |
| npm | 9 | `npm -v` |
| MariaDB ou MySQL | 10.4 / 8.0 | `mysql --version` |

Le projet ne nécessite aucune dépendance globale : tout est installé localement dans
`Backend/node_modules` et `Frontend/node_modules`.

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
| `DB_HOST` | `localhost` | Hôte MySQL |
| `DB_PORT` | `3306` | Port MySQL |
| `DB_USER` | `root` | Utilisateur MySQL |
| `DB_PASSWORD` | *(à renseigner)* | Mot de passe MySQL |
| `DB_NAME` | `srsp_db` | Nom de la base (créée automatiquement) |
| `JWT_SECRET` | *(obligatoire)* | Secret de signature des jetons — le serveur refuse de démarrer sans. |
| `JWT_EXPIRES_IN` | `8h` | Durée de validité des jetons |
| `MAX_FILE_SIZE` | `10485760` (10 Mo) | Taille max des uploads |
| `RATE_LIMIT_ENABLED` | activé hors développement | `true`/`false` — **désactivé par défaut en dev** (le message « Trop de requêtes » n'apparaît plus) |
| `RATE_LIMIT_MAX` | `200` | Requêtes autorisées par fenêtre |
| `RATE_LIMIT_WINDOW_MS` | `900000` (15 min) | Fenêtre de limitation |
| `FRONTEND_URL` | `http://localhost:5173` | Origine autorisée en CORS |

### 2.2 Base de données

> ⚠️ Ce dépôt ne fournit aucune commande de création du schéma. La base
> `srsp_db` (schéma, données de référence et comptes de démonstration) doit être
> créée et initialisée par l'administrateur avant le premier lancement.

Le schéma et les données de référence sont supposés **idempotents** : relancer une
initialisation manuelle ne doit jamais dupliquer les données. Tous les scripts du
projet sont conçus pour être réutilisés sans effet de bord sur les données déjà
enregistrées.

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

---

## 5. Réinitialisation / maintenance

| Action | Commande |
|--------|----------|
| Réinitialiser la base | non disponible — aucune commande ne recrée le schéma |
| Reconstruire le frontend | `cd Frontend && npm run build` |
| Vérifier l'API | `curl http://localhost:5000/api/health` |
| Tester un login | `curl -X POST http://localhost:5000/api/auth/login -H 'Content-Type: application/json' -d '{"identifiant":"admin@srsp.mg","password":"Admin123!"}'` |
| Tester le référentiel | `curl http://localhost:5000/api/referentiel -H "Authorization: Bearer $TOKEN"` |
| Récupérer le jeton pour les tests | voir réponse du login ci-dessus (`token` JSON) |

---

## 6. Dépannage

| Symptôme | Cause probable | Solution |
|----------|----------------|----------|
| `❌ Variables d'environnement manquantes…` | `.env` absent | `cp .env.example .env` puis renseigner `DB_*` et `JWT_SECRET` |
| `ER_ACCESS_DENIED_ERROR` | Mauvais mot de passe MySQL | Corriger `DB_PASSWORD` dans `.env` |
| `ECONNREFUSED` (port 3306) | MySQL n'écoute pas sur 3306 | Adapter `DB_PORT` (ex. MariaDB sur `3307`) |
| `Port 5000 déjà utilisé` / `EADDRINUSE` | Un backend tourne déjà (fenêtre précédente, `nodemon` resté actif, tâche planifiée) | Identifier le PID puis l'arrêter — voir ci-dessous |
| Erreurs CORS en dev | Frontend appelé par une autre origine | Vérifier `FRONTEND_URL` dans `.env` du backend |
| Upload refusé | Taille dépassée | Augmenter `MAX_FILE_SIZE` dans `.env` |

### Libérer le port 5000

C'est la panne la plus fréquente en développement : une fenêtre de terminal
fermée laisse parfois le processus Node vivant, et le backend suivant refuse
de démarrer.

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
> courant, ou le frontend si les deux tourneurs portent la même commande.

Si le port reste occupé après l'arrêt du processus, un autre programme
l'utilise (un proxy, un service de développement) : changez alors le port de
l'API dans `Backend/.env` (`PORT=5001`) et adaptez le proxy du frontend.

### Redémarrer le backend proprement

```bash
ss -ltnp | grep 5000        # identifier le vrai PID (éviter pkill global)
kill <PID>
cd Backend && DB_PORT=3306 nohup node src/server.js > /tmp/srsp-backend.log 2>&1 &
```

> ⚠️ Ne pas utiliser `pkill -f "node src/server.js"` : il peut tuer le shell courant.

---

## 7. Validation technique

- **Campagne fonctionnelle VISA** (bout en bout, API et base réelles) :
  `node Backend/scripts/test-e2e-visa.mjs` → **78 / 78**.
- **Données attendues par chaque écran** : `node Backend/scripts/test-ecrans.mjs` → **27 / 27**.
- **Tests du frontend** : `npm test` dans `Frontend` → **61 / 61** (5 fichiers).
- **Build** : `npm run build` dans `Frontend` → OK (dist généré).
- **Contrôle syntaxique du backend** : `node --check` sur tous les fichiers → OK.
- Le détail figure dans [RESULTS_TESTS.md](RESULTS_TESTS.md).