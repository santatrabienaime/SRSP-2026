# Résultats des tests — SRSP Fitovinany

Date de la campagne : **22 octobre 2026**
Environnement : Windows, Node.js 24, PostgreSQL 18 local (`srsp_db`),
API sur `http://localhost:5000`.

---

## 1. Synthèse

| Campagne | Commande | Résultat |
|---|---|---|
| Tests fonctionnels du circuit VISA (bout en bout, API réelle) | `node Backend/scripts/test-e2e-visa.mjs` | **78 / 78** — 0 échec |
| **Régression : création d'un dossier VISA** | `node Backend/scripts/test-e2e-visa-creation.mjs` | **12 / 12** — 0 échec |
| Réinitialisation de mot de passe (bout en bout) | `node Backend/scripts/test-e2e-reinitialisation.mjs` | **23 / 23** — 0 échec |
| Canal temps réel (bout en bout, Socket.IO) | `node Backend/scripts/test-e2e-temps-reel.mjs` | **17 / 17** — 0 échec |
| Fonctions d'ergonomie | `node Backend/scripts/test-e2e-ergonomie.mjs` | **34 / 34** — 0 échec |
| Données d'opération, versionnage, état « non applicable » | `node Backend/scripts/test-e2e-operations.mjs` | **50 / 50** — 0 échec |
| Module d'immatriculation de la Coordination | `node Backend/scripts/test-e2e-immatriculation.mjs` | **22 / 22** — 0 échec |
| **Circuit Secours de bout en bout** | `node Backend/scripts/test-e2e-secours.mjs` | **20 / 20** — 0 échec |
| **Signalements de dossiers bloqués (bout en bout)** | `node Backend/scripts/test-e2e-signalements.mjs` | **36 / 36** — 0 échec |
| **Droits et routes : cohérence** | `node Backend/scripts/test-e2e-droits.mjs` | **2 / 2** — 0 échec |
| Contrôle des données attendues par chaque écran | `node Backend/scripts/test-ecrans.mjs` | **53 / 53** — 0 échec |
| Points d'entrée du tableau de bord, avec tous les profils | `node Backend/scripts/test-e2e-tableaux-bord.mjs` | **91 / 91** — 0 échec |
| Cohérence des chiffres du tableau de bord (contre le SQL) | `node Backend/scripts/test-e2e-coherence-tableau-bord.mjs` | **14 / 14** — 0 échec |
| Noms d'onglets des exports Excel | `node Backend/scripts/test-e2e-exports-excel.mjs` | **15 / 15** — 0 échec |
| **Balayage de toute l'API, avec tous les profils** | `node Backend/scripts/test-e2e-balayage-api.mjs` | **1 560 appels — 0 erreur serveur** |
| **Triage des dossiers : tris et regroupement par statut** | `node Backend/scripts/test-e2e-tri-dossiers.mjs` | **24 / 24** — 0 échec |
| **Couverture de l'API** — chaque route a son écran, chaque écran sa route | `node Backend/scripts/audit-api-frontend.mjs` | **222 routes — 0 orpheline, 0 appel cassé** |
| Tests unitaires et de rendu du frontend | `npm test` (Frontend) | **127 / 127** — 15 fichiers, 0 échec |
| Construction de production du frontend | `npm run build` (Frontend) | **OK** — `dist/` généré |
| Contrôle syntaxique du backend | `node --check` sur tous les fichiers | **OK** — 0 erreur |
| Contrôle d'encodage des sources et de la documentation | `node Backend/scripts/verifier-encodage.mjs` | **OK** — 352 fichiers, 0 défaut |
| **Restauration PostgreSQL** | import de `database/srsp_db.sql` dans une base `srsp_test` | **OK** — 61 tables, 1 474 lignes |

**Total backend : 491 contrôles, 491 réussis, 0 échec — plus 1 560 appels de balayage, tous sans erreur.**
**Total frontend : 127 tests, 127 réussis, 0 échec.**

---

## 2. Campagne fonctionnelle VISA (bout en bout)

Le test s'exécute contre une **API réelle** et une **base réelle** : il ne
simule rien. Il crée ses propres dossiers, avec des matricules uniques, et
les supprime ou les archive à la fin.

```bash
cd Backend
node src/server.js            # dans un terminal
node scripts/test-e2e-visa.mjs   # dans un autre
```

### 2.1 Résultats par section

| Section | Points de contrôle | Résultat |
|---|---|---|
| 1. Connexions | 5 profils (secrétaire, vérificateur VISA, chef de division VISA, chef de service, administrateur) | 5 / 5 |
| 2. Référentiel | type VISA, sous-type VISA, priorité, division VISA, agent vérificateur | 5 / 5 |
| 3. Création du dossier VISA | création, statut `AFFECTE` (orientation et affectation automatiques), référence VISA, type d'acte déduit du sous-type, vérificateur enregistré | 5 / 5 |
| 4. Traitement | prise en charge par le vérificateur | 1 / 1 |
| 5. Contrôle des pièces | état non présent **sans motif refusé (422)**, état non présent **avec motif accepté**, motif conservé, état conservé, 5/5 pièces présentes | 6 / 6 |
| 6. Soumission et validation | soumission à vérification, validation par le chef de division VISA, statut `VALIDE` | 3 / 3 |
| 7. Signature | refus au chef de division (**403**), refus au vérificateur (**403**), signature par le chef de service, signataire, date et référence enregistrés | 6 / 6 |
| 8. Archivage | archivage **refusé sans les pièces d'archivage (409)**, 2 pièces d'archivage configurées, archivage par le vérificateur, statut `ARCHIVE`, date enregistrée | 5 / 5 |
| 9. Dossier incomplet | création sans origine ni comptable **refusée (422)**, effacement d'un champ obligatoire accepté, validation **bloquée (422)**, dérogation **refusée à un rôle non autorisé (403)**, dérogation tracée, motif enregistré | 6 / 6 |
| 10. Suppression | refus hors rôle administrateur (**403**), refus au chef de service (**403**), refus sans motif (**422**), suppression avec motif, dossier introuvable ensuite (**404**), trace disponible, motif conservé, journal figé, refus après traitement (**409**) | 9 / 9 |
| 11. Demande de complément | refus sans motif (**422**), demande avec motif, statut `EN_ATTENTE_COMPLEMENT`, motif enregistré | 4 / 4 |
| 12. Boîte de travail et rapports | boîte de travail disponible, rapport VISA PDF (`application/pdf`), rapport VISA par vérificateur Excel | 3 / 3 |
| 13. Référentiel | sous-types listés, sous-type VISA actif, création, désactivation, création d'une pièce rattachée, désactivation d'une pièce, pièce conservée, réactivation, suppression refusée si une pièce active s'y rattache (**409**), suppression une fois la pièce désactivée, pièce détachée, 5 contrôles sur les permissions de l'administrateur | 17 / 17 |

