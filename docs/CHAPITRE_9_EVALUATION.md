# CHAPITRE 9 : ÉVALUATION ET SUGGESTIONS

## 9.1 Évaluation de l'application (comparaison avec des solutions existantes)

### 9.1.1 Critères d'évaluation

L'évaluation de l'application SRSP Fitovinany est conduite selon cinq critères :

| Critère | Définition |
|---|---|
| **Fonctionnalité** | Couverture des exigences du cahier des charges v2.0 |
| **Ergonomie** | Facilité d'utilisation, intuitivité, accessibilité |
| **Performance** | Temps de réponse, temps de chargement, scalabilité |
| **Sécurité** | Authentification, autorisation, cloisonnement, traçabilité |
| **Maintenabilité** | Qualité du code, documentation, tests, évolutivité |

### 9.1.2 Évaluation par critère

#### Fonctionnalité

Le registre de conformité (`docs/CONFORMITE_CAHIER.md`) mesure l'état de **460 exigences** du cahier des charges v2.0 :

| État | Nombre | Part |
|---|---|---|
| **Livrée** | **364** | **79 %** |
| Hors plateforme (autre système, autre direction, procédure RH) | 61 | 13 % |
| Non construite | 22 | 5 % |
| Partielle | 13 | 3 % |

| Document | Livrées |
|---|---|
| Cahier v2.0 — fonctionnalités obligatoires | **172 / 180 — 96 %** |
| Cahier v2.0 — fonctionnalités historiques | 192 / 280 — 69 % |

