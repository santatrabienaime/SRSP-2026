# Documentation API — SRSP Fitovinany

API REST du backend Express + MySQL. Base URL : **`http://localhost:5000/api`**.

Toutes les réponses sont en JSON. Les erreurs suivent le format :

```json
{ "message": "description de l'erreur" }
```

Validation échouée (HTTP 400) :

```json
{ "message": "Validation échouée", "details": ["« objet » n'est pas autorisé", "…"] }
```

## Codes HTTP

| Code | Signification |
|------|---------------|
| 200 | Succès |
| 201 | Ressource créée |
| 204 | Suppression réussie (pas de corps) |
| 400 | Corps invalide / échec de validation |
| 401 | Token manquant, invalide ou expiré |
| 403 | Permission refusée (RBAC) |
| 404 | Ressource introuvable |
| 409 | Conflit (statut incohérent, doublon, règle de gestion) |
| 422 | Règle de service violée (champ obligatoire, motif manquant) |
| 500 | Erreur serveur |

> `422` distingue une **règle de service** d'un simple conflit : un motif
> manquant, un champ VISA obligatoire absent, une pièce non motivée. Le
> message dit toujours ce qu'il faut corriger.

## Authentification

La plupart des routes exigent le header :

```
Authorization: Bearer <token>
```

Le token s'obtient via `POST /auth/login` (8 heures de validité par défaut).

### Cycle de vie d'une session

Un jeton prouve qu'il a été émis par le serveur — il ne prouve pas que le
compte est toujours utilisable. Chaque requête authentifiée vérifie donc, en
plus de la signature :

| Vérification | Conséquence |
|---|---|
| Le compte est-il **actif** ? | Un compte désactivé voit sa session coupée (**401**). |
| Le mot de passe a-t-il changé depuis l'émission du jeton ? | Les sessions antérieures au changement sont coupées (**401**). |

Ces deux contrôles sont appliqués **aussi** au canal temps réel : une
révocation vaut partout, pas seulement sur l'API.

La comparaison se fait au **millième de seconde** (`iatMs` du jeton contre la
date du dernier changement, datée en `DATETIME(3)`). Avec une résolution à la
seconde, un agent réinitialisé par un administrateur qui se connecte dans la
même seconde verrait sa session refusée à tort.

> L'état du compte est lu en **cache**, dix secondes : la base n'est pas
> sollicitée à chaque requête, et une désactivation prend effet en moins de
> dix secondes. Une action qui change l'état d'un compte — changement de mot
> de passe, désactivation — vide l'entrée correspondante **immédiatement**.

---

## 1. Authentification — `/auth`

### `POST /auth/login`
Connexion. `identifiant` = **username** ou **email**.

```json
// Corps
{ "identifiant": "admin@srsp.mg", "password": "Admin123!" }

// Réponse 200
{
  "user": { "id": 1, "username": "admin", "email": "admin@srsp.mg", "role_id": 1, "role_nom": "ADMIN", "actif": 1 },
  "token": "eyJhbGciOiJIUzI1NiIs…"
}
```

Erreurs : 400 si champs manquants, 401 si identifiants incorrects ou compte désactivé.

### `GET /auth/me`
Retourne l'utilisateur courant (auth requise).

### `POST /auth/logout`
Déconnecte (auth requise). Réponse : `{ "message": "…" }`.

### `PUT /auth/password`
Changement de mot de passe (auth requise).

```json
{ "ancien_mot_de_passe": "Admin123!", "nouveau_mot_de_passe": "Nouveau123!" }
```

> Le changement de mot de passe **invalide les sessions ouvertes** : les
> jetons émis avant la modification ne sont plus acceptés. L'agent doit se
> reconnecter. C'est vérifié par le middleware d'authentification, qui
> compare l'instant d'émission du jeton à la date du dernier changement.

### `POST /auth/password/forgot` — public
Dépose une demande de réinitialisation.

```json
{ "identifiant": "secretaire" }
```

Réponse **200**, toujours identique :

```json
{ "message": "Si un compte actif correspond à cet identifiant, la demande a été transmise à l'administrateur. Un administrateur vous contactera pour vous remettre un code de réinitialisation." }
```

> La réponse ne dit **jamais** si le compte existe : une page qui répond
> « compte inconnu » permettrait d'énumérer les comptes du service. La demande
> est journalisée, et les administrateurs sont prévenus par notification
> interne.

### `POST /auth/password/reset` — public
Consomme le code de réinitialisation et applique le nouveau mot de passe.

```json
{ "identifiant": "secretaire", "code": "482913", "nouveau_mot_de_passe": "Nouveau123!" }
```

Le code est à six chiffres, à usage unique, et valable quinze minutes. Il
est délivré par un administrateur après vérification d'identité — c'est le
canal retenu, l'e-mail et le SMS étant exclus du périmètre.

| Erreur | Cause |
|---|---|
| 400 | Identifiant ou code absent, ou mot de passe trop faible |
| 422 | Code invalide ou expiré — le message ne distingue pas les deux cas |

Au-delà de cinq tentatives, la demande est annulée : il faut recommencer.

---

## 1 bis. Réinitialisation de mot de passe — `/reinitialisations`

Administration. Permission `manage_users` (administrateur technique).

| Endpoint | Description |
|----------|-------------|
| `GET /reinitialisations` | Liste des demandes. Query param `statut` : `EN_ATTENTE`, `CODE_GENERE`, `UTILISE`, `ANNULE`. |
| `GET /reinitialisations/:id` | Détail d'une demande. |
| `POST /reinitialisations/:id/code` | Délivre un code de réinitialisation. Corps : `{ "motif": "…" }`. |
| `POST /reinitialisations/:id/annuler` | Annule une demande. Corps : `{ "motif": "…" }`. |

La délivrance du code renvoie **une seule fois** le code en clair :

```json
{
  "code": "482913",
  "expire_le": "2026-10-20T19:15:00.000Z",
  "duree_minutes": 15,
  "compte": { "username": "secretaire", "email": "secretaire@srsp.mg" }
}
```

> Le code n'est **pas stocké en clair** : seule son empreinte SHA-256 est
> conservée. Il n'est donc pas reconsultable — s'il est perdu, on en délivre
> un nouveau. La délivrance **déverrouille** le compte s'il était verrouillé
> par des échecs de connexion, et l'opération est journalisée.