**Total : 78 contrôles, 78 réussis, 0 échec.**

### 2.2 Ce que la campagne a réellement vérifié

Les contrôles qui « échouent » sont aussi importants que les autres : ce sont
eux qui prouvent qu'une règle est appliquée.

- **La signature est bien réservée au Chef de Service.** Le chef de division
  VISA et le vérificateur VISA ont tous deux obtenu un **403** sur
  `POST /dossiers/:id/signer`. La règle est doublement protégée : par la
  permission `signer_dossier`, et par une vérification de rôle dans le
  service.
- **L'archivage est bien bloqué sans signature ni pièces.** L'archivage d'un
  dossier signé mais dont les pièces d'archivage n'étaient pas satisfaites a
  été refusé avec un **409** nommant les pièces manquantes.
- **La validation est bien bloquée sur dossier incomplet.** Le message
  returned énumère les champs manquants et les pièces non satisfaites, et
  propose la dérogation. Un chef de division ne peut pas déroger : **403**.
  Seul le chef de service l'a pu, et la dérogation a été retrouvée sur le
  dossier.
- **La suppression n'est pas muette.** Le dossier supprimé est introuvable
  (**404**), mais la trace subsiste avec son motif, son auteur et
  l'instantané de son journal (8 actions conservées dans l'essai).
- **Un dossier qui porte un historique de traitement ne se supprime pas** :
  **409**, avec le rappel « Archivez-le au lieu de le supprimer ».
- **L'administrateur technique n'a aucun pouvoir de décision métier.** Ses
  permissions ont été contrôlées une par une : ni `signer_dossier`, ni
  `valider_dossier`, ni `archiver_dossier`. Il conserve `delete_dossier` et
  `configurer_pieces`.
- **Une pièce n'est jamais effacée.** La suppression d'un type de pièce la
  **désactive** (`actif = 0`) : la ligne reste, et son historique reste
  lisible. Un sous-type lié à une pièce active ne peut pas être supprimé
  (**409**) ; une fois la pièce désactivée, il peut l'être, et la pièce est
  **détachée** pour ne pas référencer un sous-type disparu.

### 2.3 Anomalies rencontrées et corrigées pendant la campagne

| Anomalie | Cause | Correction |
|---|---|---|
| `500 Bind parameters must not contain undefined` à la création d'un dossier | Les champs facultatifs absents de la requête étaient passés comme `undefined` au pilote, qui exige `null` | Normalisation explicite dans `dossierModel.createDossier` |
| `500 (intermediate value) is not iterable` à la création d'un dossier | Le résultat d'un `INSERT` était déstructuré comme un jeu de lignes | `const result = await db.query(...)` |
| `500 Unknown column 'reference_archivage'` à l'archivage | Le schéma ne contenait pas encore le champ d'archivage enrichi | Champ ajouté au schéma PostgreSQL livré |
| `404` sur le rapport VISA | L'API n'expose les rapports VISA qu'en PDF et Excel, pas en JSON | Test aligné sur les routes réelles |
| Journal d'un dossier supprimé disparaissant | `historique_actions.dossier_id` est en `ON DELETE CASCADE` | Table `suppressions_dossiers` sans clé étrangère, qui fige le journal avant la suppression |
| Suppression impossible en pratique | Le routage automatique porte le dossier à `AFFECTE` dès la création, statut hors du seuil autorisé | Seuil étendu à `AFFECTE` : un dossier affecté mais jamais repris ne protège aucun travail |
| Pièce désactivée référençant un sous-type supprimé | La suppression du sous-type laissait `types_pieces.sous_type_id` pointant sur une ligne disparue | Les pièces désactivées sont **détachées** avant la suppression ; seules les pièces **actives** bloquent |

### 2.4 Régression : création d'un dossier VISA

La création d'un dossier VISA a été reprise après trois défauts qui se
masquaient l'un l'autre : le type d'acte était obligatoire à l'étape 1 mais son
choix n'apparaissait qu'à l'étape 3 ; la liste des vérificateurs proposait des
agents qui ne traitaient pas les dossiers ; le brouillon perdait les champs
VISA et envoyait `priorite_id: 0`.

```bash
cd Backend
node scripts/test-e2e-visa-creation.mjs
```

| Section | Points de contrôle | Résultat |
|---|---|---|
| 1. Référentiel des agents | `peut_traiter` exposé, vérificateur Visa apte, chef de division et administrateur inaptes | 4 / 4 |
| 2. Fiche incomplète | sans vérificateur (**422**), avec le chef de division (**422**), avec l'administrateur (**422**), messages explicites | 5 / 5 |
| 3. Fiche complète | création (**201**), vérificateur enregistré, type d'acte conservé | 3 / 3 |

