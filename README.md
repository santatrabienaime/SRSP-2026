# SRSP Fitovinany — Plateforme de gestion, suivi et traçabilité des dossiers administratifs

Plateforme web de gestion du **Service Régional de la Solde et des Pensions (SRSP) Fitovinany** pour le
suivi et la traçabilité des dossiers administratifs (visa, solde, pension, secours), conforme au
**cahier des charges v2.0** : workflow par type de dossier, RBAC sur 13 postes, 11 statuts,
numérotation automatique, historique complet, notifications et rapports.

---

## 🧱 Architecture

```
── Backend  : API REST Express + PostgreSQL 18 — port 5000
── Frontend : SPA React 19 + Vite + Tailwind CSS v4 — port 5173 (proxy /api → 5000)
```

| Brique      | Technologie                                              |
|-------------|----------------------------------------------------------|
| API         | Node.js (ESM), Express 4, JWT, bcryptjs, CORS                    |
| Base        | PostgreSQL 18, `pg` (pool), schéma et données dans `database/srsp_db.sql` |
| Upload      | multer (documents, courriers) — stockage local           |
| Rapports    | PDFKit (PDF), ExcelJS (XLSX)                             |
| Frontend    | React 19, React Router 7, Tailwind v4, Recharts, axios   |
| Qualité     | Smoke test SSR (`react-dom/server`), build Vite vérifié  |

## ✨ Fonctionnalités

- **Workflow par type de dossier** : Reçu → Enregistré → Orienté → Affecté → En traitement →
  (En attente de complément) → Soumis à vérification → (Correction demandée ⇄) Validé → Signé →
  Clôturé → Archivé, avec la règle stricte du cahier des charges : *« Correction demandée » ne peut
  pas passer directement à « Validé »*.
- **Module VISA complet** : référence VISA unique, type d'acte configurable, date et heure de
  réception, origine et présentateur, comptable, année de référence, vérificateur, bénéficiaire et
  organisme. Circuit **Signé → À archiver → Archivé**, signature réservée au Chef de Service,
  archivage conditionné à la signature et aux pièces d'archivage.
- **Pièces à quatre états** : présente, manquante, illisible, à corriger. Seule « présente »
  satisfait une pièce obligatoire ; les trois autres exigent un motif, conservé dans la fiche.
- **Validation bloquée sur dossier incomplet**, avec exception **motivée et tracée** réservée au
  Chef de Service.
- **RBAC sur 13 postes** : administrateur, chef de service, chef BAAF, coordinatrice, secrétaire,
  4 chefs de division et 4 agents techniques (verificateurs/liquidateur/chargé). L'administrateur
  technique ne détient **aucun** pouvoir de décision métier.
- **Numérotation automatique** : `{TYPE}-{ANNEE}-{6 chiffres}`, ex. `VISA-2026-000001`.
- **Gestion complète** : dossiers, documents (dépôt/téléchargement/suppression), courriers,
  agents, divisions, notifications, historique de traçabilité, archives.
- **Boîte de travail** : à traiter par moi, en attente de validation, incomplets, clôturés
  récemment, totaux par catégorie et par statut.
- **Recherche et filtres** : référence, bénéficiaire, type, statut, division, responsable, période —
  restreints au périmètre de l'utilisateur, appliqué par le serveur.
