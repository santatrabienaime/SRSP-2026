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
| 409 | Conflit (ex. doublon) |
| 500 | Erreur serveur |

## Authentification

La plupart des routes exigent le header :

```
Authorization: Bearer <token>
```

Le token s'obtient via `POST /auth/login` (1 jour de validité par défaut).

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

---

## 2. Référentiel — `/referentiel`

### `GET /referentiel`
Données de référence pour alimenter les formulaires (auth requise). Sans paramètre.

```json
{
  "types_dossiers":   [ { "id": 1, "code": "VISA", "libelle": "Division Visa", "description": "…", "actif": true } ],
  "priorites":        [ { "id": 1, "libelle": "Urgente", "niveau": 1 } ],
  "fonctions":        [ { "id": 1, "libelle": "Chef de service", "description": "…" } ],
  "types_courriers":  [ { "id": 1, "libelle": "…" } ],
  "types_documents":  [ { "id": 1, "libelle": "…", "extensions_autorisees": "…", "taille_max": 10485760 } ],
  "statuts":          [ { "id": 1, "code": "RECU", "libelle": "Reçu", "ordre": 1 } ]
}
```

---

## 3. Dossiers — `/dossiers`

### `GET /dossiers`
Liste filtrable (auth requise).

| Query param | Type | Description |
|-------------|------|-------------|
| `statut` | string | Filtre par code de statut (ex. `VALIDE`) |
| `type` | string | Filtre par code de type (ex. `VISA`) |
| `statut_id` / `type_id` / `priorite_id` | int | Filtre par identifiant |
| `division_id` | int | Filtre par division |
| `agent_id` | int | Filtre par agent responsable |
| `search` | string | Recherche libre (numéro, objet, demandeur…) |

Chaque dossier : `{ id, numero, type_id, type_code, type_libelle, statut_id, statut_code,
statut_libelle, division_id, division_nom, agent_responsable_id, agent_nom, agent_prenom,
priorite_id, priorite_libelle, objet, demandeur, matricule, date_reception, observation, … }`

### `GET /dossiers/:id`
Détail d'un dossier.

### `GET /dossiers/:id/statut`
Statut courant + transitions autorisées.

```json
{ "statut": { "id": 2, "code": "ENREGISTRE", "libelle": "Enregistré", "ordre": 2 },
  "transitions_autorisees": ["ORIENTE"] }
```

### `POST /dossiers` — permission `dossier.creer`

```json
{
  "type_id": 1,
  "objet": "Demande de visa",
  "demandeur": "RAKOTO Jean",
  "matricule": "88743",
  "date_reception": "2026-09-23",
  "division_id": 1,
  "priorite_id": 1,
  "observation": "(optionnel)"
}
```

Le numéro est généré automatiquement : `{TYPE}-{ANNEE}-{6 chiffres}` (ex. `VISA-2026-000001`).
La création enregistre automatiquement le passage **Reçu → Enregistré** dans l'historique.

### `PUT /dossiers/:id` — permission `dossier.modifier`
Même corps que la création (mise à jour des informations générales).

### Actions du workflow — permissions spécifiques

| Endpoint | Permission | Corps |
|----------|-----------|-------|
| `POST /dossiers/:id/orienter` | `dossier.affecter` | `{ "division_id": 2 }` |
| `POST /dossiers/:id/affecter` | `dossier.affecter` | `{ "division_id": 2, "agent_id": 3 }` |
| `POST /dossiers/:id/traiter` | `dossier.traiter` | `{ "observation": "…" }` *(optionnel)* |
| `POST /dossiers/:id/verifier` | `dossier.verifier` | `{ "resultat": "ok" \| "correction", "observation": "…" }` |
| `POST /dossiers/:id/valider` | `dossier.valider` | `{ "decision": "valider" \| "correction", "commentaire": "…" }` |
| `POST /dossiers/:id/signer` | `dossier.valider` | `{ "reference": "N° 123/2026", "observation": "…" }` |
| `POST /dossiers/:id/cloturer` | `dossier.cloturer` | — |
| `POST /dossiers/:id/archiver` | `dossier.archiver` | — |

Contraintes du workflow (appliquées côté serveur) :
- La **règle forte** du cahier des charges est respectée : depuis **`CORRECTION_DEMANDEE`**,
  le seul passage possible est **retour en traitement** — il est impossible de passer
  directement à **`VALIDE`**.