---

## 3 ter. Données d'opération — `/dossiers/:id/operation`

Les données propres à l'opération d'un dossier : référence du dossier mère,
période, montant **saisi** et sa source, localité, contrôle et validation.

Deux permissions distinctes, parce que deux gestes différents : l'agent qui
instruit **prépare**, le chef de division **contrôle**. Confondre les deux
laisserait l'agent valider sa propre saisie.

| Endpoint | Permission | Description |
|---|---|---|
| `GET /dossiers/:id/operation` | — (accès au dossier) | Le **schéma** de l'opération (ses champs) et les **valeurs** enregistrées |
| `PUT /dossiers/:id/operation` | `saisir_donnees_operation` | Enregistre les valeurs. Corps : `{ "valeurs": { "cle": "valeur" } }`. Les champs **obligatoires** du schéma sont refusés s'ils manquent (**422**) ; les clés hors schéma sont ignorées. |
| `POST /dossiers/:id/operation/controler` | `controler_donnees_operation` | `{ "decision": "APPROUVE", "observations": "…", "date_controle": "2026-10-21" }` |
| `POST /dossiers/:id/operation/valider` | `controler_donnees_operation` | Valide le montant saisi. **422** si aucun montant n'est saisi. |

> **Aucun calcul n'est appliqué.** Le montant est saisi par l'agent, sa
> source est conservée, et le contrôle atteste qu'il a été vu. Le cahier
> interdit d'automatiser une formule de décompte avant sa validation par le
> SRSP.

---

## 3 quater. Correspondances — `/correspondances`

Correspondances de la division Pensions : lettres de prescription, demandes
de dossier mère, oppositions, derniers arrérages.

| Endpoint | Permission | Description |
|---|---|---|
| `GET /correspondances?dossier_id=` | `gerer_correspondances` | Liste, avec le dossier et la pièce liée |
| `POST /correspondances` | `gerer_correspondances` | `{ "dossier_id": 1, "type": "OPPOSITION_PENSION_ALIMENTAIRE", "reference": "…", "destinataire": "…", "objet": "…", "etat": "ENVOYEE" }` |
| `PUT /correspondances/:id` | `gerer_correspondances` | Mise à jour du suivi : `etat_reponse`, `date_reponse`, `reponse`, `date_transmission_central`, `destinataire_central`, `reference_bordereau`, `etat_reception_central` |

Types : `LETTRE_PRESCRIPTION`, `DEMANDE_DOSSIERE_MERE`,
`OPPOSITION_PENSION_ALIMENTAIRE`, `OPPOSITION_CESSION_VOLONTAIRE`,
`OPPOSITION_SAISIE_ARRET`.

---

## 3 quinquies. Pièces jointes — versionnement

`POST /dossiers/:id/documents` accepte en plus le champ texte
`motif_remplacement`. Le dépôt d'un fichier pour une pièce déjà déposée ne
remplace pas le fichier : il crée une **version suivante**.

La réponse porte `version`, `remplace` (l'identifiant de la version
précédente) et `motif_remplacement`. Une version antérieure ne peut plus
être supprimée : **409**.

---

## 3 sexies. Signalements — `/signalements` et `/dossiers/:id/signalements`

Un signalement nomme une difficulté sur un dossier : blocage, interlocution
entre services, ou arbitrage demandé. **Il ne change pas le statut du
dossier** — le circuit continue, la difficulté est instruite à côté.

| Endpoint | Permission | Description |
|---|---|---|
| `GET /dossiers/:id/signalements` | — (accès au dossier) | Les signalements du dossier, du plus récent au plus ancien |
| `POST /dossiers/:id/signalements` | `signaler_dossier` | `{ "type": "BLOCAGE", "priorite": "HAUTE", "motif": "…" }`. Le motif exige **10 caractères**. Un second signalement ouvert par le même auteur sur le même dossier est refusé (**409**). |
| `GET /signalements?statut=&type=&priorite=` | `consulter_signalements` | La file, cloisonnée : un chef de division ne voit que sa division, la coordination et le BAAF voient tout |
| `GET /signalements/compte` | — (authentifié) | Le nombre de signalements ouverts, pour la pastille de menu |
| `GET /signalements/:id` | `consulter_signalements` | Le détail d'un signalement |
| `PUT /signalements/:id/prendre` | `traiter_signalement` | Prise en charge : `OUVERT → EN_COURS`. Une seconde prise en charge est refusée (**409**). |
| `PUT /signalements/:id/resoudre` | `traiter_signalement` | `{ "statut": "RESOLU" \| "REJETE", "resolution": "…" }` — texte obligatoire (10 caractères). Un signalement déjà refermé est refusé (**409**). |

Types : `BLOCAGE`, `INTERLOCUTION`, `ARBITRAGE`. Priorités : `NORMALE`,
`HAUTE`, `CRITIQUE`. Statuts : `OUVERT`, `EN_COURS`, `RESOLU`, `REJETE`.

> **Le dossier n'est pas modifié.** Ni son statut, ni son agent, ni son
> circuit. Le signalement est une trace de suivi, pas une transition de
> workflow. Chaque ouverture, prise en charge et décision est journalisée, et
> notifiée à l'auteur et au chef de division.

---

## 4. Pièces — états

| État | Satisfait l'obligation | Motif exigé |
|---|---|---|
| `PRESENTE` | oui | non |
| `NON_APPLICABLE` | oui — la pièce n'avait pas à être fournie | non |
| `MANQUANTE` | non | **oui** |
| `ILLISIBLE` | non | **oui** |
| `A_CORRIGER` | non | **oui** |

---

## 3 quater bis. Schémas d'opérations — `/referentiel/schemas-operations`

Le schéma d'une opération décrit les champs que l'agent saisit pour elle.
L'administration le fait évoluer depuis l'écran *Référentiel*, sans
développement.

| Endpoint | Permission | Description |
|---|---|---|
| `GET /referentiel/schemas-operations` | `configurer_operations` | `{ "schemas": [ { sous_type_id, code, libelle, type_code, champs: [...] } ], "operations_sans_schema": [...] }` |
| `PUT /referentiel/schemas-operations/:sousTypeId` | `configurer_operations` | Remplace l'ensemble des champs. Corps : `{ "champs": [ { cle, libelle, type_champ, requis, options, aide, ordre } ] }` |