- **Tableau de bord & statistiques** : répartition par division/statut, évolution, indicateurs.
- **Rapports PDF et Excel** exportables, dont le rapport VISA et le rapport VISA par vérificateur.
- **Administration** : personnel (fiches et comptes de connexion réunis), rôles et permissions,
  référentiel (types d'actes, pièces requises par type et par acte).
- **Traçabilité des suppressions** : un dossier supprimé laisse une trace durable — motif, auteur,
  date et instantané de son journal.
- **Temps réel** : un canal WebSocket authentifié par le même jeton que l'API signale à chaque
  écran concerné qu'un dossier a changé d'état — tableau de bord, boîte de travail, liste et fiche
  se rafraîchissent seuls. Le canal ne transporte que l'alerte : la donnée affichée vient toujours
  de l'API. L'état de la connexion est affiché, jamais dégradé en silence.
- **Sécurité des sessions** : un compte désactivé ou un mot de passe modifié voit ses sessions
  **et son canal temps réel** coupés immédiatement, au millième de seconde près.
- **Mot de passe oublié, réellement opérationnel** : l'agent dépose une demande, un administrateur
  vérifie son identité et lui délivre un **code à usage unique** (quinze minutes) ; l'agent choisit
  lui-même son mot de passe. Ni e-mail, ni SMS — le canal retenu est l'administration du service.
  Les sessions ouvertes sont invalidées à la réinitialisation.
- **« À faire ensuite »** : en tête de chaque fiche, le dossier indique l'étape à venir et **le poste
  qui doit agir** — « à vous » ou « en attente du Chef de Division ». C'est l'information qui
  manque le plus dans une simple barre de boutons.
- **Enregistrement en brouillon** : une fiche incomplète peut être mise de côté, hors du circuit,
  visible de son seul auteur. Elle est publiée quand elle est prête.
- **Types d'opérations par division** : mandatement, liquidation, opposition, domiciliation… Les
  22 types du cahier sont configurés, et chaque opération porte sa propre liste de pièces.
- **Transmissions** : l'onglet *Transmissions* d'une fiche donne les bordereaux par lesquels le
  dossier a circulé — expéditeur, destinataire, date, référence — sans chercher dans plusieurs
  registres.
- **Module Secours complet** : visa du contrôle financier, références du logiciel Secours, état
  d'émargement, signature de l'ordonnateur et cachet, réunis dans l'onglet *Secours*.
- **Données propres à l'opération** (Solde, Pensions, Secours) : référence du dossier mère, période,
  montant saisi **avec sa source**, contrôle et validation — par l'agent qui instruit, puis par le
  chef de division qui contrôle. Jamais l'inverse, et **aucun calcul automatique**.
- **Correspondances suivies** : prescription, demande de dossier mère, opposition, derniers
  arrérages — avec référence, pièce liée, état de réponse et transmission centrale.
- **Versionnage des pièces** : un dépôt ne remplace pas le fichier, il crée la version suivante ; la
  précédente est conservée et ne peut plus être supprimée.
- **État « non applicable »** pour une pièce qui ne s'applique pas au dossier : elle ne bloque pas
  la validation et ne demande pas de motif.
- **Formulaires d'opération pilotés par la configuration** : chaque type d'opération (avance de
  solde, fiche de contrôle, transfert de localité, bon de caisse, liquidation, opposition…) porte
  **ses propres champs**, définis par l'administrateur depuis *Référentiel*. Un agent qui instruit
  une domiciliation ne voit ni « période concernée » ni « version produite ».
- **Module d'immatriculation de la Coordination** : demande avec référence attribuée, doublons de CIN
  et de matricule refusés avant l'attribution, insertion en paie, changements de mode de paiement
  avec motif obligatoire, et volumes d'activité.
- **Écran Territoire** : les antennes et leurs districts, la synthèse par antenne, et le rattachement
  d'un dossier à un district — avec l'historique de ses rattachements. Le périmètre géographique du
  service était calculé côté serveur, mais invisible dans l'interface.
- **Écran Performance** : indicateurs de traitement, dossiers en retard, répartition par division et
  par agent, évolution sur douze mois. Tous les chiffres sont restreints au périmètre de chacun.
- **Bilan de conformité** : l'état des 514 exigences du cahier, exigence par exigence — ce qui est
  livré, ce qui est partiel, ce qui est inerte, ce qui reste à construire, avec le motif de chacune.
  Ce registre était dans la base sans qu'aucun écran ne le montre.
- **Traçabilité du dépouillement** : l'historique chronologique des contrôles de pièces — qui, quelle
  pièce, quand — distinct de la check-list qui montre l'état courant.
- **Fin du cycle Secours** : l'archivage de la copie signée, dernier acte du mandatement.
- **Rapports par division** : opérations d'une division, opérations par type, suivi des dossiers
  Secours — en PDF et Excel, paramétrés par division et période.
- **Triage des dossiers, ouvert à tous les profils** : un tri complet — par statut du circuit,
  **niveau de priorité**, priorité, type, demandeur, échéance, ancienneté, dossiers signalés — et
  deux **regroupements** qui découpent la liste en sections avec leur effectif : par statut, ou par
  **niveau de priorité** (urgent d'abord). Chaque agent trie sa file, chaque chef de division trie
  sa division, chaque chef de service trie le service.
- **Circulation visible et cherchable** : la liste porte le **dernier mouvement** de chaque dossier
  (dernier acte et sa date) ; le journal se cherche par numéro, référence visa, **demandeur** ou
  **matricule** — la circulation d'une personne se retrouve sans connaître son numéro de dossier.
- **Onglets par type pour le secrétariat** : l'écran *Dossiers* du secrétariat est découpé en
  **Visas, Soldes, Pensions, Secours** — et non par avancement du traitement. Chaque onglet porte
  son effectif, calculé par le serveur, et se cumule avec les filtres rapides (nouveaux, urgents,
  incomplets, brouillons).

## 🚀 Démarrage rapide

### ⚡ En une commande (recommandé)

```bash
./start.sh        # Linux / macOS : PostgreSQL + backend + frontend
./start.sh status   # état des services
./start.sh restart  # redémarre les deux
./start.sh stop     # arrête les deux
```

```powershell
.\start-all.ps1   # Windows PowerShell : PostgreSQL + backend + frontend
```

- Backend → `http://localhost:5000` · Frontend → `http://localhost:5173`
- Logs : `tail -f /tmp/srsp-backend.log` et `tail -f /tmp/srsp-frontend.log`

### Manuel (première installation)

Prérequis : **Node.js ≥ 20** et **PostgreSQL 18** en local.

> ℹ️ Le dépôt fournit `database/srsp_db.sql` : schéma PostgreSQL, données de
> référence et comptes de démonstration. Il s'importe dans une base `srsp_db`
> vide (voir `docs/MANUEL_DEMARRAGE.md`).

```bash
# 1. Lancement de l'API
cd Backend
cp .env.example .env        # puis renseigner les identifiants DB et JWT_SECRET
npm install
npm start                   # → http://localhost:5000  (vérifier /api/health)

# 2. Frontend (nouveau terminal)
cd ../Frontend
npm install
npm run dev                 # → http://localhost:5173
```

> Détails pas à pas (Prérequis, PostgreSQL, variables d'environnement, dépannage) :
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
| [docs/CONFORMITE_CAHIER.md](docs/CONFORMITE_CAHIER.md) | **Correspondance point par point avec le cahier des fonctionnalités v2.0** : ce qui est en place, ce qui reste à valider, ce qui reste à développer. |
| [docs/PROTOCOLE_RECETTE_T18.md](docs/PROTOCOLE_RECETTE_T18.md) | **Protocole de la recette avec les agents** (test T18) : déroulé, tâches par profil, grille de synthèse. |
| [docs/MANUEL_DEMARRAGE.md](docs/MANUEL_DEMARRAGE.md) | Installation, configuration, lancement backend + frontend, réinitialisation de la base, dépannage. |
| [docs/MANUEL_UTILISATEUR.md](docs/MANUEL_UTILISATEUR.md) | Guide d'usage par profil : connexion, boîte de travail, création de dossier, circuit VISA, dépouillement, pièces jointes, recherche, rapports. |
| [docs/GUIDE_ADMIN.md](docs/GUIDE_ADMIN.md) | Administration technique : comptes, rôles et permissions, référentiel (types d'actes, pièces requises), journal d'audit, sauvegarde PostgreSQL. |
| [docs/SAUVEGARDE_RESTITUTION.md](docs/SAUVEGARDE_RESTITUTION.md) | Procédure de sauvegarde et de restauration, politique de conservation, test de restauration mensuel. |
| [docs/BASE_DE_DONNEES.md](docs/BASE_DE_DONNEES.md) | Schéma complet de `srsp_db`, **généré à partir de la base vivante**. |
| [docs/RESULTS_TESTS.md](docs/RESULTS_TESTS.md) | Résultats des campagnes de tests, anomalies corrigées, limites. |
| [docs/FORMATION.md](docs/FORMATION.md) | Plan de formation en cinq séances, exercices et quiz de contrôle. |
| [docs/API.md](docs/API.md) | Référence complète de l'API REST : authentification, dossiers, workflow, VISA, documents, référentiel, rapports, administration. |

## 📁 Structure du dépôt

```
SRSP-2026/
├── Backend/
│   ├── src/
│   │   ├── config/        # env, db, cors, multer, logger
│   │   ├── controllers/   # logique métier par ressource
│   │   ├── middleware/    # auth, RBAC, validation, erreurs
│   │   ├── models/        # accès PostgreSQL
│   │   ├── routes/        # 28 routeurs REST (dossiers, workflow, documents, mandatement…)
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
│       └── config/        # constants.js (statuts, rôles, workflow, états de pièce)
├── Backend/scripts/       # tests de bout en bout, audit et générateur de documentation
├── database/              # srsp_db.sql : dump PostgreSQL de référence (schéma + données)
└── docs/                  # manuels, guides, API, schéma, tests, formation
```

## ✅ État de validation

| Campagne | Commande | Résultat |
|---|---|---|
| Circuit VISA de bout en bout (API et base réelles) | `node Backend/scripts/test-e2e-visa.mjs` | **78 / 78** — 0 échec |
| Réinitialisation de mot de passe de bout en bout | `node Backend/scripts/test-e2e-reinitialisation.mjs` | **23 / 23** — 0 échec |
| Canal temps réel de bout en bout (Socket.IO) | `node Backend/scripts/test-e2e-temps-reel.mjs` | **17 / 17** — 0 échec |
| Fonctions d'ergonomie (« à faire ensuite », brouillon, transmissions) | `node Backend/scripts/test-e2e-ergonomie.mjs` | **34 / 34** — 0 échec |
| Données d'opération, versionnage, état « non applicable » | `node Backend/scripts/test-e2e-operations.mjs` | **50 / 50** — 0 échec |
| Module d'immatriculation de la Coordination | `node Backend/scripts/test-e2e-immatriculation.mjs` | **22 / 22** — 0 échec |
| Circuit Secours de bout en bout | `node Backend/scripts/test-e2e-secours.mjs` | **20 / 20** — 0 échec |
| Droits et routes : cohérence | `node Backend/scripts/test-e2e-droits.mjs` | **2 / 2** — 0 échec |
| Données attendues par chaque écran | `node Backend/scripts/test-ecrans.mjs` | **53 / 53** — 0 échec |
| Points d'entrée du tableau de bord, tous profils | `node Backend/scripts/test-e2e-tableaux-bord.mjs` | **91 / 91** — 0 échec |
| Cohérence des chiffres du tableau de bord (contre le SQL) | `node Backend/scripts/test-e2e-coherence-tableau-bord.mjs` | **14 / 14** — 0 échec |
| Noms d'onglets des exports Excel | `node Backend/scripts/test-e2e-exports-excel.mjs` | **15 / 15** — 0 échec |
| **Balayage de toute l'API, tous profils** | `node Backend/scripts/test-e2e-balayage-api.mjs` | **1 560 appels — 0 erreur** |
| **Triage des dossiers : tris et regroupement par statut et par niveau** | `node Backend/scripts/test-e2e-tri-dossiers.mjs` | **35 / 35** — 0 échec |
| **Audit des doublons de codes et des résidus** | `node Backend/scripts/audit-doublons.mjs` | **0 anomalie** — 0 doublon, 0 résidu |
| **Couverture de l'API** — chaque route a son écran, chaque écran sa route | `node Backend/scripts/audit-api-frontend.mjs` | **222 routes — 0 orpheline, 0 appel cassé** |
| Tests du frontend | `cd Frontend && npm test` | **141 / 141** — 16 fichiers, 0 échec |
| Construction de production | `cd Frontend && npm run build` | **OK** |
| Contrôle syntaxique du backend | `node --check` sur tous les fichiers | **OK** |
| Contrôle d'encodage des sources et de la documentation | `node Backend/scripts/verifier-encodage.mjs` | **OK** — 354 fichiers, 0 défaut |
| Restauration PostgreSQL | import de `database/srsp_db.sql` dans une base de test | **OK** — 61 tables, 1 442 lignes |

**Total backend : 502 contrôles, 502 réussis, 0 échec — plus 1 560 appels de balayage, tous sans erreur.**
**Total frontend : 141 tests, 141 réussis, 0 échec.**

Le détail des contrôles, les anomalies corrigées et les limites de la campagne
figurent dans [docs/RESULTS_TESTS.md](docs/RESULTS_TESTS.md).