**Fonctionnalités livrées (exemples) :**
- Workflow complet par type de dossier (Reçu → Archivé)
- Module VISA complet (référence unique, type d'acte, vérificateur, signature, archivage)
- Contrôle des pièces à 6 états (Présente, Absente, Rejetée, Illisible, À corriger, Non applicable)
- Validation bloquée sur dossier incomplet, avec dérogation motivée
- RBAC sur 13 postes
- Numérotation automatique `{TYPE}-{ANNEE}-{6 chiffres}`
- Gestion complète (dossiers, documents, courriers, agents, divisions, notifications, historique, archives)
- Boîte de travail (4 files + totaux)
- Recherche et filtres (référence, bénéficiaire, type, statut, division, responsable, période)
- Tableau de bord et statistiques (répartition, évolution, indicateurs)
- Rapports PDF et Excel exportables (15 rapports)
- Administration (personnel, rôles, permissions, référentiel)
- Traçabilité des suppressions (motif, auteur, date, instantané)
- Temps réel (WebSocket)
- Sessions sécurisées (révocation immédiate)
- Mot de passe oublié (code à usage unique, 15 min)
- Enregistrement en brouillon (hors circuit)
- Versionnage des pièces (dépôt = version suivante, précédente conservée)
- État « non applicable » pour les pièces non requises
- Formulaires d'opération pilotés par la configuration
- Module d'immatriculation de la Coordination
- Écran Territoire (antennes, districts, synthèse)
- Écran Performance (indicateurs, retards, répartition, évolution)

**Fonctionnalités hors périmètre (61) :** concernent d'autres systèmes (SIIGFP, SIIGMP), d'autres directions (RH, paie), ou des procédures administratives hors plateforme.

**Fonctionnalités non construites (22) :** concernent des modules non prioritaires (congés, situations FCC/BCSE, Augure, paiements) qui n'ont pas de source de données.

#### Ergonomie

| Aspect | Évaluation |
|---|---|
| **Peu de clics** | Le tableau de bord mène à la file en un clic ; la fiche mène à l'action en deux |
| **Un écran = un objectif** | Écrans distincts pour réception, traitement, vérification, signature, archivage |
| **Saisie une seule fois** | Division déduite du type ; type d'opération porté par le sous-type ; pièces issues du référentiel |
| **Champs conditionnels** | Les champs VISA n'apparaissent que pour le VISA ; le type d'opération que pour les divisions qui en distinguent |
| **Libellés simples** | « Soumettre au Chef de Division » plutôt que « transition SOUMIS_A_VERIFICATION » |
| **Prochaine action visible** | Bloc « À faire ensuite » en tête de fiche (étape, poste attendu, bouton) |
| **Messages compréhensibles** | Les messages nomment ce qui manque et ce qu'il faut faire |
| **Pas de suppression silencieuse** | Suppression réservée à l'administrateur, motif obligatoire, trace durable |
| **Adaptation écran** | Barre latérale repliable, tableaux défilables, consultation sur tablette |

#### Performance

| Aspect | Évaluation |
|---|---|
| **Temps de chargement** | < 2 s pour les écrans principaux (données paginées) |
| **Temps de réponse API** | < 500 ms pour les requêtes simples, < 2 s pour les rapports |
| **Scalabilité** | Pagination (max 500 dossiers par requête), index PostgreSQL, pool de connexions |
| **Temps réel** | WebSocket (Socket.io) pour le rafraîchissement automatique |
| **Optimisation** | Requêtes SQL optimisées, chargement par panneau (pas de `Promise.all` global) |

#### Sécurité

| Aspect | Évaluation |
|---|---|
| **Authentification** | JWT (8h), bcrypt (coût 10), révocation immédiate |
| **Autorisation** | RBAC : 13 rôles, permissions granulaires |
| **Cloisonnement** | Par division et par agent, appliqué par le serveur (pas seulement l'interface) |
| **Traçabilité** | Journal d'audit complet, historique figé, notifications |
| **Upload** | Multer, nom UUID, validation extension/taille, stockage privé |
| **Téléchargement** | Route authentifiée, résolution de chemin sous la racine uploads |
| **SQL** | Requêtes paramétrées, pas de concaténation |
| **Sessions** | Pas de persistence localStorage (rafraîchissement = login) |

#### Maintenabilité

| Aspect | Évaluation |
|---|---|
| **Tests** | 147 tests unitaires frontend, 53 vérifications E2E, 222 routes auditées |
| **Documentation** | 10 documents (README, API, BASE_DE_DONNEES, FORMATION, MANUEL_UTILISATEUR, CONFORMITE_CAHIER, GUIDE_ADMIN, PROTOCOLE_RECETTE_T18, RESULTS_TESTS, SAUVEGARDE_RESTITUTION) + UML (8 diagrammes) + Chapitres 3-7 |
| **Code** | Séparation des couches (routes, controllers, services, models), constantes centralisées |
| **Versionnement** | Git + GitHub, 20+ commits atomiques |
| **Migration** | PostgreSQL 18, migrations versionnées, dump de référence |

### 9.1.3 Comparaison avec des solutions existantes

| Critère | SRSP Fitovinany | Solution papier | Solution Excel partagé | ERP générique (Odoo) |
|---|---|---|---|---|
| **Circuit de traitement** | Automatisé, statuts distincts | Manuel, papier | Manuel, tableau | Configurable mais complexe |
| **Traçabilité** | Historique figé, journal d'audit | Aucune | Limitée | Complète mais complexe |
| **Cloisonnement** | Par division et par agent (serveur) | Aucun | Aucun | Complexe à configurer |
| **Pièces justificatives** | 6 états, motif obligatoire, versionnage | Manuel | Aucun | Basique |
| **Signalements** | Remontée sans changer le statut | Oral | Aucun | Aucun |
| **Rapports** | 15 rapports PDF/Excel, cloisonnés | Manuels | Manuels | Riches mais complexes |
| **Temps réel** | WebSocket (Socket.io) | Non | Non | Non |
| **Sécurité** | JWT, RBAC, sessions révocables | Aucune | Aucune | Complète mais complexe |
| **Coût** | Développement interne, licence gratuite | Faible | Faible | Élevé (licence + personnalisation) |
| **Adaptation** | Sur mesure pour le SRSP | — | — | Surdimensionné |

**Conclusion de la comparaison :** SRSP Fitovinany offre une solution **sur mesure** qui répond précisément aux besoins du service, avec un coût minimal (développement interne, technologies open source) et une traçabilité complète. Les solutions génériques (ERP) sont surdimensionnées et coûteuses ; les solutions manuelles (papier, Excel) ne répondent pas aux exigences de traçabilité et de cloisonnement.

---

## 9.2 Contributions académiques et professionnelles

### 9.2.1 Contributions techniques

| Contribution | Description |
|---|---|
| **Migration MySQL → PostgreSQL** | Couche de compatibilité (`db.js`) traduisant les placeholders `?`, les backticks, `CURDATE()`, et la gestion des codes d'erreur (23505, 23503). Fonction `datediff()` custom. |
| **RBAC sur 13 postes** | Système de permissions granulaires avec 13 rôles et cloisonnement par division/agent appliqué par le serveur. |
| **Temps réel** | Canal WebSocket authentifié par JWT, révocation immédiate des sessions, rafraîchissement automatique des écrans. |
| **Versionnage des pièces** | Dépôt = version suivante, précédente conservée, suppression de toute version (doublon ou scan erroné) par le déposant ou le contrôleur. |
| **Contrôle des pièces à 6 états** | Présente, Absente, Rejetée, Illisible, À corriger, Non applicable — avec motif obligatoire pour les états non satisfaisants. |
| **Signalement sans changement de statut** | Le signalement porte la difficulté, il ne remplace pas le circuit. Traçabilité complète. |
| **Données d'opération par division** | Saisie par les agents, contrôle par les chefs, sans calcul automatique. Schémas pilotés par la configuration. |
| **Cloisonnement des rapports** | Application du périmètre (`filterFor`/`perimetrePour`) à tous les rapports et aux performances. |

### 9.2.2 Contributions méthodologiques

| Contribution | Description |
|---|---|
| **Registre de conformité** | 460 exigences du cahier, état mesuré par `etat-fonctionnalites.mjs`, campagne `test-e2e-droits.mjs` |
| **Tests automatisés** | 147 tests unitaires frontend, 53 vérifications E2E, 222 routes auditées |
| **Documentation complète** | 10 documents + UML (8 diagrammes PlantUML) + Chapitres 3-7 |
| **Migration PostgreSQL** | Migration complète de MySQL vers PostgreSQL 18 avec couche de compatibilité |

### 9.2.3 Contributions professionnelles

| Contribution | Description |
|---|---|
| **Traçabilité complète** | Journal d'audit figé, historique des actions, notifications, signalements |
| **Cloisonnement par division** | Chaque chef de division ne voit que sa division, chaque agent que ses dossiers |
| **Validation bloquée** | Aucun blocage silencieux : un champ manquant est expliqué, jamais masqué par un bouton désactivé |
| **Motifs obligatoires** | Toute décision refusante exige un motif écrit, conservé dans la fiche |
| **Temps réel** | Rafraîchissement automatique des écrans concernés |
| **Sessions sécurisées** | Révocation immédiate si compte désactivé ou mot de passe modifié |

---

## 9.3 Limitations de l'étude et pistes de recherche futures

### 9.3.1 Limitations

| Limitation | Description |
|---|---|
| **Tests T18** | La session d'acceptation avec de vrais agents SRSP n'est pas automatisable. Validation en attente. |
| **Validation SRSP** | Les schémas d'opération, les pièces obligatoires et l'exception `traiter_dossier` nécessitent la validation du SRSP. |
| **Données de démonstration** | Les dossiers 54-57 sont des données de test. Le nettoyage est risqué pour les scripts E2E. |
| **Performance** | Les tests de charge (nombreux utilisateurs simultanés) n'ont pas été effectués. |
| **Accessibilité** | L'accessibilité (WCAG) n'a pas été auditée formellement. |
| **Mobile** | L'interface est responsive mais pas optimisée pour mobile. |
| **Offline** | Aucun mode hors-ligne n'est prévu. |
| **Internationalisation** | L'interface est en français uniquement. |

### 9.3.2 Pistes de recherche futures

| Piste | Description |
|---|---|
| **Intégration SIIGFP/SIIGMP** | Connexion avec les systèmes d'information de la gestion financière et de la paie. |
| **Notifications e-mail/SMS** | Envoi de notifications par e-mail ou SMS (actuellement exclu par le cahier). |
| **Calculs automatiques** | Calcul automatique des soldes, décomptes, pensions (actuellement exclu par le cahier). |
| **Application mobile** | Application mobile native ou PWA pour les agents sur le terrain. |
| **Mode hors-ligne** | Saisie hors-ligne avec synchronisation différée. |
| **Internationalisation** | Support multilingue (français, malgache, anglais). |
| **Accessibilité** | Conformité WCAG 2.1 AA. |
| **Tests de charge** | Campagne de tests de charge avec plusieurs centaines d'utilisateurs simultanés. |
| **Machine learning** | Prédiction des délais de traitement, détection d'anomalies dans les pièces. |
| **Blockchain** | Certification de l'intégrité des documents et de l'historique. |

### 9.3.3 Recommandations

1. **Valider les schémas d'opération** avec le SRSP avant la mise en production.
2. **Effectuer une session d'acceptation T18** avec de vrais agents SRSP.
3. **Nettoyer les données de test** (dossiers 54-57) avant la mise en production.
4. **Former les utilisateurs** avec le guide de formation (`docs/FORMATION.md`).
5. **Mettre en place un plan de sauvegarde** (base de données + fichiers uploadés).
6. **Monitorer les performances** en production (temps de réponse, erreurs, charge).
7. **Mettre à jour la documentation** au fur et à mesure des évolutions.

---

*Fin du Chapitre 9 — Évaluation et suggestions du projet SRSP Fitovinany*