`type_champ` vaut `texte`, `nombre`, `date`, `textarea` ou `choix`. Pour
`choix`, `options` porte les valeurs séparées par une barre verticale.

Le remplacement est **atomique** : la liste reçue devient celle du schéma.

---

## 3 sexies. Territoire — `/geographie`

Le périmètre géographique du service : les antennes, leurs districts, et le
rattachement des dossiers à un district.

| Endpoint | Description |
|---|---|
| `GET /geographie/referentiel` | `{ antennes: [...], districts: [...] }` — le référentiel territorial |
| `GET /geographie/antennes` | Les antennes (une est le **siège** : elle porte le service central) |
| `GET /geographie/districts?antenne_id=` | Les districts, éventuellement ceux d'une antenne |
| `GET /geographie/synthese?division_id=` | La synthèse par antenne : dossiers rattachés, en cours, en retard, et **les dossiers sans district comptés à part** |
| `GET /geographie/dossiers/:id/district` | Le district courant d'un dossier |
| `POST /geographie/dossiers/:id/district` | Rattache le dossier : `{ district_id, date_rattachement?, origine? }`. Le contrôle d'accès au dossier est appliqué (**403**). |
| `GET /geographie/dossiers/:id/district/historique` | L'historique des rattachements du dossier |

> Les dossiers **sans** district sont comptés à part et non ignorés : les
> perdre dans la somme ferait croire que le service en a moins qu'il n'en a.

## 3 quinquies. Immatriculations — `/immatriculations`
Le module de la Coordination. Permission `gerer_immatriculations`.

| Endpoint | Description |
|---|---|
| `GET /immatriculations?statut=&search=` | Liste des immatriculations |
| `GET /immatriculations/:id` | Une immatriculation, son insertion en paie et ses changements de paiement |
| `POST /immatriculations` | Nouvelle demande — la **référence est attribuée** ; doublon de CIN ou de matricule refusé (**409**) |
| `PUT /immatriculations/:id` | Modification ; le matricule peut être corrigé, pas attribué deux fois |
| `POST /immatriculations/:id/insertion` | Éléments requis pour l'insertion en paie |
| `PUT /immatriculations/:id/insertion/:insertionId` | Mise à jour de l'insertion |
| `POST /immatriculations/:id/paiement` | Demande de changement de mode de paiement — **motif obligatoire** ; un virement exige un compte (**422**) |
| `PUT /immatriculations/:id/paiement/:paiementId` | Mise à jour de la demande |
| `GET /immatriculations/volumes` | Volumes par type de demande, division et mois — permission `view_stats` |

---

## 1 ter. Canal temps réel — Socket.IO

Le backend expose un canal WebSocket sur la même origine que l'API
(`socket.io`, chemin par défaut `/socket.io`).

### Connexion

Le client s'authentifie avec le **même jeton JWT** que l'API :

```js
const socket = io(origine, { auth: { token } });
```

Pas de second mécanisme de session à administrer. Le canal applique la même
vérification de session que l'API : un jeton invalide, un compte désactivé ou
un mot de passe modifié **empêchent l'ouverture du canal**.

### Événements

| Événement | Charge | Signification |
|---|---|---|
| `canal` | `{ etat: "connecte" }` | Le canal est établi. |
| `notification` | notification | Une alerte est adressée à cet utilisateur. |
| `dossier` | `{ dossier_id, statut, at }` | Un dossier suivi a changé d'état. |

> Le canal ne transporte **que l'alerte**. Aucun dossier, aucun nom, aucune
> donnée personnelle ne transite par le WebSocket : la donnée affichée est
> toujours relue depuis l'API, qui seule fait foi.

Le serveur émet `dossier` vers les personnes concernées par le dossier :
l'agent qui le traite, les agents de sa division et le chef de service. Une
transition de statut déclenche l'émission ; l'échec d'émission n'empêche
jamais la transition.

### Côté client

```js
const { statut, etat, abonner } = useTempsReel();

useEffect(() => abonner('dossier', (e) => recharger()), [abonner]);
```

`abonner` renvoie la fonction de désabonnement : un composant démonté cesse
de recevoir les événements.

Le sondage de repli reste actif, mais sa cadence **suit l'état du canal** :
30 secondes quand le canal est coupé, 5 minutes quand il est établi.

---

---

## 2. Référentiel — `/referentiel`

### `GET /referentiel`
Données de référence pour alimenter les formulaires (auth requise). Sans paramètre.

```json
{
  "types_dossiers":   [ { "id": 1, "code": "VISA", "libelle": "Division Visa", "description": "…", "actif": true } ],
  "sous_types":       [ { "id": 1, "type_dossier_id": 1, "code": "VISA_MARIAGE", "libelle": "Visa de mariage", "actif": 1 } ],
  "priorites":        [ { "id": 1, "libelle": "Urgente", "niveau": 1 } ],
  "fonctions":        [ { "id": 1, "libelle": "Chef de service", "description": "…" } ],
  "types_courriers":  [ { "id": 1, "libelle": "…" } ],
  "types_documents":  [ { "id": 1, "libelle": "…", "extensions_autorisees": "…", "taille_max": 10485760 } ],
  "types_pieces":     [ { "id": 1, "code": "DEMANDE_VISA", "libelle": "Demande de visa", "phase": "DEPOUILLEMENT", "obligatoire": 1, "actif": 1 } ],
  "statuts":          [ { "id": 1, "code": "RECU", "libelle": "Reçu", "ordre": 1 } ]
}
```

### Sous-types de dossiers (types d'acte) — `/referentiel/sous-types`

| Endpoint | Permission | Description |
|----------|-----------|-------------|
| `GET /referentiel/sous-types` | — | Liste. Query params : `type_dossier_id`, `actif`. Chaque ligne porte `nb_dossiers` et `nb_pieces`. |
| `POST /referentiel/sous-types` | `gerer_sous_types` | Créer : `{ type_dossier_id, code, libelle, ordre, actif }` |
| `PUT /referentiel/sous-types/:id` | `gerer_sous_types` | Modifier le libellé, l'ordre, l'activation. Le **code** est immuable. |
| `DELETE /referentiel/sous-types/:id` | `gerer_sous_types` | Supprimer. **409** si le sous-type est cité par un dossier ou par une pièce active : il faut alors le désactiver. |

