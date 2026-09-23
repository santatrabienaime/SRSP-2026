# Manuel de démarrage — SRSP Fitovinany

Guide pas à pas pour installer, configurer et lancer la plateforme (backend + frontend + base de
données), puis la remettre en marche après un arrêt.

---

## 0. Démarrage en une commande ⚡

Une fois l'installation effectuée (§ 1 à 3), lancer **tout** (backend + frontend + détection
automatique du port MariaDB) d'un seul coup :

```bash
./start.sh        # démarre (ou réutilise) backend + frontend — idempotent
./start.sh restart  # redémarre les deux
./start.sh stop     # arrête les deux
./start.sh status   # état des services
./start.sh init     # réinitialise la base (idempotent) puis démarre
```

- Backend → `http://localhost:5000` (`/api/health`)
- Frontend → `http://localhost:5173`
- Logs → `/tmp/srsp-backend.log` et `/tmp/srsp-frontend.log`

> Le script détecte le port MariaDB en sondant `3307` puis `3306`, en vérifiant que
> `srsp_db` contient bien la table `roles` ; il retombe sinon sur `DB_PORT` du `.env`.

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
| `JWT_SECRET` | *(à changer en prod)* | Secret de signature des jetons |
| `JWT_EXPIRES_IN` | `1d` | Durée de validité des jetons |
| `MAX_FILE_SIZE` | `10485760` (10 Mo) | Taille max des uploads |
| `RATE_LIMIT_ENABLED` | activé hors développement | `true`/`false` — **désactivé par défaut en dev** (le message « Trop de requêtes » n'apparaît plus) |
| `RATE_LIMIT_MAX` | `200` | Requêtes autorisées par fenêtre |
| `RATE_LIMIT_WINDOW_MS` | `900000` (15 min) | Fenêtre de limitation |
| `FRONTEND_URL` | `http://localhost:5173` | Origine autorisée en CORS |

### 2.2 Initialisation de la base (création + seeds)

```bash
# Depuis le dossier Backend — adapter DB_PORT si la base écoute sur un autre port
DB_PORT=3306 node database/init.js
```

Ce script :
1. Crée la base `srsp_db` (si absente) avec `utf8mb4_unicode_ci` ;
2. Applique le schéma (tables, index, contraintes) — **idempotent** ;
3. Insère les données de référence (13 rôles, 11 statuts, 4 types de dossiers, 4 priorités,
   4 divisions, fonctions, types de courriers/documents, permissions) — **idempotent** grâce
   aux clés `UNIQUE` ;
4. Crée les **14 comptes** de démonstration (§ 4 ci-dessous) ainsi que les agents rattachés.

> ✅ La commande peut être relancée autant de fois que nécessaire : elle ne duplique rien.

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
| Réinitialiser la base | `cd Backend && DB_PORT=3306 node database/init.js` (idempotent) |
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
| `Port 5000 déjà utilisé` | Un backend tourne déjà | `ss -ltnp \| grep 5000` puis `kill <PID>` du processus, relancer |
| Erreurs CORS en dev | Frontend appelé par une autre origine | Vérifier `FRONTEND_URL` dans `.env` du backend |
| Upload refusé | Taille dépassée | Augmenter `MAX_FILE_SIZE` dans `.env` |

### Redémarrer le backend proprement

```bash
ss -ltnp | grep 5000        # identifier le vrai PID (éviter pkill global)
kill <PID>
cd Backend && DB_PORT=3306 nohup node src/server.js > /tmp/srsp-backend.log 2>&1 &
```

> ⚠️ Ne pas utiliser `pkill -f "node src/server.js"` : il peut tuer le shell courant.

---

## 7. Validation technique

- **Smoke test SSR** : `node /tmp/opencode/srsp-smoke.mjs` (rendu de 30 routes avec
  `react-dom/server`, aucun import/rendu en erreur). Pour l'exécuter, placer le script dans
  `Frontend/node_modules/.cache/` afin que Node résolve `vite` et `react-dom`.
- **Build** : `npm run build` dans `Frontend` → OK (dist généré).
- **API** : workflow, RBAC, notifications, historique, upload, rapports PDF/Excel, référentiel,
  téléchargement de documents, filtre par type — vérifiés par curl.