**Total : 12 contrôles, 12 réussis, 0 échec.**

---

## 3. Contrôle des données attendues par chaque écran

La campagne précédente éprouve le **circuit métier**. Celle-ci vérifie que
**chaque écran affiché a bien la donnée qu'il attend** : un écran qui s'ouvre
sur une liste vide faute de champ manquant n'est pas un écran qui marche.

```bash
cd Backend
node scripts/test-ecrans.mjs
```

| Contrôle | Résultat |
|---|---|
| Référentiel : types de dossiers, sous-types, types de pièces, statuts | 4 / 4 |
| Liste des dossiers | 1 / 1 |
| Liste filtrée (type, statut, recherche, période, tri) | 1 / 1 |
| Filtre par division | 1 / 1 |
| Filtre par responsable | 1 / 1 |
| Détail d'un dossier : ancienneté, division | 3 / 3 |
| Pièces jointes du dossier | 1 / 1 |
| Dépouillement du dossier (résumé) | 1 / 1 |
| Traçabilité du dossier | 1 / 1 |
| Boîte de travail : files, totaux par catégorie et par statut, périmètre | 6 / 6 |
| Trace des suppressions | 1 / 1 |
| Écran Référentiel : sous-types (avec décompte des dossiers), types de pièces (avec périmètre type/acte) | 3 / 3 |
| Journal d'audit | 1 / 1 |
| Listes de choix : agents, divisions | 2 / 2 |
| Écran *Schémas d'opérations* : liste, champs complets, opérations sans schéma signalées, cloisonnement (403) | 5 / 5 |
| Écran *Immatriculations* : liste, référence attribuée, volumes par type / division / mois, cloisonnement (403) | 6 / 6 |

**Total : 38 contrôles, 38 réussis, 0 échec.**

---

## 3 bis. Campagne réinitialisation de mot de passe

```bash
cd Backend
node scripts/test-e2e-reinitialisation.mjs
```

Le circuit complet est éprouvé contre l'API et la base réelles : demande
publique, délivrance du code par l'administrateur, consommation du code,
invalidation des sessions.

| Section | Points de contrôle | Résultat |
|---|---|---|
| 1. Demande publique | compte inconnu accepté, compte existant accepté, **réponses identiques** (aucune information révélée), demande sans identifiant refusée (400) | 4 / 4 |
| 2. Traitement par l'administrateur | demandes listées, demande retrouvée, liste interdite au secrétaire (**403**), code délivré (**200**), code sur six chiffres, durée annoncée, code refusé au secrétaire (**403**) | 7 / 7 |
| 3. Consommation du code | code erroné refusé (**422**), mot de passe inchangé après un code erroné, réinitialisation acceptée, ancien mot de passe refusé (**401**), nouveau mot de passe accepté, **session ouverte invalidée (401)**, code non réutilisable (**422**) | 7 / 7 |
| 4. Mot de passe faible | refusé (**400**) | 1 / 1 |
| 5. Remise en état | mot de passe de démonstration rétabli, compte utilisable, réinitialisation journalisée | 3 / 3 |

**Total : 23 contrôles, 23 réussis, 0 échec.**

### Les garanties vérifiées

- **Aucune fuite d'information.** La demande renvoie le même message pour un
  compte existant et pour un compte inexistant.
- **Le code ne sert qu'une fois**, et **cinq tentatives** le font échouer.
- **Le profil de l'agent ne suffit pas** pour délivrer un code : le
  secrétaire a obtenu **403** sur la liste comme sur la délivrance.
- **Les sessions ouvertes meurent avec le mot de passe.** Le jeton obtenu
  avant la réinitialisation a été refusé (**401**) juste après.
- **Le mot de passe de l'agent n'est jamais connu d'un tiers** : le
  serveur ne conserve que l'empreinte du code, et l'agent saisit lui-même
  son mot de passe.

---

## 3 ter. Campagne canal temps réel

```bash
cd Backend
node scripts/test-e2e-temps-reel.mjs
```

Le test utilise le **client Socket.IO du frontend** : c'est exactement le code
qui tournera en production. Il ouvre deux canaux (vérificateur et chef de
division), provoque une transition de statut, et vérifie que le signal
arrive.

| Section | Points de contrôle | Résultat |
|---|---|---|
| 1. Ouverture du canal | canal du vérificateur établi, canal du chef de division établi, confirmation du serveur (`canal`) | 3 / 3 |
| 2. Signal de changement | dossier créé, prise en charge, **le chef de division reçoit le signal**, signal portant le bon dossier, signal portant le nouveau statut, **le canal ne transporte aucune donnée de dossier** | 6 / 6 |
| 3. Garde-fous | jeton invalide → pas de canal, canal ouvert avant désactivation, fiche retrouvée, compte désactivé, **compte désactivé → plus de canal**, **l'API refuse aussi la session (401)**, compte réactivé | 7 / 7 |
| 4. Fermeture | canaux fermés | 1 / 1 |

**Total : 17 contrôles, 17 réussis, 0 échec.**

### Les garanties vérifiées

- **Le canal ne sert que d'alerte.** La charge reçue est
  `{"dossier_id":102,"statut":"EN_TRAITEMENT","at":"…"}` : ni objet, ni
  demandeur, ni aucune donnée du dossier. Le test le vérifie en cherchant
  le nom du demandeur dans la charge.
- **Un jeton invalide n'ouvre pas de canal.**
- **Une révocation vaut sur le canal comme sur l'API.** Le compte désactivé
  ne peut plus rouvrir de canal, et l'API refuse aussi sa session (**401**).

---

## 3 ter. Campagne fonctions d'ergonomie

```bash
cd Backend
node scripts/test-e2e-ergonomie.mjs
```

Trois fonctions demandées explicitement par le cahier des fonctionnalités, et
l'une d'entre elles est le test d'acceptation T15.