### Types de pièces requises — `/referentiel/types-pieces`

| Endpoint | Permission | Description |
|----------|-----------|-------------|
| `GET /referentiel/types-pieces` | — | Liste. Query params : `type_dossier_id`, `sous_type_id`, `division_code`, `actif`. |
| `POST /referentiel/types-pieces` | `configurer_pieces` | Créer : `{ code, libelle, phase, obligatoire, ordre, division_code, type_dossier_id, sous_type_id }` |
| `PUT /referentiel/types-pieces/:id` | `configurer_pieces` | Modifier. Le **code** est immuable. |
| `DELETE /referentiel/types-pieces/:id` | `configurer_pieces` | **Désactive** la pièce (`actif = 0`) au lieu de l'effacer : les dépouillements passés restent lisibles. |

`phase` vaut `DEPOUILLEMENT` ou `ARCHIVAGE`. Une pièce s'applique à un dossier
lorsque son `type_dossier_id` est vide ou égal, **et** que son `sous_type_id`
est vide ou égal.

### Types de dossiers et de courriers — `/referentiel/types-dossiers`, `/referentiel/types-courriers`

| Endpoint | Permission |
|----------|-----------|
| `GET /referentiel/types-dossiers` | — |
| `POST /referentiel/types-dossiers` | `manage_divisions` |
| `DELETE /referentiel/types-dossiers/:id` | `manage_divisions` |
| `GET /referentiel/types-courriers` | — |
| `POST /referentiel/types-courriers` | `manage_courriers` |
| `DELETE /referentiel/types-courriers/:id` | `manage_courriers` |

---

## 3. Dossiers — `/dossiers`

### `GET /dossiers`
Liste filtrable (auth requise). Le périmètre est restreint **par le serveur** :
un agent ne voit que ses dossiers, un chef de division que ceux de sa division.

| Query param | Type | Description |
|-------------|------|-------------|
| `statut` | string | Code de statut, ou groupe : `NOUVEAUX`, `A_AFFECTER`, `EN_COURS`, `EN_ATTENTE_COMPLEMENT`, `TERMINES` |
| `type` | string | Code de type (ex. `VISA`) |
| `statut_id` / `type_id` / `priorite_id` | int | Filtre par identifiant |
| `sous_type_id` | int | Type d'acte |
| `division_id` | int | Filtre par division |
| `agent_id` | int | Filtre par agent responsable |
| `verificateur_id` | int | Filtre par vérificateur VISA |
| `annee_reference` | int | Année de référence VISA |
| `reference` | string | Numéro de dossier **ou** référence VISA |
| `search` | string | Recherche libre : numéro, référence VISA, objet, demandeur, bénéficiaire, organisme, matricule |
| `date_debut` / `date_fin` | date | Période de réception |
| `echeance` | string | `depassee` pour les échéances dépassées |
| `incomplets` | 1 | Dossiers dont une pièce obligatoire de dépouillement n'est pas « présente » |
| `priorite_haute` | 1 | Priorité haute ou urgente |
| `tri` | string | `prioritaire`, `echeance`, `ancien`, `recent`, `numero`, `division`, `agent` |

Chaque dossier : `{ id, numero, reference_visa, type_id, type_code, type_libelle, sous_type_id,
sous_type_libelle, type_acte, annee_reference, verificateur_id, verificateur_nom, date_heure_reception,
origine_presentateur, comptable_presentateur, beneficiaire, organisme, statut_id, statut_code,
statut_libelle, division_id, division_nom, agent_responsable_id, agent_nom, agent_prenom,
priorite_id, priorite_libelle, objet, demandeur, matricule, date_reception, date_limite,
age_jours, observation, date_cloture, date_archivage, date_signature, signataire_username,
reference_signature, exception_validation, date_exception, motif_complement, … }`

### `GET /dossiers/:id`
Détail d'un dossier.

### `GET /dossiers/:id/statut`
Statut courant + transitions autorisées.

```json
{ "statut": { "id": 2, "code": "ENREGISTRE", "libelle": "Enregistré", "ordre": 2 },
  "transitions_autorisees": ["ORIENTE"] }
```

### `GET /dossiers/rechercher-par-matricule?matricule=…`
Dossiers connus d'un matricule. Aide à la saisie, **jamais** un blocage.

### `GET /dossiers/suppressions` — permission `view_audit` ou `manage_roles`
Trace durable des dossiers supprimés : numéro, objet, demandeur, statut au
moment de la suppression, **motif**, auteur, date, et le nombre d'actions de
journal conservées.

### `GET /dossiers/suppressions/:id` — permission `view_audit` ou `manage_roles`
Une suppression, avec l'instantané de son journal.

### `POST /dossiers` — permission `create_dossier`

```json
{
  "type_id": 1,
  "objet": "Demande de visa",
  "demandeur": "RAKOTO Jean",
  "matricule": "88743",
  "date_reception": "2026-09-23",
  "division_id": 1,
  "priorite_id": 1,
  "observation": "(optionnel)",

  "sous_type_id": 1,
  "reference_visa": "VISA-2026-000042",
  "date_heure_reception": "2026-09-23T09:30:00",
  "origine_presentateur": "Guichet central",
  "comptable_presentateur": "Comptable RAKOTO",
  "type_acte": "Visa de mariage",
  "annee_reference": 2026,
  "beneficiaire": "RAKOTO Jean",
  "organisme": "Mairie de Fitovinany",
  "verificateur_id": 12
}
```

Le numéro est généré automatiquement : `{TYPE}-{ANNEE}-{6 chiffres}` (ex. `VISA-2026-000001`).
La référence VISA vaut le numéro du dossier si elle n'est pas fournie.

À la création, le dossier est **enregistré**, **orienté** vers la division de
son type et **affecté** à un agent de traitement. Pour un dossier VISA,
l'origine, le comptable et le type d'acte sont **obligatoires** : la réponse
est **422** si l'un manque.