- `SIGNE` exige `VALIDE`, `CLOTURE` exige `SIGNE`, `ARCHIVE` exige `CLOTURE`.

Réponse de transition : `{ "message": "…" }` ; en cas de statut incohérent : **409/400** `{ "message": "…" }`.

---

## 4. Workflow générique — `/workflow`

### `GET /workflow/:id/statut`
Statut courant + transitions autorisées (équivalent à `GET /dossiers/:id/statut`).

### `POST /workflow/:id/transition`
Transition générique par code de statut cible.

```json
{ "toStatus": "ORIENTE", "details": "Orientation vers la Division Visa" }
```

---

## 5. Documents — `/documents`

### `GET /documents`
Liste des documents (avec `type_libelle`). Query params : `dossier_id`, `courrier_id`, `type_id`, `search`.

### `GET /documents/:id/download`
Télécharge le fichier (`Content-Disposition: attachment`, nom d'origine). 404 si fichier manquant.

### `POST /documents` — multipart/form-data
Champ fichier **`fichier`** + champs texte :

| Champ | Requis | Description |
|-------|--------|-------------|
| `fichier` | ✅ | Le fichier (max `MAX_FILE_SIZE`, 10 Mo par défaut) |
| `dossier_id` | | Dossier rattaché |
| `courrier_id` | | Courrier rattaché |
| `type_id` | | Type de document (référentiel) |

Réponse 201 : document créé (avec `chemin_stockage`, `taille`, etc.).

### `PUT /documents/:id/valider`
```json
{ "valide": true }
```

### `DELETE /documents/:id`
Supprime le document (204). Fichier supprimé du disque.

---

## 6. Courriers — `/courriers`

### `GET /courriers`
Liste des courriers.

### `GET /courriers/:id`
Détail d'un courrier.

### `POST /courriers` — permission `courrier.gerer`

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

### `PUT /courriers/:id/statut` — permission `courrier.gerer`
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
Indicateurs globaux (total dossiers, par statut, par type…).

### `GET /dashboard/by-division`
Répartition des dossiers par division.

### `GET /dashboard/by-status`
Répartition des dossiers par statut.

### `GET /dashboard/evolution`
Évolution (série temporelle, paramètres : `mois`, ou période via `debut`/`fin`).

### `GET /statistiques`
Statistiques détaillées. Query params : `debut`, `fin`, `type`, `division_id`.

---

## 10. Rapports — `/rapports`

| Endpoint | Description |
|----------|-------------|
| `GET /rapports/pdf` | Rapport PDF (`application/pdf`). Query params : période/division/type. |
| `GET /rapports/excel` | Rapport Excel (`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`). |

Le frontend télécharge les blobs retournés (voir `Frontend/src/utils/fileHandler.js` → `downloadBlob`).

---

## 11. Administration

### Utilisateurs — `/users` (admin)
| Endpoint | Description |
|----------|-------------|
| `GET /users` | Liste des utilisateurs |
| `POST /users` | Créer un utilisateur : `{ username, email, password, role_id, actif }` |
| `PUT /users/:id` | Mettre à jour un utilisateur |
| `POST /users/:id/reset-password` | Réinitialiser le mot de passe |

### Rôles — `/roles` (permission `role.gerer`)
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
| Endpoint | Permission | Description |
|----------|-----------|-------------|
| `GET /agents` | — | Liste des agents |
| `POST /agents` | `agent.gerer` | Créer un agent |
| `PUT /agents/:id` | `agent.gerer` | Modifier un agent |

### Divisions — `/divisions`
| Endpoint | Permission | Description |
|----------|-----------|-------------|
| `GET /divisions` | — | Liste des divisions (Visa, Solde, Pension, Secours) |
| `POST /divisions` | `division.gerer` | Créer une division |
| `PUT /divisions/:id` | `division.gerer` | Modifier une division |

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

# Créer un dossier
curl -s -X POST $BASE/dossiers -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"type_id":1,"objet":"Demande de visa","demandeur":"RAKOTO J.","date_reception":"2026-09-23","division_id":1,"priorite_id":1}'

# Télécharger un document
curl -sOJ $BASE/documents/1/download -H "Authorization: Bearer $TOKEN"
```