| Section | Points de contrôle | Résultat |
|---|---|---|
| 1. Enregistrement en brouillon | brouillon créé, statut `BROUILLON`, numéro définitif, **absent de la liste générale**, visible dans « Mes brouillons », invisible d'un autre profil, lecture refusée (**403**), publication par un autre profil refusée (**403**), publication d'un brouillon VISA incomplet refusée (**422**), brouillon complétable, publié par son auteur, dossier publié dans le circuit, présent dans la liste générale | 14 / 14 |
| 2. « À faire ensuite » | le bloc répond, étape après affectation = prise en charge, action annoncée comme à l'agent, le chef de division voit qu'elle n'est pas à lui, après soumission l'étape est la vérification, après validation l'étape est la signature, la signature revient au Chef de Service seul, après signature le VISA propose l'archivage (pas la clôture) | 14 / 14 |
| 3. Transmissions du dossier | les transmissions sont consultables, la réponse est une liste, un dossier jamais transmis n'a pas de transmission | 3 / 3 |
| 4. Compteurs | le tableau de bord répond, le total ne compte pas les brouillons, la boîte de travail répond | 3 / 3 |

**Total : 34 contrôles, 34 réussis, 0 échec.**

### Les garanties vérifiées

- **Un brouillon n'est pas un dossier** : il ne déclenche aucune
  notification, n'apparaît dans aucune file, ne compte dans aucun
  compteur, et n'est visible que de son auteur. La publication est refusée
  si la fiche est incomplète.
- **« À faire ensuite » distingue l'étape de l'acteur.** Le même dossier,
  vu par l'agent et par le chef de division, n'annonce pas la même
  responsabilité : c'est exactement la distinction que le cahier demande.
- **Le VISA n'a pas de clôture intermédiaire** : après signature,
  l'étape proposée est l'archivage.

---

## 3 quater. Campagne données d'opération, versionnage et « non applicable »

```bash
cd Backend
node scripts/test-e2e-operations.mjs
```

Trois fonctions demandées par le cahier des fonctionnalités.

| Section | Points de contrôle | Résultat |
|---|---|---|
| 1. Données d'opération | dossier Solde créé avec son type d'opération, saisie par le vérificateur, montant et sa source conservés, type d'opération repris du dossier, **saisie refusée au secrétaire (403)**, données lisibles par le chef de division, contrôle enregistré, décision et contrôleur conservés, **contrôle refusé à l'agent qui a saisi (403)**, montant validé, validation datée et attribuée, **montant non saisi non validable (422)** | 12 / 12 |
| 2 bis. Schéma d'opération | le schéma de l'opération est renvoyé, l'opération est identifiée, le schéma liste les champs propres **et** les champs communs, **champ obligatoire manquant refusé (422)**, saisie par le schéma, champs propres relus, **champ hors schéma ignoré** | 12 / 12 |
| 3. Pièces — « non applicable » | état accepté **sans motif**, état conservé, pièce comptée comme satisfaite, « manquante » exige toujours un motif (**422**) | 4 / 4 |
| 4. Pièces jointes — versionnage | premier dépôt en version 1, dépôt d'une pièce en version 1, second dépôt en version 2, motif du remplacement conservé, version précédente liée, **les deux versions conservées**, suppression d'une version antérieure refusée (**409**) | 8 / 8 |
| 5. Correspondances | dossier Pensions créé, correspondance créée, référence conservée, transmission centrale tracée, suivi mis à jour, état de réponse et état de réception conservés, listage par le chef de division | 9 / 9 |
| 6. Cloisonnement | un chef d'une autre division ne lit pas les données d'opération (**403**) | 1 / 1 |

**Total : 50 contrôles, 50 réussis, 0 échec.**

### Les garanties vérifiées

- **Saisir et contrôler sont deux gestes distincts.** L'agent qui saisit ne
  peut pas contrôler sa propre saisie, et le contrôleur n'est pas l'agent
  qui a saisi. C'est la séparation que le cahier exige.
- **Un montant non saisi ne se valide pas** : la plateforme ne valide que ce
  qui existe, et le dit.
- **Une pièce non applicable ne bloque pas** la validation — elle satisfait
  l'obligation, puisque la pièce n'avait pas à être fournie.
- **Une version antérieure ne se supprime pas** : elle est la trace de ce
  qui avait été produit.
- **La correspondance se suit jusqu'au niveau central** : référence, état de
  réponse, date de transmission, destinataire central, référence de bordereau
  et état de réception.
- **Le formulaire suit le schéma de l'opération** : un champ que l'écran ne
  montre pas n'est pas enregistré, et un champ obligatoire que le schéma
  déclare est refusé s'il manque — la règle de gestion ne se contourne pas
  en contournant l'écran.

---

## 3 quinquies. Campagne module d'immatriculation (Coordination)

```bash
cd Backend
node scripts/test-e2e-immatriculation.mjs
```

Le cahier (§ 11.2) confie à la Coordination l'attribution des références, les
insertions en paie, les changements de mode de paiement et les volumes.

| Section | Points de contrôle | Résultat |
|---|---|---|
| 1. Immatriculation | demande enregistrée, **référence attribuée**, **CIN déjà connu refusé (409)**, **matricule déjà attribué refusé (409)**, modification acceptée, liste et fiche consultables, référence conservée | 9 / 9 |
| 2. Cloisonnement du rôle | profil sans la permission refusé (**403**), accès sans jeton refusé (**401**) | 2 / 2 |
| 3. Insertion en paie | insertion enregistrée et rattachée à l'immatriculation | 2 / 2 |
| 4. Changement de mode de paiement | **sans motif refusé (400)**, **virement sans compte refusé (422)**, demande enregistrée, rattachée, motif conservé | 5 / 5 |
| 5. Volumes | volumes calculés, volumes par type de demande présents, lisibles par un profil de pilotage | 3 / 3 |