### `PUT /dossiers/:id` — permission `edit_dossier`
Même corps que la création. Un dossier clôturé ou archivé ne se modifie plus
(**409**). Un changement de division exige `motif_changement_division` et le
droit de déroger.

### Actions du workflow — permissions spécifiques

| Endpoint | Permission | Corps |
|----------|-----------|-------|
| `POST /dossiers/:id/orienter` | `orienter_dossier` | `{ "division_id": 2 }` |
| `POST /dossiers/:id/affecter` | `affecter_dossier` | `{ "division_id": 2, "agent_id": 3, "motif": "…" }` — le **motif est obligatoire** si l'agent change |
| `POST /dossiers/:id/traiter` | `traiter_dossier` | `{ "observation": "…" }` *(optionnel)* |
| `POST /dossiers/:id/demander-complement` | `traiter_dossier` \| `soumettre_verification` \| `verifier_dossier` | `{ "motif": "…" }` — **motif obligatoire** |
| `POST /dossiers/:id/verifier` | `soumettre_verification` \| `verifier_dossier` | `{ "resultat": "OK" \| "KO", "observation": "…" }` — `KO` exige un motif |
| `POST /dossiers/:id/valider` | `verifier_dossier` \| `valider_dossier` | `{ "decision": "VALIDE" \| "CORRECTION", "commentaire": "…", "motif_exception": "…" }` |
| `POST /dossiers/:id/signer` | `signer_dossier` **+ rôle `CHEF_SERVICE`** | `{ "reference": "N° 123/2026", "observation": "…" }` |
| `POST /dossiers/:id/cloturer` | `cloturer_dossier` | — |
| `POST /dossiers/:id/archiver` | `archiver_dossier` | — |
| `DELETE /dossiers/:id` | `delete_dossier` **+ rôle `ADMIN`** | `{ "motif": "…" }` — **motif obligatoire** |

Contraintes du workflow (applies côté serveur) :
- La **règle forte** du cahier des charges est respectée : depuis **`CORRECTION_DEMANDEE`**,
  le seul passage possible est **retour en traitement** — il est impossible de passer
  directement à **`VALIDE`**.
- `SIGNE` exige `VALIDE`, `CLOTURE` exige `SIGNE`, `ARCHIVE` exige `CLOTURE` — **sauf pour
  le VISA**, dont le circuit va de `SIGNE` directement à `ARCHIVE`.

### Règles propres au VISA

