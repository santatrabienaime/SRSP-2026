# CHAPITRE 4 : ANALYSE PRÉALABLE

## 4.1 Analyse de l'existant

### 4.1.1 Organisation actuelle

Le SRSP Fitovinany traite les dossiers administratifs selon un circuit manuel et papier. Voici le diagramme de flux de l'organisation actuelle :

```mermaid
graph TD
    A[Réception au guichet] --> B[Enregistrement manuel dans un registre]
    B --> C[Orientation vers la division concernée]
    C --> D[Transmission physique du dossier]
    D --> E[Instruction par l'agent]
    E --> F[Dépôt des pièces justificatives]
    F --> G[Contrôle manuel des pièces]
    G --> H{Dossier complet ?}
    H -->|Oui| I[Transmission au Chef de Division]
    H -->|Non| J[Demande de complément (oral/écrit)]
    J --> E
    I --> K[Vérification par le Chef de Division]
    K --> L{Validation ?}
    L -->|Oui| M[Transmission au Chef de Service]
    L -->|Non| N[Demande de correction (motif)]
    N --> E
    M --> O[Signature par le Chef de Service]
    O --> P[Archivage manuel]
    P --> Q[Classement physique]

    style A fill:#e1f5fe
    style Q fill:#c8e6c9
    style H fill:#fff9c4
    style L fill:#fff9c4
```

**Acteurs impliqués :**
- **Secrétaire** : réception, enregistrement, orientation, transmission
- **Agent de traitement** : instruction, dépôt et contrôle des pièces
- **Chef de Division** : vérification, validation, correction
- **Chef de Service** : signature, archivage
- **Coordination** : immatriculation, statistiques

**Supports utilisés :**
- Registres papier (réception, transmission, archivage)
- Dossiers physiques (chemises, classeurs)
- Pièces justificatives (copies papier)
- Bordereaux de transmission (papier)
- Tableaux Excel (suivi manuel)

### 4.1.2 Critique de l'existant

| Problème | Impact | Fréquence |
|---|---|---|
| **Perte de dossiers** | Dossier introuvable, retard de traitement | Fréquent |
| **Absence de traçabilité** | Impossible de savoir qui a fait quoi et quand | Permanent |
| **Dossiers bloqués silencieusement** | Aucune alerte quand un dossier est bloqué | Fréquent |
| **Contrôle des pièces manuel** | Pièces manquantes non détectées avant la validation | Fréquent |
| **Transmission non tracée** | Impossible de savoir où se trouve un dossier | Permanent |
| **Rapports manuels** | Production longue et sujette à erreurs | Hebdomadaire |
| **Pas de cloisonnement** | Tout le monde voit tout | Permanent |
| **Pas de temps réel** | Les écrans ne se rafraîchissent pas | Permanent |
| **Pas de statistiques** | Impossible de mesurer la performance | Permanent |
| **Saisies répétées** | Même information saisie plusieurs fois | Fréquent |
| **Pas de versionnage** | Les pièces remplacées écrasent les précédentes | Occasionnel |
| **Pas de signalement** | Les difficultés ne sont pas remontées | Fréquent |

### 4.1.3 Moyens existants pour la réalisation du projet

| Ressource | État actuel |
|---|---|
| **Personnel** | Secrétaire, agents de traitement, chefs de division, chef de service, coordination, administrateur |
| **Matériel** | Postes de travail, imprimantes, réseau local |
| **Logiciels** | Navigateur web, Microsoft Office (Excel), registres papier |
| **Données** | Dossiers physiques, registres, tableaux Excel |

---

## 4.2 Choix de la solution

### 4.2.1 Solutions envisagées

| Solution | Avantages | Inconvénients |
|---|---|---|
| **A. Continuer en papier** | Aucun coût | Problèmes persistants, pas d'évolution |
| **B. Tableur Excel partagé** | Simple, connu | Pas de workflow, pas de traçabilité, pas de cloisonnement |
| **C. Application web sur mesure** | Adaptée au besoin, évolutive, traçable | Coût de développement, maintenance |
| **D. ERP générique (Odoo, etc.)** | Fonctionnalités riches | Surdimensionné, coûteux, complexe à adapter |

### 4.2.2 Solution retenue

La solution **C — Application web sur mesure** a été retenue pour les raisons suivantes :