**Total : 22 contrôles, 22 réussis, 0 échec.**

### Les garanties vérifiées

- **Le doublon est refusé avant l'attribution**, pas découvert plus tard à la
  paie : ni le CIN ni le matricule ne peuvent être partagés.
- **La référence est attribuée d'office** : la coordination peut répondre à
  l'agent sans repasser par un autre service.
- **Une décision sans motif ne s'explique ni ne s'audite** : le motif du
  changement de mode de paiement est obligatoire, et un virement exige un
  numéro de compte.

---

## 3 sexies. Campagne signalements de dossiers bloqués

```bash
cd Backend
node scripts/test-e2e-signalements.mjs
```

Le cahier confie à la hiérarchie le traitement des dossiers qui bloquent. Le
signalement est **attaché au dossier** mais **ne change pas son statut** : il
nomme la difficulté, il ne remplace pas le circuit.

| Section | Points de contrôle | Résultat |
|---|---|---|
| 1. Connexions | profils nécessaires | 1 / 1 |
| 2. Ouverture | dossier créé, signalement **201**, statut `OUVERT`, dossier rattaché, division déduite | 5 / 5 |
| 3. Refus | second signalement ouvert par le même auteur (**409**), agent sans droit (**403**), motif trop court (**400**), résolution par un chef de division (**403**) | 4 / 4 |
| 4. Hiérarchie | file du chef de service, cloisonnement par division, prise en charge (**200**), statut `EN_COURS`, traiteur enregistré, double prise en charge (**409**) | 6 / 6 |
| 5. Résolution | texte trop court (**400**), résolution (**200**), statut `RESOLU`, texte et date conservés, double résolution (**409**) | 6 / 6 |
| 6. Traçabilité | lecture avec le dossier, 3 traces au journal, 2 notifications au chef de division, **statut du dossier inchangé** | 7 / 7 |
| 7. Rejet | signalement Solde créé, rejet (**200**), statut `REJETE`, motif conservé | 4 / 4 |
| 8. Compteur | compteur accessible, lisible par un agent, file complète fermée à un agent (**403**) | 3 / 3 |

**Total : 36 contrôles, 36 réussis, 0 échec.**

### Les garanties vérifiées

- **Un signalement ne bloque pas le dossier une seconde fois** : le dossier
  garde son statut, et peut continuer à avancer pendant que la hiérarchie
  instruit la difficulté.
- **Un chef de division ne voit que sa division** : la file est cloisonnée par
  le serveur, pas seulement filtrée à l'écran.
- **Une décision sans texte ne s'explique pas** : la résolution comme le rejet
  exigent un texte, et chaque geste est journalisé.
- **L'auteur est prévenu** : la prise en charge et la résolution produisent une
  notification nominative.

---

## 3 bis. Le triage des dossiers — tris et regroupement par statut

```bash
cd Backend
node scripts/test-e2e-tri-dossiers.mjs
```

Le triage est ce qui fait gagner du temps au quotidien : un tri pour trouver
le dossier à traiter, un regroupement pour voir où en est le service. Ce
contrôle vérifie, sur l'API réelle, que chaque tri classe réellement les
dossiers dans l'ordre annoncé — et qu'aucun tri ne fait perdre de dossier.

| Section | Points de contrôle | Résultat |
|---|---|---|
| 1. Référence | La liste de référence répond, elle n'est pas vide | 2 / 2 |
| 2. Statut | `tri=statut` suit l'ordre du circuit, `tri=statut_desc` l'ordre inverse, aucun dossier perdu | 6 / 6 |
| 3. Priorité, type, demandeur, ancienneté | Les priorités décroissent, les types et les noms sont classés, les réceptions croissent | 8 / 8 |
| 4. Signalements | `tri=signalement` place les dossiers signalés non traités en tête | 2 / 2 |
| 5. Robustesse | Un tri inconnu ne casse rien : repli sur le tri par défaut | 2 / 2 |
| 6. Boîte de travail | La boîte accepte le même tri, les files sont ordonnées, les compteurs restent présents | 4 / 4 |

**Résultat : 24 vérifications, 24 réussies, 0 échec.**

> Sur la base de référence — qui ne comporte aucun signalement ouvert — le
> contrôle « les dossiers signalés viennent d'abord » n'a pas d'objet : il est
> annoncé comme tel, et non compté comme une réussite. Il a été vérifié à
> 24 / 24 sur une base de test où un signalement ouvert existait.

---

## 4. Tests du frontend

```bash
cd Frontend
npm test
```

| Fichier | Contenu |
|---|---|
| `champs.test.jsx` | Composants de champs, validation et accessibilité |
| `DocumentsPanel.test.jsx` | Dépôt, versionnage et téléchargement des pièces |
| `CorrespondancesPanel.test.jsx` | Correspondances liées au dossier |
| `OperationPanel.test.jsx` | Données d'opération, schémas et états |
| `ProchaineAction.test.jsx` | Étape annoncée, acteur et bouton d'action |
| `SignalementsPanel.test.jsx` | Signalements de blocage et résolution |
| `topbar.test.jsx` | Barre supérieure, notifications et profil |
| `modal.test.jsx` | Fenêtres modales et fermeture |
| `personnel.test.jsx` | Gestion des comptes et des fiches agents |
| `tempsReel.test.jsx` | Contexte temps réel, connexion et événements |
| `reinitialisation.test.jsx` | Réinitialisation de mot de passe |
| `useInputControl.test.jsx` | Contrôle de saisie et règles de validation |
| `triage.test.js` | Tris proposés, ordre du circuit, regroupement par statut |
| `DossierList.test.jsx` | Sections par statut, section repliée, tri transmis au serveur |
| `DossierListPage.test.jsx` | Onglets par type du secrétariat, raccourcis, onglets d'avancement des autres profils |