| Règle | Comportement |
|---|---|
| Validation | Bloquée (**422**) si un champ obligatoire manque (référence VISA, date et heure de réception, origine, comptable, objet, type d'acte, année de référence, vérificateur) ou si une pièce obligatoire de dépouillement n'est pas « présente ». Le message énumère les éléments manquants. |
| Dérogation | `motif_exception` (5 caractères minimum) + permission `deroger_validation` (**Chef de Service seul**). Enregistrée sur le dossier (`exception_validation`, `date_exception`) et dans l'historique. |
| Signature | Contrôlée **de nouveau dans le service** sur le rôle exact `CHEF_SERVICE` : un rôle technique obtient **403**, même s'il passe par une route mal configurée. |
| Archivage | Exige une signature enregistrée (`date_signature` + `signataire_id`) **et** les pièces d'archivage obligatoires satisfaites. Réservé au `VERIFICATEUR_VISA` et au `CHEF_SERVICE` (**403** sinon). |
| Suppression | Réservée au rôle `ADMIN`, avec motif, et impossible dès que le dossier porte un historique de traitement (**409**). La trace de la suppression est conservée. |

### Dépouillement — `/dossiers/:id/depouillement`

| Endpoint | Permission | Description |
|----------|-----------|-------------|
| `GET /dossiers/:id/depouillement` | `depouiller_pieces` | Pièces applicables au dossier, avec leur état, et un résumé par phase |
| `POST /dossiers/:id/depouillement` | `depouiller_pieces` | `{ "piece": "DEMANDE_VISA", "presente": true, "etat": "PRESENTE", "motif": "…" }` |

Les quatre états sont `PRESENTE`, `MANQUANTE`, `ILLISIBLE`, `A_CORRIGER`. Seul
`PRESENTE` satisfait une pièce obligatoire. Tout autre état **exige un
motif** (**422** sinon).

### Pièces jointes — `/dossiers/:id/documents`

| Endpoint | Permission | Description |
|----------|-----------|-------------|
| `GET /dossiers/:id/documents` | — | Liste des pièces jointes du dossier |
| `POST /dossiers/:id/documents` | `upload_document` \| `manage_documents` | `multipart/form-data`, champ **`fichier`** ; `piece_code` et `description` optionnels |
| `GET /dossiers/:id/documents/:documentId/fichier` | — | Télécharge le fichier (nom d'origine) |
| `DELETE /dossiers/:id/documents/:documentId` | `upload_document` \| `manage_documents` | Supprime (le déposant ou l'administrateur) |

Formats acceptés : `.pdf`, `.jpg`, `.jpeg`, `.png`, `.docx`, `.xlsx`. Taille
maximale : **5 Mo**. Le fichier est stocké sous un nom **UUID** ; le nom
d'origine n'est conservé qu'en base, pour l'affichage. Un dossier archivé
n'accepte plus de dépôt.

### `GET /dossiers/:id/tracabilite`
Actes métier du dossier (affectations, prises en charge, contrôles, décisions),
avec leur auteur et leur date.

### `GET /dossiers/:id/prochaine-action`
« À faire ensuite » : la prochaine action du dossier, et l'acteur qui doit
l'accomplir (auth requise).

```json
{
  "code": "VERIFIER",
  "titre": "Vérifier et décider",
  "description": "Le dossier attend la vérification du Chef de Division. Décidez : valider, ou demander une correction avec un motif.",
  "acteur": "Le Chef de la division Visa",
  "pour_moi": false,
  "permissions": ["verifier_dossier", "valider_dossier"],
  "statut": "SOUMIS_A_VERIFICATION"
}
```

`pour_moi` vaut `true` quand l'agent connecté détient l'une des permissions
requises : l'interface n'affiche alors le bouton que s'il peut agir. La
règle est calculée par le service, en un seul endroit : la fiche, la liste et
les notifications ne peuvent pas diverger.

### `GET /dossiers/:id/transmissions`
Bordereaux par lesquels le dossier a circulé (auth requise).

```json
[{
  "id": 3, "reference": "BORD-2026-000003", "statut": "RECU_PAR_DIVISION",
  "date_transmission": "2026-10-18T09:12:00.000Z",
  "division_nom": "Division Secours", "division_expediteur_nom": "Division Visa",
  "agent_nom": "RAKOTO", "date_reception_division": "2026-10-18T15:40:00.000Z",
  "observation": "Dossier transmis pour traitement."
}]
```

### `POST /dossiers/:id/publier`
Publication d'un brouillon : le dossier entre dans le circuit (auth requise,
permission `create_dossier`).

Seul l'auteur du brouillon peut le publier (**403** sinon), et la fiche doit
être complète : un brouillon VISA sans origine, comptable ou type d'acte est
refusé (**422**).

---

## 3 bis. Brouillons

Un dossier enregistré en brouillon n'est pas dans le circuit : il ne
déclenche aucune notification, n'apparaît dans aucune file ni aucun compteur,
et n'est visible que de son auteur.

### `POST /dossiers` avec `brouillon: true`

Le dossier est créé avec le statut `BROUILLON`. Il conserve son numéro : une
référence n'est jamais réutilisée. La complétude de la fiche VISA n'est pas
exigée à la création — c'est le cas d'usage même du brouillon — mais elle
l'est à la publication.

### `GET /dossiers?brouillon=1`

Liste les brouillons de l'agent connecté. Le filtre est posé par le serveur :
un brouillon n'appartient qu'à son auteur.

### Statut `BROUILLON`

Ajouté aux statuts du workflow. Transitions : `BROUILLON → ENREGISTRE`
(publication).

Réponse de transition : `{ "message": "…" }` ; en cas de statut incohérent : **409/400** `{ "message": "…" }`.

### `GET /dossiers/:id/fiche-reception`
Fiche de réception en PDF (`application/pdf`).

### Module Secours - `/dossiers/:id/secours`

Les cinq étapes du mandat de décès. La lecture est ouverte à qui peut
consulter le dossier ; chaque écriture a sa permission dédiée.

> **Ces permissions doivent être portées par un rôle.** Une route qui exige
> un droit que personne ne porte est une route fermée : le serveur répond 403
> à tout le monde. Le contrôle `test-e2e-droits.mjs` le vérifie à chaque
> campagne.
>
> | Droit | Porté par |
> |---|---|
> | `enregistrer_visa_cf` | Chef de Division Secours |
> | `generer_etat_emargement` | Chef de Division Secours |
> | `signer_pieces_mandatement` | Chef de Division Secours |
> | `archiver_copie_mandatement` | Chef de Division Secours, Chargé de Secours |
> | `apposer_cachet` | Chargé de Secours |

| Endpoint | Permission | Description |
|---|---|---|
| `GET /dossiers/:id/secours/etat` | — | Les cinq étapes réunies : `visa`, `references`, `emargement`, `signature`, `cachet` |
| `GET /dossiers/:id/secours/reception` | — | Le dossier est-il réceptionnable ? (visa du CF + pièces du PGA) |
| `GET /dossiers/:id/secours/visa` | — | Visa du contrôle financier enregistré |
| `POST /dossiers/:id/secours/visa` | `enregistrer_visa_cf` | `{ "numero_visa": "…", "signe_par": "…", "date_visa": "2026-10-20", "commentaire": "…" }` |
| `GET /dossiers/:id/secours/references` | — | Références du logiciel Secours à reporter |
| `POST /dossiers/:id/secours/references/:code` | `generer_etat_emargement` | Reporter une référence |
| `GET /dossiers/:id/secours/emargement` | — | État d'émargement et ses bénéficiaires |
| `POST /dossiers/:id/secours/emargement` | `generer_etat_emargement` | Générer l'état d'émargement |
| `PUT /dossiers/:id/secours/emargement/:beneficiaire` | `generer_etat_emargement` | `{ "signataire": "…", "signe_le": "2026-10-20", "observation": "…" }` |
| `GET /dossiers/:id/secours/signature` | — | Signature de l'ordonnateur |
| `POST /dossiers/:id/secours/signature` | `signer_pieces_mandatement` | `{ "reference_signature": "…", "observations": "…" }` |
| `GET /dossiers/:id/secours/cachet` | — | Cachet apposé |
| `POST /dossiers/:id/secours/cachet` | `apposer_cachet` | `{ "titre_ordonnateur": "…", "nom_ordonnateur": "…", "date_cachet": "2026-10-20" }` |

---

## 4. Workflow générique — `/workflow`

### `POST /workflow/:id/transition`
Transition générique par code de statut cible.

```json
{ "toStatus": "ORIENTE", "details": "Orientation vers la Division Visa" }
```

> Le statut se lit par `GET /dossiers/:id/statut`, qui rend le statut et les
> transitions autorisées. Il existait aussi `GET /workflow/:id/statut`, avec
> la même réponse : deux chemins pour le même fait, dont un pouvait
> diverger sans qu'on s'en aperçoive. Il a été retiré.

---

## 5. Pièces jointes — `/dossiers/:id/documents`

Les pièces jointes sont **portées par le dossier**. Il n'existe pas de route
`/documents` autonome : rattacher un fichier à un dossier et le lire passent
par le même préfixe, ce qui interdit de télécharger la pièce d'un autre
dossier en changeant un identifiant.

| Endpoint | Permission | Description |
|----------|-----------|-------------|
| `GET /dossiers/:id/documents` | — | Liste des pièces jointes du dossier |
| `POST /dossiers/:id/documents` | `upload_document` \| `manage_documents` | Dépôt, `multipart/form-data` |
| `GET /dossiers/:id/documents/:documentId/fichier` | — | Téléchargement (`Content-Disposition: attachment`, nom d'origine) |
| `DELETE /dossiers/:id/documents/:documentId` | `upload_document` \| `manage_documents` | Suppression (le déposant ou l'administrateur) |

Corps du dépôt (champ fichier **`fichier`** + champs texte) :

| Champ | Requis | Description |
|-------|--------|-------------|
| `fichier` | ✅ | Le fichier (PDF, JPG, JPEG, PNG, DOCX, XLSX — **5 Mo maximum**) |
| `piece_code` | | Code d'une pièce requise par ce dossier |
| `description` | | Description (500 caractères maximum) |

Le fichier est écrit sous un nom **UUID** : son nom d'origine ne reste qu'en
base, pour l'affichage. Un dossier archivé n'accepte plus de dépôt ni de
suppression. Le dépôt et la suppression sont tracés dans l'historique.

---

## 6. Courriers — `/courriers`

### `GET /courriers`
Liste des courriers.

### `GET /courriers/:id`
Détail d'un courrier.

### `POST /courriers` — permission `manage_courriers`

```json
{
  "type_id": 1,
  "sens": "ENTRANT",            // ou "SORTANT"
  "expediteur": "DGSP",
  "destinataire": "",
  "objet": "Transmission des dossiers",
  "division_id": 2,             // null possible
  "dossier_id": 5               // null possible
}
```

### `PUT /courriers/:id/statut` — permission `manage_courriers`
Mise à jour du statut du courrier (corps : statut cible).

---

## 7. Notifications — `/notifications`

Notifications de l'utilisateur connecté (auth requise).

| Endpoint | Description |
|----------|-------------|
| `GET /notifications` | Liste des notifications de l'utilisateur |
| `PUT /notifications/:id/lu` | Marquer une notification comme lue |
| `PUT /notifications/lu/tout` | Tout marquer comme lu |

---

## 8. Historique — `/historique`

### `GET /historique`
Traçabilité complète. Query params : `dossier_id`, `user_id`, `action`, `search`.

Chaque entrée : `{ id, user_id, user_nom, action, dossier_id, details, created_at }`.

---

## 9. Tableau de bord & statistiques

### `GET /dashboard/summary`
Indicateurs globaux (total dossiers, par statut, par type…) et files
d'attente par rôle, restreints au périmètre de l'utilisateur.

### `GET /dashboard/boite-travail`
La boîte de travail :

```json
{
  "a_traiter_par_moi":   { "total": 4, "dossiers": [ … ] },
  "en_attente_validation":{ "total": 2, "dossiers": [ … ] },
  "incomplets":          { "total": 1, "dossiers": [ … ] },
  "clotures_recents":    { "total": 7, "dossiers": [ … ] },
  "par_categorie":       [ { "type_code": "VISA", "type_libelle": "Visa", "total": 12, "statuts": { … } } ],
  "par_statut":          [ { "code": "RECU", "statut": "Reçu", "total": 3 } ],
  "perimetre":           { "type": "AGENT", "libelle": "…", "role": "VERIFICATEUR_VISA" }
}
```

### `GET /dashboard/by-division`
Répartition des dossiers par division.

### `GET /dashboard/by-status`
Répartition des dossiers par statut.

### `GET /dashboard/evolution`
Évolution (série temporelle, paramètres : `mois`, ou période via `debut`/`fin`).

### `GET /dashboard/ressources`
Effectifs et charge par division.

### `GET /dashboard/secretaire-kpis`
Indicateurs du secrétariat (**403** pour les autres rôles).

### `GET /statistiques`
### `GET /performance/stats`, `/performance/en-retard`, `/performance/par-division`, `/performance/par-agent`, `/performance/evolution`

Indicateurs de performance du service. Tous appliquent le **périmètre** de
l'utilisateur : un chef de division ne lit que sa division, un agent que ses
propre dossiers, un profil de pilotage l'ensemble du service.

Le délai moyen est l'écart entre la **réception** et la **clôture**, tel qu'il
est constaté. Aucun délai réglementaire n'est calculé : le cahier n'en fixe
aucun.

| Endpoint | Renvoie |
|---|---|
| `/performance/stats` | Total, clôturés, archivés, en cours, en attente, à corriger, délai moyen, taux de traitement |
| `/performance/en-retard` | Les dossiers dont la **date limite saisie** est dépassée, avec le nombre de jours de retard |
| `/performance/par-division` | Les mêmes indicateurs, par division |
| `/performance/par-agent` | Les mêmes indicateurs, par agent responsable |
| `/performance/evolution` | Le volume des dossiers par mois sur douze mois |
Statistiques détaillées. Query params : `debut`, `fin`, `type`, `division_id`.

---

## 10. Rapports — `/rapports`

Tous les rapports sont exportables en **PDF** et en **Excel** (`.xlsx`).
Le frontend télécharge les blobs retournés.

| Endpoint | Rapport |
|----------|---------|
| `GET /rapports/pdf` · `/rapports/excel` | Rapport général (période / division / type) |
| `GET /rapports/journalier-recus/pdf` · `/excel` | Journalier des dossiers reçus |
| `GET /rapports/dossiers-periode/pdf` · `/excel` | Dossiers par période |
| `GET /rapports/attente-transmission/pdf` · `/excel` | Dossiers en attente de transmission |
| `GET /rapports/incomplets/pdf` · `/excel` | Dossiers incomplets (pièces obligatoires) |
| `GET /rapports/retournes/pdf` · `/excel` | Dossiers retournés / corrigés |
| `GET /rapports/transmissions-division/pdf` · `/excel` | Transmissions par division (bordereaux) |
| `GET /rapports/registre-courriers/pdf` · `/excel` | Registre des courriers |
| `GET /rapports/clotures/pdf` · `/excel` | Dossiers clôturés |
| `GET /rapports/archives/pdf` · `/excel` | Dossiers archivés |
| `GET /rapports/stats-type-periode-division/pdf` · `/excel` | Statistiques par type, période et division |
| `GET /rapports/visa/pdf` · `/excel` | **Rapport VISA** |
| `GET /rapports/visa-par-verificateur/pdf` · `/excel` | **Rapport VISA par vérificateur** |
| `GET /rapports/operations/pdf` · `/excel` | **Opérations d'une division** — dossier par dossier |
| `GET /rapports/operations-par-type/pdf` · `/excel` | **Opérations par type** — agrégat de pilotage |
| `GET /rapports/secours/pdf` · `/excel` | **Suivi des dossiers Secours de décès** — les cinq étapes du mandat |

Les rapports par division acceptent `type=SOLDE|PENSION|SECOURS` (vide = les
trois), `periode=mensuel|trimestriel|annuel`, `annee`, `mois`, `trimestre`,
ainsi que `date_debut` / `date_fin`. Une division inconnue est refusée
(**422**) : mieux vaut une erreur explicite qu'un rapport vide, qui laisserait
croire à une absence de dossiers.

Permission : `view_stats`, `consolidate_reports` ou `export_data`.

---

## 11. Administration

### Personnel — `/personnel` (admin)
Une personne réunit sa fiche (`agents`) et, si elle a un compte, sa connexion (`users`) :
les deux s'écrivent ensemble, pour qu'un compte ne reste pas rattaché à une autre fiche.

| Endpoint | Description |
|----------|-------------|
| `GET /personnel` | Liste des personnes, avec leur compte (identifiant, rôle, dernière connexion) |
| `GET /personnel/:id` | Détail d'une personne |
| `POST /personnel` | Créer une personne : identité, et compte facultatif (`creer_compte: true` + `username`, `compte_email`, `password`, `role_id`) |
| `PUT /personnel/:id` | Modifier la fiche et, le cas échéant, son compte (création du compte comprise) |
| `PUT /personnel/:id/toggle` | Activer / désactiver la personne (fiche et compte ensemble) |
| `POST /personnel/:id/reset-password` | Réinitialiser le mot de passe : `{ "password": "…" }` |
| `DELETE /personnel/:id` | Supprimer la personne ; si sa fiche est citée par des dossiers, elle est désactivée |

### Comptes — `/users` : retiré

La gestion des comptes se fait par `/personnel`, qui tient la fiche et le
compte de connexion ensemble. `/users` en était un doublon, et un doublon
dangereux : il permettait de créer un compte **sans fiche** — exactement ce
que l'écran « Personnel » a été fait pour interdire, parce qu'un compte sans
fiche n'appartient à personne et qu'une fiche sans compte n'existe pas.

Il a été retiré, avec son contrôleur et son service de présentation. Le
service métier des comptes, lui, est conservé : c'est lui que `/personnel`
emploie pour créer le compte d'une nouvelle fiche.

### Rôles — `/roles` (permission `manage_roles`)
| Endpoint | Description |
|----------|-------------|
| `GET /roles` | Liste des rôles (13 postes SRSP) |
| `GET /roles/:id` | Détail d'un rôle |
| `POST /roles` | Créer un rôle |
| `PUT /roles/:id` | Modifier un rôle |
| `DELETE /roles/:id` | Supprimer un rôle |
| `PUT /roles/:id/permissions` | Affecter les permissions : `{ "permission_ids": [1, 2, …] }` |

### Permissions — `/permissions`
| Endpoint | Description |
|----------|-------------|
| `GET /permissions` | Liste des permissions |
| `GET /permissions/me` | Permissions de l'utilisateur courant |
| `GET /permissions/:id` | Détail |
| `POST` / `PUT /:id` / `DELETE /:id` | CRUD (permission `role.gerer`) |

---

## 12. Agents & Divisions

### Agents — `/agents`
Fiches du personnel. Les lectures servent aux listes de choix (responsable d'une division,
agent d'un dossier, filtre du journal) ; les écritures passent par le même service que
`/personnel`, pour qu'une fiche ne puisse pas être rattachée à un compte déjà pris.

| Endpoint | Permission | Description |
|----------|-----------|-------------|
| `GET /agents` | `manage_personnel` | Liste des fiches, avec leur compte |
| `GET /agents/:id` | `manage_personnel` | Détail d'une fiche |
| `POST /agents` | `manage_personnel` | Créer une fiche (et son compte, si `creer_compte`) |
| `PUT /agents/:id` | `manage_personnel` | Modifier une fiche |
| `DELETE /agents/:id` | `manage_personnel` | Supprimer une fiche (ou la désactiver si elle est citée) |

### Divisions — `/divisions`
| Endpoint | Permission | Description |
|----------|-----------|-------------|
| `GET /divisions` | — | Liste des divisions (Visa, Solde, Pension, Secours) |
| `POST /divisions` | `manage_divisions` | Créer une division |
| `PUT /divisions/:id` | `manage_divisions` | Modifier une division |

---

## 13. Exemples rapides (curl)

```bash
BASE=http://localhost:5000/api

# Login
TOKEN=$(curl -s -X POST $BASE/auth/login -H 'Content-Type: application/json' \
  -d '{"identifiant":"admin@srsp.mg","password":"Admin123!"}' | node -pe 'JSON.parse(require("fs").readFileSync(0)).token')

# Référentiel
curl -s $BASE/referentiel -H "Authorization: Bearer $TOKEN"

# Liste des dossiers VISA validés
curl -s "$BASE/dossiers?type=VISA&statut=VALIDE" -H "Authorization: Bearer $TOKEN"

# Créer un dossier VISA complet
curl -s -X POST $BASE/dossiers -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"type_id":1,"objet":"Demande de visa","demandeur":"RAKOTO J.","matricule":"88743",
       "date_reception":"2026-09-23","division_id":1,"priorite_id":1,
       "sous_type_id":1,"date_heure_reception":"2026-09-23T09:30:00",
       "origine_presentateur":"Guichet central","comptable_presentateur":"Comptable RAKOTO",
       "annee_reference":2026,"beneficiaire":"RAKOTO J.","organisme":"Mairie de Fitovinany",
       "verificateur_id":12}'

# Boîte de travail
curl -s $BASE/dashboard/boite-travail -H "Authorization: Bearer $TOKEN"

# Pièces jointes d'un dossier
curl -s $BASE/dossiers/42/documents -H "Authorization: Bearer $TOKEN"

# Télécharger une pièce jointe
curl -sOJ $BASE/dossiers/42/documents/7/fichier -H "Authorization: Bearer $TOKEN"

# Contrôle d'une pièce du dépouillement
curl -s -X POST $BASE/dossiers/42/depouillement -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"piece":"DEMANDE_VISA","presente":true,"etat":"PRESENTE"}'

# Trace des suppressions
curl -s $BASE/dossiers/suppressions -H "Authorization: Bearer $TOKEN"
```