1. **Adaptation au besoin** : le circuit administratif du SRSP est spécifique (visa, solde, pension, secours) et ne correspond pas à un ERP générique.
2. **Traçabilité** : le cahier des charges exige un historique figé, des notifications et des signalements.
3. **Cloisonnement** : le RBAC et le périmètre par division sont indispensables.
4. **Évolutivité** : le référentiel est configurable (types de dossiers, pièces, statuts, schémas d'opération).
5. **Coût** : développement interne, pas de licence.
6. **Accessibilité** : application web accessible depuis tout navigateur, sans installation.

---

## 4.3 Choix de la méthode de conception / gestion de projet

### 4.3.1 Méthode retenue

La méthode retenue est une approche **itérative et incrémentale**, inspirée de l'agilité, avec les caractéristiques suivantes :

- **Itérations courtes** : chaque lot livre des fonctionnalités utilisables
- **Validation continue** : tests unitaires (147), tests E2E (53), audit API (222 routes)
- **Documentation au fil de l'eau** : guides, manuels, UML mis à jour à chaque lot
- **Conformité au cahier** : registre des 460 exigences, état mesuré

### 4.3.2 Justification

- Le cahier des charges est **détaillé et structuré** (460 exigences)
- Les utilisateurs sont **disponibles** pour la validation
- Les **tests automatisés** permettent de valider rapidement chaque itération
- La **traçabilité** (Git, historique) permet de suivre l'évolution

---

## 4.4 Choix de l'outil de conception

### 4.4.1 UML (Unified Modeling Language)

| Diagramme | Usage |
|---|---|
| **Cas d'utilisation** | Identifier les acteurs et les fonctionnalités |
| **Séquence** | Modéliser les interactions entre les composants |
| **État** | Modéliser le cycle de vie des dossiers et des pièces |
| **Classes** | Modéliser les entités et leurs relations |
| **Paquetage** | Organiser le code en modules |
| **Déploiement** | Modéliser l'infrastructure |

### 4.4.2 Outils complémentaires

| Outil | Usage |
|---|---|
| **PlantUML** | Génération des diagrammes UML (8 diagrammes dans `docs/UML.puml`) |
| **Mermaid** | Diagrammes intégrés au Markdown (GitHub) |
| **PostgreSQL** | Modélisation relationnelle, contraintes, index |
| **Git / GitHub** | Versionnement et collaboration |

---

## 4.5 Choix du langage de programmation

### 4.5.1 Backend : JavaScript (Node.js)

| Critère | Justification |
|---|---|
| **Unicité** | Même langage côté client et serveur (JavaScript) |
| **Écosystème** | npm : Express, pg, JWT, bcryptjs, multer, PDFKit, ExcelJS, Socket.io |
| **Performance** | Event loop non bloquant, adapté aux I/O (base de données, fichiers) |
| **Communauté** | Large communauté, documentation abondante |
| **Typage** | Modules ES (`"type": "module"`) |

### 4.5.2 Frontend : JavaScript (React)

| Critère | Justification |
|---|---|
| **Composants** | Architecture par composants réutilisables |
| **Hooks** | Logique réutilisable (useAuth, useApi, useDebounce, etc.) |
| **Écosystème** | React Router, Axios, Tailwind CSS, Socket.io-client |
| **Performance** | Virtual DOM, rendu optimisé |
| **Testabilité** | Vitest, Testing Library |

---

## 4.6 Choix du Framework

### 4.6.1 Backend : Express.js

| Critère | Justification |
|---|---|
| **Légèreté** | Framework minimaliste, pas de magie |
| **Middleware** | Chaîne de middlewares (auth, RBAC, scope, upload, erreurs) |
| **Flexibilité** | Organisation MVC adaptée, services et modèles |
| **Communauté** | Le plus utilisé pour Node.js |

### 4.6.2 Frontend : React + Vite

| Critère | Justification |
|---|---|
| **React** | Composants fonctionnels, hooks, Context API |
| **Vite** | Bundler ultra-rapide, HMR instantané |
| **Tailwind CSS** | Styles utilitaires, responsive, dark mode |
| **React Router** | Routage côté client, routes protégées |

---

## 4.7 Choix de l'environnement de développement

### 4.7.1 Environnement

| Élément | Choix | Justification |
|---|---|---|
| **Éditeur** | VS Code | Extensions, intégration Git, terminal intégré |
| **Runtime** | Node.js 22+ | LTS, performance, compatibilité |
| **Base de données** | PostgreSQL 18 | Robustesse, conformité SQL, collation ICU |
| **Versionnement** | Git + GitHub | Collaboration, traçabilité, CI/CD |
| **Tests** | Vitest + Testing Library | Rapide, compatible React, mocking facile |
| **Linting** | Oxlint | Rapide, règles React et ESLint |
| **Bundler** | Vite 8 | HMR instantané, build optimisé |

### 4.7.2 Structure du projet

```
SRSP-2026/
├── Backend/
│   ├── src/
│   │   ├── config/          # db.js, env.js, multer.js, logger.js, cors.js
│   │   ├── controllers/     # dossierController, documentController, ...
│   │   ├── middlewares/     # authMiddleware, rbacMiddleware, scopeDossiersMiddleware, ...
│   │   ├── models/          # dossierModel, documentModel, depouillementModel, ...
│   │   ├── routes/          # dossierRoutes, documentRoutes, rapportRoutes, ...
│   │   ├── services/        # dossierService, documentService, rapportService, ...
│   │   └── utils/           # constants.js, httpError.js, ...
│   ├── scripts/             # test-ecrans.mjs, audit-api-frontend.mjs, ...
│   ├── .env                 # Configuration (DB, JWT, etc.)
│   └── package.json
├── Frontend/
│   ├── src/
│   │   ├── components/      # dossier/, ui/, layout/, fields/
│   │   ├── pages/           # dashboard/, dossiers/, rapports/, performance/, ...
│   │   ├── services/        # dossierService, documentService, rapportService, ...
│   │   ├── contexts/        # AuthContext, UIContext, TempsReelContext, ...
│   │   ├── hooks/           # useAuth, useApi, useDebounce, usePagination, ...
│   │   ├── config/          # constants.js, triage.js
│   │   └── utils/           # formatDate, landing, notificationTarget, ...
│   ├── package.json
│   └── vite.config.js
├── database/
│   ├── srsp_db.sql          # Dump de référence (61 tables, 1442 lignes)
│   └── migrations/          # Migrations (REJETEE, 001-fixes)
├── docs/                    # Documentation complète
├── start-all.ps1            # Script de démarrage
└── README.md
```

---

## 4.8 Choix du système de gestion de base de données

### 4.8.1 Choix : PostgreSQL 18

| Critère | Justification |
|---|---|
| **Robustesse** | ACID, contraintes d'intégrité, transactions |
| **Conformité SQL** | Standard SQL, pas de dialectes propriétaires |
| **Collation** | ICU `ci` (insensible à la casse) pour les recherches textuelles |
| **Timezone** | `Africa/Nairobi` (UTC+3) pour les horodatages |
| **Performance** | Index, vues matérialisées, requêtes optimisées |
| **Évolutivité** | Partitionnement, réplication, clustering |
| **Communauté** | Large communauté, documentation abondante |
| **Licence** | Open source (PostgreSQL License) |

### 4.8.2 Pourquoi pas MySQL/MariaDB ?

| Critère | MySQL/MariaDB | PostgreSQL |
|---|---|---|
| **Collation insensible à la casse** | Natif mais limité | ICU `ci` (complet) |
| **Contraintes d'intégrité** | Partielles | Complètes (CHECK, FK, UNIQUE) |
| **Transactions DDL** | Non | Oui (CREATE, ALTER, DROP sont transactionnels) |
| **Types de données** | Limités | Riches (JSON, arrays, enums, etc.) |
| **Fonctions** | DATEDIFF, CURDATE() (non standard) | Fonctions standards + custom |
| **Maturité** | Mature | Très mature, orienté entreprise |

### 4.8.3 Migration MySQL → PostgreSQL

Le projet a été migré de MySQL/MariaDB vers PostgreSQL 18. Les adaptations effectuées :

| Adaptation | Description |
|---|---|
| **Placeholders** | `?` → `$1, $2, ...` (via `convertirPlaceholders` dans `db.js`) |
| **Identifiants** | Backticks `` ` `` → guillemets doubles `"` |
| **CURDATE()** | → `CURRENT_DATE` (via `preparerSql` dans `db.js`) |
| **DATEDIFF()** | → fonction custom `datediff(timestamp, timestamp)` |
| **ER_DUP_ENTRY** | → code PostgreSQL `23505` (unique_violation) |
| **ER_ROW_IS_REFERENCED_2** | → code PostgreSQL `23503` (foreign_key_violation) |
| **GROUP BY alias** | → expression complète (PostgreSQL ne supporte pas les alias dans GROUP BY) |
| **RETURNING** | Ajout automatique de `RETURNING *` sur les INSERT pour conserver `insertId` |
| **Collation** | `utf8mb4_general_ci` → ICU `ci` |
| **Timezone** | UTC → `Africa/Nairobi` |

### 4.8.4 Caractéristiques techniques de la base

| Caractéristique | Valeur |
|---|---|
| **Tables** | 61 |
| **Index** | 165 |
| **Clés étrangères** | 102 |
| **Contraintes CHECK** | 12 (dont `chk_depouillements_etat`) |
| **Fonctions custom** | 2 (`datediff`, `set_updated_at`) |
| **Collation** | ICU `ci` (insensible à la casse) |
| **Timezone** | Africa/Nairobi (UTC+3) |
| **Encodage** | UTF-8 |
| **Template** | template0 |

---

*Fin du Chapitre 4 — Analyse préalable du projet SRSP Fitovinany*