**Résultat : 15 fichiers, 127 tests, 127 réussis, 0 échec.**

---

## 5. Schéma PostgreSQL livré

Le schéma de référence est `database/srsp_db.sql`. Il a été régénéré depuis la
base PostgreSQL de référence, puis restauré dans une base vide pour
vérification.

| Élément | Résultat |
|---|---|
| Tables | **61** |
| Lignes copiées | **1 474** |
| Index | **165** |
| Clés étrangères | **102** |
| Triggers `updated_at` | **19** |
| Séquences | **56** |
| Collation | `public.ci` (ICU, insensible à la casse et aux accents) |
| Fonctions | `datediff(timestamp, timestamp)`, `set_updated_at()` |
| Intégrité référentielle | **0 orphelin** sur les 102 clés étrangères |
| Séquences alignées | **56 / 56** (le premier dossier créé ne peut pas entrer en collision) |
| Restauration | Import dans `srsp_test` : **OK**, volumes identiques |
| Documentation | `node scripts/generer-doc-schema.mjs` : **OK** |

### 5.1 Contenu de la base livrée

La base de référence ne contient **aucune donnée de campagne de test** :
elle a été réalignée sur le jeu de démonstration du projet, les campagnes
ayant été exécutées sur une copie restaurée (`srsp_test`).

| Famille | Contenu | Lignes |
|---|---|---|
| Référentiel | rôles, permissions, agents, divisions, districts, types, statuts, pièces, schémas d'opérations, référentiel du cahier | **1 156** |
| Démonstration | 6 dossiers, leur historique (261), leurs notifications (32), archives, affectations, validations, vérifications, compteurs de numérotation | **318** |

Les **13 comptes de démonstration** (mots de passe `Admin123!` et `Demo123!`)
sont inclus : la plateforme est utilisable immédiatement après l'import.

---

## 6. Vérifications de sécurité

| Contrôle | Résultat |
|---|---|
| Mots de passe hachés (bcrypt) | ✅ |
| RBAC appliqué **côté serveur** sur chaque route | ✅ |
| Signature VISA restreinte au rôle `CHEF_SERVICE` **dans le service** | ✅ 403 vérifié |
| Dérogation à la validation réservée à `deroger_validation` | ✅ 403 vérifié |
| Suppression réservée au rôle `ADMIN`, avec motif obligatoire | ✅ 403 / 422 vérifiés |
| Archivage VISA réservé au `VERIFICATEUR_VISA` et au `CHEF_SERVICE` | ✅ |
| Cloisonnement par division (chef de division) et par agent | ✅ Filtre forcé côté serveur |
| Upload : extension, taille (5 Mo), UUID sur disque, dossier archivé non modifiable | ✅ |
| Téléchargement : résolution du chemin bornée à la racine des uploads | ✅ |
| Journal d'audit : auteur, date, heure, seconde, IP | ✅ |
| Trace durable des suppressions | ✅ |
| Réinitialisation : code à usage unique, empreinte seule conservée, 5 tentatives maximum, réponses identiques | ✅ |
| Réinitialisation : sessions ouvertes invalidées après changement de mot de passe | ✅ 401 vérifié |
| Désactivation d'un compte : sessions ouvertes invalidées | ✅ 401 vérifié |
| Canal temps réel : mêmes vérifications de session que l'API | ✅ Compte désactivé → canal refusé |
| Canal temps réel : transport limité à l'alerte | ✅ Charge vérifiée, aucune donnée de dossier |
| Précision de la révocation de session au millième | ✅ Connexion immédiate après réinitialisation vérifiée |
| Données d'opération : saisir et contrôler sont deux gestes distincts | ✅ 403 vérifié dans les deux sens |
| Montant : validé seulement s'il a été saisi | ✅ 422 vérifié |
| Pièce « non applicable » : ne bloque pas la validation, ne demande pas de motif | ✅ |
| Pièce jointe : une version antérieure ne se supprime pas | ✅ 409 vérifié |
| Mots de passe expirant (90 jours) | ✅ |
| Session close sur inactivité | ✅ |

---

## 6 bis. Le balayage de l'API — et les défauts qu'il a révélés

Les campagnes précédentes vérifient un **circuit** : le VISA de bout en bout,
la réinitialisation, le temps réel. Elles ne vérifient pas que *chaque* écran
a bien la donnée qu'il attend. Il en a résulté que des points d'entrée ont
pu rester cassés sans que rien ne s'en aperçoive.

Quatre campagnes ont été ajoutées pour combler ce manque.

| Campagne | Ce qu'elle vérifie |
|---|---|
| `test-e2e-tableaux-bord.mjs` | Les sept points d'entrée du tableau de bord, avec les treize profils — 91 combinaisons. |
| `test-e2e-coherence-tableau-bord.mjs` | Que les chiffres affichés correspondent au SQL : les brouillons sont exclus, les statuts sans dossier restent listés, la somme des compteurs retrouve le total, et la répartition par type — les onglets du secrétariat — retrouve elle aussi le total. |
| `test-e2e-exports-excel.mjs` | Que les quinze exports Excel portent des noms d'onglets valides (Excel refuse au-delà de 31 caractères). |
| `test-e2e-balayage-api.mjs` | **Tous** les points d'entrée en lecture, avec **tous** les profils : 120 × 13 = 1 560 appels. |
| `audit-api-frontend.mjs` | Que **chaque route** a son écran et **chaque écran** sa route : 222 routes, 0 orpheline, 0 appel cassé. |
| `test-e2e-secours.mjs` | Le circuit Secours **de bout en bout** : mandatement, visa du contrôle financier, références, état d'émargement, signature de l'ordonnateur, archivage de la copie signée, cachet — et le refus à un profil d'une autre division. |
| `test-e2e-droits.mjs` | Qu'aucune route n'est fermée à tout le monde, que le registre ne cite aucun droit inexistant, et que les attributions attendues sont satisfaites. |

### Les défauts trouvés

| Défaut | Effet | Cause |
|---|---|---|
| La répartition par division référençait un alias de table absent | **Erreur 500 pour les treize profils** — le tableau de bord entier s'affichait « Impossible de charger » | La règle « hors brouillons » (`s.code`) était concaténée à des requêtes de jointures différentes ; dans celle-ci, la jointure sur le statut manquait. |
| Le KPI « dossiers incomplets » du secrétariat référençait le même alias | **Erreur 500 pour le seul secrétaire** | Même cause. |
| Le module `/performance` n'avait jamais fonctionné | **Erreur 500 sur ses cinq points d'entrée**, pour tout le monde | Ses requêtes portaient sur des colonnes inexistantes (`statut_code`, `date_creation`, `agent_id`), une méthode était définie deux fois, et le contrôleur importait un service qu'il n'exportait pas. |
| Les cinq modules `/performance` n'appliquaient aucun périmètre | Un chargé de secours pouvait lire la performance de toutes les divisions et de tous les agents | Le cloisonnement était fait à l'écran, pas sur les données. |
| Les noms d'onglets Excel dépassaient 31 caractères | Noms tronqués au milieu d'un mot | La limite d'Excel n'était pas prise en compte. |

### La couverture de l'API, mesurée

Le relevé croisé des routes du serveur et des appels de l'interface a fait
apparaître **24 routes sans écran** et **deux modules entiers sans interface**
(géographie, performance). Elles sont désormais toutes portées par un écran,
et le contrôle est permanent : `audit-api-frontend.mjs` échoue si une route
perd son écran ou si un écran perd sa route.

Les routes redondantes ont été retirées — elles permettaient deux chemins
pour la même action, et l'un des deux pouvait diverger sans qu'on le voie :

| Route retirée | Doublon de | Pourquoi c'était un défaut |
|---|---|---|
| `GET /users` et ses 5 opérations | `/personnel` | Permitait de créer un compte **sans fiche** — précisément ce que l'écran Personnel a été fait pour interdire. |
| `GET /audit` | `/historique` | Contournait le périmètre : il lisait le journal global sans appliquer la restriction de division. |
| `GET /workflow/:id/statut` | `/dossiers/:id/statut` | Réponse identique, code identique : deux chemins pour le même fait. |
| `GET /dossiers/mandatement/pieces` | `GET /dossiers/:id/mandatement` | Le mandatement renvoie déjà la liste complète, avec l'état d'impression de chaque pièce. |
| `DELETE /referentiel/schemas-operations/champ/:id` | `PUT /referentiel/schemas-operations/:id` | L'écran prépare le schéma complet et l'enregistre en une fois. |

Un bug a été corrigé au passage : `a.siege` figurait dans le `GROUP BY` de la
synthèse territoriale mais pas dans son `SELECT`, et le modèle renvoyait un
`siege` toujours vide. L'antenne siège — celle qui porte le service central —
n'était donc jamais signalée comme telle.

### Le circuit Secours : des droits que personne ne portait

La campagne `test-e2e-secours.mjs` est née d'une relecture du code, pas d'un
bug signalé. En comparant les droits exigés par les routes aux droits
portés par les rôles, **cinq points d'entrée exigeaient un droit qu'aucun
rôle ne portait** :

| Droit exigé par la route | Écran bloqué |
|---|---|
| `enregistrer_visa_cf` | Le visa du contrôle financier |
| `generer_etat_emargement` | L'état d'émargement et les références |
| `signer_pieces_mandatement` | La signature de l'ordonnateur |
| `archiver_copie_mandatement` | L'archivage de la copie signée |
| `apposer_cachet` | Le cachet de l'ordonnateur |

Le code était là, les données étaient là, les tables étaient là. Le
mandat n'était pas : le serveur répondait 403 à tout le monde, et l'écran
montrait cinq étapes que personne ne pouvait faire avancer. **Aucune campagne
ne le voyait**, parce qu'aucune ne parcourait le circuit Secours.

Les attributions ont été lues dans le registre de conformité, qui porte pour
chaque exigence le poste qui l'exerce et le droit qui l'exerce :

| Droit | Porté par | Fondement |
|---|---|---|
| `enregistrer_visa_cf` | Chef de Division Secours | Registre 75, 76 |
| `generer_etat_emargement` | Chef de Division Secours | Registre 81, 92, 94 |
| `signer_pieces_mandatement` | Chef de Division Secours | Registre 95 — droit **dédié** : le chef de division fait signer, il ne signe pas |
| `apposer_cachet` | Chargé de Secours | Registre 97, 98 |
| `archiver_copie_mandatement` | Chef de Division Secours et Chargé de Secours | Dernier acte du mandat |
| `consolidate_reports` | Chef de Service et Coordination | Registre 109, 150, 151 |
| `manage_personnel` | Chef BAAF | Registre 126, 127 |
| `liquider_pension` | Chef de Division Pensions | Registre 50 |
| `gerer_ordonnancement` | Chef de Division Solde et Liquidateur | Registre 29, 60 |
| `preparer_mandatement` | Chef de Division Solde et Vérificateur Solde | Registre 31, 42 |

Deux droits existaient mais **ne menaient nulle part** : aucune route ne les
exigeait. `liquider_pension` et `controler_decomptes` sont désormais exigés
par les opérations qu'ils décrivent — la liquidation de pension et les
décomptes d'avance et de trop-perçu. Sans cela, le registre de conformité ne
pouvait pas être vérifié, et il disait « inerte » sur des fonctions livrées.

**Un écart a été assumé.** Le registre attribue « traiter les dossiers de
retraite, de secours, de salaires » au chef de division. Le droit
`traiter_dossier` ne lui est **pas** accordé : l'affectation automatique ne
propose un dossier qu'aux agents qui portent ce droit, et l'accorder aux
chefs les chargerait du traitement qu'ils n'ont pas à faire. La raison est
écrite dans `affectationAutoService`, et la campagne de contrôle des droits
la connaît : elle distingue l'écart assumé de l'oubli.

### La correction de fond

La cause profonde était la **forme** de la règle « hors brouillons » : elle
nommait un alias de table (`s.code`), alors qu'elle doit s'appliquer à des
requêtes de jointures différentes. Elle est maintenant exprimée sur le statut
du dossier (`d.statut_id`), ce qui la rend valable dans une clause `WHERE`
comme dans une clause `ON`, avec ou sans jointure sur le statut.

Et la règle a une seconde lecture, explicite : quand on **liste des statuts**,
c'est le pseudo-statut `BROUILLON` qu'il faut retirer — sinon les statuts qui
n'ont aucun dossier disparaissent de la répartition, et le tableau cesse de
montrer le circuit complet.

---

### Le retrait des éléments hors du thème

Le thème du projet : « plateforme web de gestion, de suivi et de traçabilité
des dossiers administratifs au sein du SRSP Fitovinany ». Cinq éléments ne
servaient pas le dossier, et ont été retirés :

| Retiré | Pourquoi |
|---|---|
| **Bilan de conformité** (écran, routes, lecture du registre) | Le projet qui s'évalue lui-même contre le cahier. C'est le livrable de l'analyse, pas une fonction de la plateforme. L'analyse reste dans `docs/CONFORMITE_CAHIER.md`. |
| **Informations système** (carte, route) | La supervision de la machine : processeur, mémoire, disque. |
| **Sauvegarde et restauration** (écran, service, routes) | Le cycle de vie de la base. La procédure manuelle reste écrite dans `docs/SAUVEGARDE_RESTITUTION.md`. |
| **Paramètres** (écran) | Ce qui restait faisait doublon : le compte connecté avec *Profil*, les divisions avec *Référentiel › Divisions*. |
| **Journal d'audit** (entrée de menu) | Doublon exact de l'écran *Historique* — même composant, même route. |

Le **contrôle d'accès aux comptes et aux permissions**, et la
**réinitialisation de mot de passe**, sont conservés : ce sont les
moyens d'exploitation du service au quotidien. Sans eux, un agent qui perd
son mot de passe serait bloqué définitivement — la voie d'auto-service
envoie un courriel, et le courriel est hors périmètre du MVP.

Après le retrait : **222 routes** et **217 appels** de l'interface, sans
aucune route orpheline et aucun appel cassé. Le contrôle croisé
`audit-api-frontend.mjs` le vérifie à chaque campagne.

---

## 7. Limites de la campagne

Ces points n'ont **pas** été couverts par un test automatique et restent à
vérifier manuellement :

- l'envoi d'e-mails ou de SMS (hors périmètre du MVP : aucune notification
  externe n'est implémentée) ;
- le comportement en cas de perte de connexion réseau en cours de dépôt ;
- la charge réelle (plusieurs dizaines d'utilisateurs simultanés) ;
- l'impression de la fiche de réception sur les postes d'impression réels ;
- le test de restauration complet, qui reste une opération manuelle
  mensuelle (procédure décrite dans
  [SAUVEGARDE_RESTITUTION.md](SAUVEGARDE_RESTITUTION.md)) ;
- la **validation métier des formules** de décompte : aucun calcul n'est
  automatisé, et c'est délibéré — le cahier l'interdit tant que la formule
  n'est pas validée par le SRSP ;
- la **conduite de la séance T18** avec des agents non techniques : c'est la
  seule preuve qui manque, et elle ne peut pas être automatisée.

---

## 8. Comment rejouer la campagne

```bash
# Terminal 1 — l'API
cd Backend
npm start

# Terminal 2 — la campagne fonctionnelle
cd Backend
node scripts/test-e2e-visa.mjs

# Terminal 3 — la réinitialisation de mot de passe
cd Backend
node scripts/test-e2e-reinitialisation.mjs

# Terminal 4 — le canal temps réel
cd Backend
node scripts/test-e2e-temps-reel.mjs

# Terminal 5 — les fonctions d'ergonomie
cd Backend
node scripts/test-e2e-ergonomie.mjs

# Terminal 6 — les données d'opération et le versionnage
cd Backend
node scripts/test-e2e-operations.mjs

# Terminal 7 — le module d'immatriculation
cd Backend
node scripts/test-e2e-immatriculation.mjs

# Terminal 8 — le tableau de bord, tous profils
cd Backend
node scripts/test-e2e-tableaux-bord.mjs

# Terminal 9 — la cohérence des chiffres du tableau de bord
cd Backend
node scripts/test-e2e-coherence-tableau-bord.mjs

# Terminal 10 — les exports Excel
cd Backend
node scripts/test-e2e-exports-excel.mjs

# Terminal 11 — le balayage de toute l'API (le plus long)
cd Backend
node scripts/test-e2e-balayage-api.mjs

# Terminal 12 — les données attendues par chaque écran
cd Backend
node scripts/test-ecrans.mjs

# Terminal 13 — les tests du frontend
cd Frontend
npm test
npm run build

# Contrôle de l'encodage des sources et de la documentation
cd Backend && node scripts/verifier-encodage.mjs
```

La campagne est **ré-exécutable sans état particulier** : elle crée ses
propres dossiers, avec des matricules uniques, et ne dépend d'aucune donnée
préexistante.

> La campagne temps réel désactive puis réactive le compte du secrétariat.
> Si elle est interrompue, `node Backend/scripts/reparer-comptes-demo.mjs`
> rétablit l'état nominal des comptes de démonstration.
