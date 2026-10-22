# Schéma de la base de données — `srsp_db`

Document **généré automatiquement** à partir de la base vivante :
`node Backend/scripts/generer-doc-schema.mjs`.

Il ne peut donc pas diverger de ce que l'application utilise réellement.

## Conventions

| Convention | Règle |
|---|---|
| Noms de tables | `snake_case` au singulier. |
| Clés primaires | `id` en `INT AUTO_INCREMENT`. |
| Horodatage | `created_at` / `updated_at` (MySQL), `date_action` pour le journal. |
| Suppression | `ON DELETE CASCADE` quand l'enfant n'a aucun sens sans son parent ; `SET NULL` quand la trace doit survivre ; `RESTRICT` quand la référence est structurante. |
| Montants | `DECIMAL`, jamais `FLOAT`. |
| Dates de service | `DATE` pour un jour, `DATETIME` pour un horodatage. |

## Référentiel et comptes

### `users`

Comptes de connexion. `role_id` désigne le rôle, qui porte les permissions.

*13 ligne(s) en base.*

| Colonne | Type | Null | Défaut | Commentaire |
|---|---|---|---|---|
| `id` | entier | non | — | — |
| `username` | texte | non | — | — |
| `email` | texte | non | — | — |
| `password_hash` | texte | non | — | — |
| `role_id` | entier | oui | — | — |
| `actif` | entier | oui | `1` | — |
| `derniere_connexion` | date | oui | — | — |
| `mot_de_passe_change_le` | date | oui | — | — |
| `tentatives_echouees` | entier | non | `0` | — |
| `verrouille_jusqua` | date | oui | — | — |
| `created_at` | date | oui | `current_timestamp()` | — |
| `updated_at` | date | oui | `current_timestamp()` | — |

**Clés étrangères**

| Contrainte | Colonne | Référence | Suppression |
|---|---|---|---|
| `fk_users_role` | `role_id` | `roles` | RESTRICT |

**Index** : `PRIMARY`, `username`, `email`.

### `roles`

Rôles métier (13 postes).

*13 ligne(s) en base.*

| Colonne | Type | Null | Défaut | Commentaire |
|---|---|---|---|---|
| `id` | entier | non | — | — |
| `nom` | texte | non | — | — |
| `description` | texte | oui | — | — |
| `created_at` | date | oui | `current_timestamp()` | — |
| `updated_at` | date | oui | `current_timestamp()` | — |

**Index** : `PRIMARY`, `nom`.

### `permissions`

Permissions unitaires, accordées aux rôles par `role_permissions`.

*50 ligne(s) en base.*

| Colonne | Type | Null | Défaut | Commentaire |
|---|---|---|---|---|
| `id` | entier | non | — | — |
| `nom` | texte | non | — | — |
| `description` | texte | oui | — | — |
| `created_at` | date | oui | `current_timestamp()` | — |

**Index** : `PRIMARY`, `nom`.

### `role_permissions`

Table d'association rôle ↔ permission.

*150 ligne(s) en base.*

| Colonne | Type | Null | Défaut | Commentaire |
|---|---|---|---|---|
| `role_id` | entier | non | — | — |
| `permission_id` | entier | non | — | — |

**Clés étrangères**

| Contrainte | Colonne | Référence | Suppression |
|---|---|---|---|
| `fk_rp_permission` | `permission_id` | `permissions` | CASCADE |
| `fk_rp_role` | `role_id` | `roles` | CASCADE |

**Index** : `PRIMARY`.

### `agents`

Fiches des agents. `user_id` relie éventuellement la fiche au compte de connexion.

*13 ligne(s) en base.*

| Colonne | Type | Null | Défaut | Commentaire |
|---|---|---|---|---|
| `id` | entier | non | — | — |
| `user_id` | entier | oui | — | — |
| `nom` | texte | non | — | — |
| `prenom` | texte | non | — | — |
| `matricule` | texte | oui | — | — |
| `fonction_id` | entier | oui | — | — |
| `division_id` | entier | oui | — | — |
| `email` | texte | oui | — | — |
| `telephone` | texte | oui | — | — |
| `actif` | entier | oui | `1` | — |
| `created_at` | date | oui | `current_timestamp()` | — |

**Clés étrangères**

| Contrainte | Colonne | Référence | Suppression |
|---|---|---|---|
| `fk_agents_division` | `division_id` | `divisions` | RESTRICT |
| `fk_agents_fonction` | `fonction_id` | `fonctions` | RESTRICT |
| `fk_agents_user` | `user_id` | `users` | SET NULL |

**Index** : `PRIMARY`, `matricule`.

### `divisions`

Divisions du service. `type_dossier_id` détermine le type de dossier traité.

*4 ligne(s) en base.*

| Colonne | Type | Null | Défaut | Commentaire |
|---|---|---|---|---|
| `id` | entier | non | — | — |
| `code` | texte | non | — | — |
| `nom` | texte | non | — | — |
| `type_dossier_id` | entier | non | — | — |
| `responsable_id` | entier | oui | — | — |
| `actif` | entier | oui | `1` | — |
| `created_at` | date | oui | `current_timestamp()` | — |

**Clés étrangères**

| Contrainte | Colonne | Référence | Suppression |
|---|---|---|---|
| `fk_division_responsable` | `responsable_id` | `agents` | SET NULL |
| `fk_division_type_dossier` | `type_dossier_id` | `types_dossiers` | RESTRICT |

**Index** : `PRIMARY`, `code`.

### `types_dossiers`

Types de dossiers (VISA, SOLDE, PENSION, SECOURS).

*4 ligne(s) en base.*

| Colonne | Type | Null | Défaut | Commentaire |
|---|---|---|---|---|
| `id` | entier | non | — | — |
| `code` | texte | oui | — | — |
| `libelle` | texte | non | — | — |
| `description` | texte | oui | — | — |
| `actif` | entier | oui | `1` | — |

**Index** : `PRIMARY`, `code`.

### `sous_types_dossiers`

Sous-types de dossiers (types d'acte) : « Visa de mariage », « Visa de naissance »…

*22 ligne(s) en base.*

| Colonne | Type | Null | Défaut | Commentaire |
|---|---|---|---|---|
| `id` | entier | non | — | — |
| `type_dossier_id` | entier | non | — | — |
| `code` | texte | non | — | — |
| `libelle` | texte | non | — | — |
| `actif` | entier | non | `1` | — |
| `ordre` | smallint(6) | non | `0` | — |
| `created_at` | date | non | `current_timestamp()` | — |

**Clés étrangères**

| Contrainte | Colonne | Référence | Suppression |
|---|---|---|---|
| `fk_sous_type_type` | `type_dossier_id` | `types_dossiers` | CASCADE |

**Index** : `PRIMARY`, `uk_sous_type`.

### `statuts_dossiers`

Statuts du workflow. `ordre` fixe l'ordre de lecture.

*13 ligne(s) en base.*

| Colonne | Type | Null | Défaut | Commentaire |
|---|---|---|---|---|
| `id` | entier | non | — | — |
| `code` | texte | non | — | — |
| `libelle` | texte | non | — | — |
| `ordre` | entier | oui | `0` | — |

**Index** : `PRIMARY`, `code`.

### `priorites`

Priorités des dossiers.

*4 ligne(s) en base.*

| Colonne | Type | Null | Défaut | Commentaire |
|---|---|---|---|---|
| `id` | entier | non | — | — |
| `libelle` | texte | non | — | — |
| `niveau` | entier | oui | `1` | — |

**Index** : `PRIMARY`, `uq_priorites_libelle`.

### `types_courriers`

Types de courriers.

*6 ligne(s) en base.*

| Colonne | Type | Null | Défaut | Commentaire |
|---|---|---|---|---|
| `id` | entier | non | — | — |
| `libelle` | texte | non | — | — |

**Index** : `PRIMARY`, `uq_types_courriers_libelle`.

### `types_documents`

Types de documents.

*7 ligne(s) en base.*

| Colonne | Type | Null | Défaut | Commentaire |
|---|---|---|---|---|
| `id` | entier | non | — | — |
| `libelle` | texte | non | — | — |
| `extensions_autorisees` | texte | oui | `pdf,jpg,jpeg,png,docx,xlsx` | — |
| `taille_max` | entier | oui | `10485760` | — |

**Index** : `PRIMARY`, `uq_types_documents_libelle`.

### `fonctions`

*8 ligne(s) en base.*

| Colonne | Type | Null | Défaut | Commentaire |
|---|---|---|---|---|
| `id` | entier | non | — | — |
| `libelle` | texte | non | — | — |
| `description` | texte | oui | — | — |

**Index** : `PRIMARY`, `uq_fonctions_libelle`.

## Dossiers et circuit

### `dossiers`

Dossiers. Porte les données communes et les champs VISA (`reference_visa`, `type_acte`, `verificateur_id`…).

*338 ligne(s) en base.*

| Colonne | Type | Null | Défaut | Commentaire |
|---|---|---|---|---|
| `id` | entier | non | — | — |
| `numero` | texte | non | — | — |
| `reference_visa` | texte | oui | — | — |
| `type_id` | entier | oui | — | — |
| `sous_type_id` | entier | oui | — | — |
| `objet` | texte | non | — | — |
| `demandeur` | texte | non | — | — |
| `matricule` | texte | oui | — | — |
| `date_reception` | date | non | — | — |
| `date_heure_reception` | date | oui | — | — |
| `date_limite` | date | oui | — | — |
| `division_id` | entier | oui | — | — |
| `priorite_id` | entier | oui | — | — |
| `statut_id` | entier | oui | — | — |
| `agent_responsable_id` | entier | oui | — | — |
| `observation` | texte | oui | — | — |
| `date_cloture` | date | oui | — | — |
| `date_archivage` | date | oui | — | — |
| `created_by` | entier | oui | — | — |
| `created_at` | date | oui | `current_timestamp()` | — |
| `updated_at` | date | oui | `current_timestamp()` | — |
| `demandeur_nom` | texte | oui | — | — |
| `demandeur_prenom` | texte | oui | — | — |
| `demandeur_tel` | texte | oui | — | — |
| `demandeur_email` | texte | oui | — | — |
| `demandeur_adresse` | texte | oui | — | — |
| `origine_presentateur` | texte | oui | — | — |
| `comptable_presentateur` | texte | oui | — | — |
| `type_acte` | texte | oui | — | — |
| `annee_reference` | smallint(6) | oui | — | — |
| `verificateur_id` | entier | oui | — | — |
| `date_signature` | date | oui | — | — |
| `signataire_id` | entier | oui | — | — |
| `reference_signature` | texte | oui | — | — |
| `exception_validation` | texte | oui | — | — |
| `exception_autorisee_par` | entier | oui | — | — |
| `date_exception` | date | oui | — | — |
| `motif_complement` | texte | oui | — | — |
| `beneficiaire` | texte | oui | — | — |
| `organisme` | texte | oui | — | — |

**Clés étrangères**

| Contrainte | Colonne | Référence | Suppression |
|---|---|---|---|
| `fk_dossiers_agent` | `agent_responsable_id` | `agents` | SET NULL |
| `fk_dossiers_division` | `division_id` | `divisions` | RESTRICT |
| `fk_dossiers_priorite` | `priorite_id` | `priorites` | RESTRICT |
| `fk_dossiers_statut` | `statut_id` | `statuts_dossiers` | RESTRICT |
| `fk_dossiers_type` | `type_id` | `types_dossiers` | RESTRICT |
| `fk_dossiers_user` | `created_by` | `users` | RESTRICT |

**Index** : `PRIMARY`, `numero`, `uk_dossiers_reference_visa`.

### `historique_actions`

Journal des actions. `dossier_id` est supprimé en cascade avec le dossier : la trace de suppression est conservée ailleurs, dans `suppressions_dossiers`.

*6053 ligne(s) en base.*

| Colonne | Type | Null | Défaut | Commentaire |
|---|---|---|---|---|
| `id` | entier | non | — | — |
| `user_id` | entier | oui | — | — |
| `action` | texte | non | — | — |
| `dossier_id` | entier | oui | — | — |
| `ancienne_valeur` | texte | oui | — | — |
| `nouvelle_valeur` | texte | oui | — | — |
| `details` | texte | oui | — | — |
| `ip_address` | texte | oui | — | — |
| `date_action` | date | oui | `current_timestamp()` | — |

**Clés étrangères**

| Contrainte | Colonne | Référence | Suppression |
|---|---|---|---|
| `fk_hist_dossier` | `dossier_id` | `dossiers` | CASCADE |
| `fk_hist_user` | `user_id` | `users` | SET NULL |

**Index** : `PRIMARY`.

### `suppressions_dossiers`

Trace durable des suppressions : motif, auteur, date et instantané du journal. Aucune clé étrangère vers `dossiers` — la trace survit à la suppression.

*34 ligne(s) en base.*

| Colonne | Type | Null | Défaut | Commentaire |
|---|---|---|---|---|
| `id` | entier | non | — | — |
| `dossier_id` | entier | non | — | — |
| `numero` | texte | non | — | — |
| `reference_visa` | texte | oui | — | — |
| `type_code` | texte | oui | — | — |
| `objet` | texte | oui | — | — |
| `demandeur` | texte | oui | — | — |
| `matricule` | texte | oui | — | — |
| `division_nom` | texte | oui | — | — |
| `statut_code` | texte | oui | — | — |
| `agent_nom` | texte | oui | — | — |
| `date_reception` | date | oui | — | — |
| `motif` | texte | non | — | — |
| `supprime_par` | entier | oui | — | — |
| `supprime_par_nom` | texte | oui | — | — |
| `date_suppression` | date | non | `current_timestamp()` | — |
| `historique_json` | texte | oui | — | — |
| `nb_actions_historique` | entier | non | `0` | — |

**Clés étrangères**

| Contrainte | Colonne | Référence | Suppression |
|---|---|---|---|
| `fk_suppression_user` | `supprime_par` | `users` | SET NULL |

**Index** : `PRIMARY`.

### `depouillements`

Contrôle des pièces : un enregistrement par (dossier, pièce), avec l'un des quatre états et son motif.

*430 ligne(s) en base.*

| Colonne | Type | Null | Défaut | Commentaire |
|---|---|---|---|---|
| `id` | entier | non | — | — |
| `dossier_id` | entier | non | — | — |
| `agent_id` | entier | oui | — | — |
| `piece` | texte | non | — | — |
| `presente` | entier | non | `0` | — |
| `etat` | enum('presente','manquante','illisible','a_corriger','non_applicable') | non | `MANQUANTE` | — |
| `observation` | texte | oui | — | — |
| `motif` | texte | oui | — | — |
| `date_controle` | date | non | `current_timestamp()` | — |

**Clés étrangères**

| Contrainte | Colonne | Référence | Suppression |
|---|---|---|---|
| `fk_depouillements_agent` | `agent_id` | `agents` | SET NULL |
| `fk_depouillements_dossier` | `dossier_id` | `dossiers` | CASCADE |

**Index** : `PRIMARY`, `uk_depouillement_dossier_piece`.

### `types_pieces`

Pièces requises, par phase, par type de dossier et par sous-type. `actif = 0` désactive sans effacer.

*61 ligne(s) en base.*

| Colonne | Type | Null | Défaut | Commentaire |
|---|---|---|---|---|
| `id` | entier | non | — | — |
| `code` | texte | non | — | — |
| `libelle` | texte | non | — | — |
| `obligatoire` | entier | non | `1` | — |
| `actif` | entier | non | `1` | — |
| `phase` | enum('depouillement','archivage') | non | `ARCHIVAGE` | — |
| `ordre` | smallint(5) unsigned | non | `0` | — |
| `division_code` | texte | oui | — | — |
| `type_dossier_id` | entier | oui | — | — |
| `sous_type_id` | entier | oui | — | — |

**Index** : `PRIMARY`, `uk_type_piece_code`.

### `documents`

Pièces jointes déposées sur un dossier. Le fichier est sur disque sous un nom UUID.

*92 ligne(s) en base.*

| Colonne | Type | Null | Défaut | Commentaire |
|---|---|---|---|---|
| `id` | entier | non | — | — |
| `dossier_id` | entier | oui | — | — |
| `courrier_id` | entier | oui | — | — |
| `type_id` | entier | oui | — | — |
| `piece_code` | texte | oui | — | — |
| `version` | entier | non | `1` | — |
| `remplace` | entier | oui | — | — |
| `motif_remplacement` | texte | oui | — | — |
| `nom_fichier` | texte | non | — | — |
| `chemin_stockage` | texte | non | — | — |
| `taille` | entier | oui | — | — |
| `description` | texte | oui | — | — |
| `valide` | entier | oui | `0` | — |
| `upload_par` | entier | oui | — | — |
| `created_at` | date | oui | `current_timestamp()` | — |

**Clés étrangères**

| Contrainte | Colonne | Référence | Suppression |
|---|---|---|---|
| `fk_document_courrier` | `courrier_id` | `courriers` | SET NULL |
| `fk_documents_dossier` | `dossier_id` | `dossiers` | CASCADE |
| `fk_documents_type` | `type_id` | `types_documents` | RESTRICT |
| `fk_documents_user` | `upload_par` | `users` | RESTRICT |

**Index** : `PRIMARY`.

### `archives`

Archives. `reference_archivage` est la référence d'archivage.

*37 ligne(s) en base.*

| Colonne | Type | Null | Défaut | Commentaire |
|---|---|---|---|---|
| `id` | entier | non | — | — |
| `dossier_id` | entier | non | — | — |
| `date_archivage` | date | oui | `current_timestamp()` | — |
| `reference_archivage` | texte | oui | — | — |
| `emplacement_physique` | texte | oui | — | — |
| `localisation_numerique` | texte | oui | — | — |
| `archive_par` | entier | oui | — | — |
| `motif` | texte | oui | — | — |
| `restaure` | entier | oui | `0` | — |

**Clés étrangères**

| Contrainte | Colonne | Référence | Suppression |
|---|---|---|---|
| `fk_archives_dossier` | `dossier_id` | `dossiers` | CASCADE |
| `fk_archives_user` | `archive_par` | `users` | RESTRICT |

**Index** : `PRIMARY`, `uq_archives_dossier`, `reference_archivage`.

### `notifications`

Notifications internes, avec accusé de lecture.

*1730 ligne(s) en base.*

| Colonne | Type | Null | Défaut | Commentaire |
|---|---|---|---|---|
| `id` | entier | non | — | — |
| `user_id` | entier | non | — | — |
| `dossier_id` | entier | oui | — | — |
| `type` | texte | oui | — | — |
| `action` | texte | oui | — | — |
| `message` | texte | non | — | — |
| `lien` | texte | oui | — | — |
| `lu` | entier | oui | `0` | — |
| `created_at` | date | oui | `current_timestamp()` | — |

**Clés étrangères**

| Contrainte | Colonne | Référence | Suppression |
|---|---|---|---|
| `fk_notif_user` | `user_id` | `users` | CASCADE |
| `fk_notification_dossier` | `dossier_id` | `dossiers` | CASCADE |

**Index** : `PRIMARY`, `uk_notif_user_action`.

### `messages`

Messages internes entre comptes.

*0 ligne(s) en base.*

| Colonne | Type | Null | Défaut | Commentaire |
|---|---|---|---|---|
| `id` | entier | non | — | — |
| `dossier_id` | entier | oui | — | — |
| `expediteur_id` | entier | non | — | — |
| `destinataire_id` | entier | non | — | — |
| `action` | texte | non | — | — |
| `message` | texte | non | — | — |
| `type` | texte | oui | `INFO` | — |
| `lu` | entier | oui | `0` | — |
| `date_creation` | date | oui | `current_timestamp()` | — |

**Clés étrangères**

| Contrainte | Colonne | Référence | Suppression |
|---|---|---|---|
| `messages_ibfk_1` | `dossier_id` | `dossiers` | CASCADE |
| `messages_ibfk_2` | `expediteur_id` | `users` | CASCADE |
| `messages_ibfk_3` | `destinataire_id` | `users` | CASCADE |

**Index** : `PRIMARY`.

### `dossier_commentaires`

Commentaires internes sur un dossier.

*0 ligne(s) en base.*

| Colonne | Type | Null | Défaut | Commentaire |
|---|---|---|---|---|
| `id` | entier | non | — | — |
| `dossier_id` | entier | non | — | — |
| `auteur_id` | entier | non | — | — |
| `contenu` | texte | non | — | — |
| `date_creation` | date | non | `current_timestamp()` | — |
| `modifie_le` | date | oui | — | — |

**Clés étrangères**

| Contrainte | Colonne | Référence | Suppression |
|---|---|---|---|
| `fk_commentaire_auteur` | `auteur_id` | `users` | CASCADE |
| `fk_commentaire_dossier` | `dossier_id` | `dossiers` | CASCADE |

**Index** : `PRIMARY`.

### `affectations`

Affectations. `ancien_agent_id` conserve l'agent précédent lors d'un transfert.

*332 ligne(s) en base.*

| Colonne | Type | Null | Défaut | Commentaire |
|---|---|---|---|---|
| `id` | entier | non | — | — |
| `dossier_id` | entier | non | — | — |
| `division_id` | entier | oui | — | — |
| `agent_id` | entier | oui | — | — |
| `ancien_agent_id` | entier | oui | — | — |
| `motif` | texte | oui | — | — |
| `auteur_id` | entier | oui | — | — |
| `date_affectation` | date | oui | `current_timestamp()` | — |

**Clés étrangères**

| Contrainte | Colonne | Référence | Suppression |
|---|---|---|---|
| `fk_affectations_agent` | `agent_id` | `agents` | SET NULL |
| `fk_affectations_division` | `division_id` | `divisions` | RESTRICT |
| `fk_affectations_dossier` | `dossier_id` | `dossiers` | CASCADE |

**Index** : `PRIMARY`.

### `transferts`

Transferts de dossier entre agents, avec motif.

*0 ligne(s) en base.*

| Colonne | Type | Null | Défaut | Commentaire |
|---|---|---|---|---|
| `id` | entier | non | — | — |
| `dossier_id` | entier | non | — | — |
| `ancien_agent_id` | entier | oui | — | — |
| `nouveau_agent_id` | entier | oui | — | — |
| `motif` | texte | oui | — | — |
| `date_transfert` | date | oui | `current_timestamp()` | — |

**Clés étrangères**

| Contrainte | Colonne | Référence | Suppression |
|---|---|---|---|
| `fk_transferts_ancien` | `ancien_agent_id` | `agents` | SET NULL |
| `fk_transferts_dossier` | `dossier_id` | `dossiers` | CASCADE |
| `fk_transferts_nouveau` | `nouveau_agent_id` | `agents` | SET NULL |

**Index** : `PRIMARY`.

### `traitements`

Ouverture et clôture d'un traitement.

*194 ligne(s) en base.*

| Colonne | Type | Null | Défaut | Commentaire |
|---|---|---|---|---|
| `id` | entier | non | — | — |
| `dossier_id` | entier | non | — | — |
| `agent_id` | entier | oui | — | — |
| `date_debut` | date | oui | `current_timestamp()` | — |
| `date_fin` | date | oui | — | — |
| `observation` | texte | oui | — | — |

**Clés étrangères**

| Contrainte | Colonne | Référence | Suppression |
|---|---|---|---|
| `fk_traitements_agent` | `agent_id` | `agents` | SET NULL |
| `fk_traitements_dossier` | `dossier_id` | `dossiers` | CASCADE |

**Index** : `PRIMARY`.

### `courriers`

Courriers entrants et sortants.

*0 ligne(s) en base.*

| Colonne | Type | Null | Défaut | Commentaire |
|---|---|---|---|---|
| `id` | entier | non | — | — |
| `numero` | texte | non | — | — |
| `type_id` | entier | oui | — | — |
| `sens` | enum('entrant','sortant') | non | — | — |
| `expediteur` | texte | oui | — | — |
| `destinataire` | texte | oui | — | — |
| `objet` | texte | non | — | — |
| `division_id` | entier | oui | — | — |
| `statut` | texte | oui | `RECU` | — |
| `document_id` | entier | oui | — | — |
| `dossier_id` | entier | oui | — | — |
| `created_by` | entier | oui | — | — |
| `created_at` | date | oui | `current_timestamp()` | — |

**Clés étrangères**

| Contrainte | Colonne | Référence | Suppression |
|---|---|---|---|
| `fk_courriers_division` | `division_id` | `divisions` | RESTRICT |
| `fk_courriers_document` | `document_id` | `documents` | SET NULL |
| `fk_courriers_dossier` | `dossier_id` | `dossiers` | SET NULL |
| `fk_courriers_type` | `type_id` | `types_courriers` | RESTRICT |
| `fk_courriers_user` | `created_by` | `users` | RESTRICT |

**Index** : `PRIMARY`, `numero`.

### `bordereaux`

Bordereaux de transmission d'un dossier à une division.

*3 ligne(s) en base.*

| Colonne | Type | Null | Défaut | Commentaire |
|---|---|---|---|---|
| `id` | entier | non | — | — |
| `reference` | texte | non | — | — |
| `division_id` | entier | non | — | — |
| `agent_id` | entier | oui | — | — |
| `date_transmission` | date | oui | `current_timestamp()` | — |
| `observation` | texte | oui | — | — |
| `statut` | enum('brouillon','emis','recu_par_division','archive') | oui | `BROUILLON` | — |
| `date_reception_division` | date | oui | — | — |
| `recu_par` | entier | oui | — | — |
| `created_at` | date | non | `current_timestamp()` | — |
| `updated_at` | date | non | `current_timestamp()` | — |

**Clés étrangères**

| Contrainte | Colonne | Référence | Suppression |
|---|---|---|---|
| `bordereaux_ibfk_1` | `division_id` | `divisions` | RESTRICT |
| `bordereaux_ibfk_2` | `agent_id` | `agents` | RESTRICT |
| `bordereaux_ibfk_3` | `recu_par` | `agents` | RESTRICT |

**Index** : `PRIMARY`, `reference`.

### `bordereaux_dossiers`

Dossiers contenus dans un bordereau.

*0 ligne(s) en base.*

| Colonne | Type | Null | Défaut | Commentaire |
|---|---|---|---|---|
| `bordereau_id` | entier | non | — | — |
| `dossier_id` | entier | non | — | — |
| `ordre` | entier | oui | `0` | — |

**Clés étrangères**

| Contrainte | Colonne | Référence | Suppression |
|---|---|---|---|
| `bordereaux_dossiers_ibfk_1` | `bordereau_id` | `bordereaux` | CASCADE |
| `bordereaux_dossiers_ibfk_2` | `dossier_id` | `dossiers` | CASCADE |

**Index** : `PRIMARY`.

### `mandatements`

*8 ligne(s) en base.*

| Colonne | Type | Null | Défaut | Commentaire |
|---|---|---|---|---|
| `id` | entier | non | — | — |
| `dossier_id` | entier | non | — | — |
| `montant_total` | entier | non | `0` | — |
| `etat` | enum('brouillon','a_ordonnancer','ordonnance','liquide') | non | `BROUILLON` | — |
| `ordonnancement_date` | date | oui | — | — |
| `ordonnateur_id` | entier | oui | — | — |
| `liquidation_date` | date | oui | — | — |
| `observation` | texte | oui | — | — |
| `created_at` | date | non | `current_timestamp()` | — |
| `updated_at` | date | non | `current_timestamp()` | — |

**Clés étrangères**

| Contrainte | Colonne | Référence | Suppression |
|---|---|---|---|
| `fk_mandatement_dossier` | `dossier_id` | `dossiers` | CASCADE |
| `fk_mandatement_ordonnateur` | `ordonnateur_id` | `agents` | SET NULL |

**Index** : `PRIMARY`, `uk_mandatement_dossier`.

## Autres tables

### `antennes`

*2 ligne(s) en base.*

| Colonne | Type | Null | Défaut | Commentaire |
|---|---|---|---|---|
| `id` | entier | non | — | — |
| `code` | texte | non | — | — |
| `libelle` | texte | non | — | — |
| `siege` | entier | non | `0` | — |
| `actif` | entier | non | `1` | — |
| `created_at` | date | non | `current_timestamp()` | — |

**Index** : `PRIMARY`, `uk_antenne_code`, `uk_antenne_siege_unique`.

### `cachets_mandatement`

*7 ligne(s) en base.*

| Colonne | Type | Null | Défaut | Commentaire |
|---|---|---|---|---|
| `id` | entier | non | — | — |
| `mandatement_id` | entier | non | — | — |
| `cache_par` | entier | non | — | — |
| `date_cachet` | date | non | — | — |
| `titre_ordonnateur` | texte | non | — | — |
| `nom_ordonnateur` | texte | non | — | — |
| `observations` | texte | oui | — | — |
| `created_at` | date | non | `current_timestamp()` | — |
| `updated_at` | date | non | `current_timestamp()` | — |

**Clés étrangères**

| Contrainte | Colonne | Référence | Suppression |
|---|---|---|---|
| `fk_cachet_mandatement` | `mandatement_id` | `mandatements` | CASCADE |
| `fk_cachet_user` | `cache_par` | `users` | RESTRICT |

**Index** : `PRIMARY`, `uk_cachet_mandatement`.

### `compteurs_numerotation`

*5 ligne(s) en base.*

| Colonne | Type | Null | Défaut | Commentaire |
|---|---|---|---|---|
| `cle` | texte | non | — | — |
| `valeur` | entier | non | `0` | — |
| `updated_at` | date | non | `current_timestamp()` | — |

**Index** : `PRIMARY`.

### `controles_decompte`

*0 ligne(s) en base.*

| Colonne | Type | Null | Défaut | Commentaire |
|---|---|---|---|---|
| `id` | entier | non | — | — |
| `dossier_id` | entier | non | — | — |
| `controleur_id` | entier | oui | — | — |
| `decision` | enum('approuve','retourne') | non | — | — |
| `calculs_verifies` | entier | non | `0` | — |
| `pieces_justificatives` | entier | non | `0` | — |
| `certificat_cessation` | entier | non | `0` | — |
| `observation` | texte | oui | — | — |
| `date_controle` | date | non | `current_timestamp()` | — |

**Clés étrangères**

| Contrainte | Colonne | Référence | Suppression |
|---|---|---|---|
| `fk_controle_agent` | `controleur_id` | `agents` | SET NULL |
| `fk_controle_dossier` | `dossier_id` | `dossiers` | CASCADE |

**Index** : `PRIMARY`.

### `correspondances`

*23 ligne(s) en base.*

| Colonne | Type | Null | Défaut | Commentaire |
|---|---|---|---|---|
| `id` | entier | non | — | — |
| `dossier_id` | entier | oui | — | — |
| `type` | enum('lettre_prescription','demande_dossiere_mere','opposition_pension_alimentaire','opposition_cession_volontaire','opposition_saisie_arret') | non | — | — |
| `reference` | texte | oui | — | — |
| `document_id` | entier | oui | — | — |
| `destinataire` | texte | non | — | — |
| `objet` | texte | non | — | — |
| `contenu` | texte | oui | — | — |
| `etat` | enum('brouillon','envoyee') | non | `BROUILLON` | — |
| `date_envoi` | date | oui | — | — |
| `created_by` | entier | oui | — | — |
| `created_at` | date | non | `current_timestamp()` | — |
| `etat_reponse` | texte | oui | — | — |
| `date_reponse` | date | oui | — | — |
| `reponse` | texte | oui | — | — |
| `date_transmission_central` | date | oui | — | — |
| `destinataire_central` | texte | oui | — | — |
| `reference_bordereau` | texte | oui | — | — |
| `etat_reception_central` | texte | oui | — | — |

**Clés étrangères**

| Contrainte | Colonne | Référence | Suppression |
|---|---|---|---|
| `fk_correspondance_auteur` | `created_by` | `users` | SET NULL |
| `fk_correspondance_dossier` | `dossier_id` | `dossiers` | CASCADE |

**Index** : `PRIMARY`.

### `decomptes_avance`

*0 ligne(s) en base.*

| Colonne | Type | Null | Défaut | Commentaire |
|---|---|---|---|---|
| `id` | entier | non | — | — |
| `dossier_id` | entier | non | — | — |
| `agent_id` | entier | oui | — | — |
| `salaire_mensuel` | entier | non | `0` | — |
| `indice` | entier | oui | — | — |
| `echelon` | smallint(5) unsigned | oui | — | — |
| `avance_demandee` | entier | non | `0` | — |
| `retenue_mensuelle` | entier | non | `0` | — |
| `duree_mois` | smallint(5) unsigned | non | `0` | — |
| `mois_rembourses` | smallint(5) unsigned | non | `0` | — |
| `net_a_payer` | entier | non | `0` | — |
| `reste_a_rembourser` | entier | non | `0` | — |
| `observation` | texte | oui | — | — |
| `date_calcul` | date | non | `current_timestamp()` | — |
| `updated_at` | date | non | `current_timestamp()` | — |

**Clés étrangères**

| Contrainte | Colonne | Référence | Suppression |
|---|---|---|---|
| `fk_decompte_agent` | `agent_id` | `agents` | SET NULL |
| `fk_decompte_dossier` | `dossier_id` | `dossiers` | CASCADE |

**Index** : `PRIMARY`, `uk_decompte_dossier`.

### `delegations`

*0 ligne(s) en base.*

| Colonne | Type | Null | Défaut | Commentaire |
|---|---|---|---|---|
| `id` | entier | non | — | — |
| `agent_id` | entier | non | — | — |
| `remplacant_id` | entier | non | — | — |
| `date_debut` | date | non | — | — |
| `date_fin` | date | non | — | — |
| `motif` | texte | oui | — | — |
| `created_by` | entier | oui | — | — |
| `created_at` | date | non | `current_timestamp()` | — |

**Clés étrangères**

| Contrainte | Colonne | Référence | Suppression |
|---|---|---|---|
| `fk_delegation_agent` | `agent_id` | `agents` | CASCADE |
| `fk_delegation_auteur` | `created_by` | `users` | SET NULL |
| `fk_delegation_remplacant` | `remplacant_id` | `agents` | CASCADE |

**Index** : `PRIMARY`.

### `districts`

*6 ligne(s) en base.*

| Colonne | Type | Null | Défaut | Commentaire |
|---|---|---|---|---|
| `id` | entier | non | — | — |
| `antenne_id` | entier | non | — | — |
| `code` | texte | non | — | — |
| `libelle` | texte | non | — | — |
| `actif` | entier | non | `1` | — |
| `created_at` | date | non | `current_timestamp()` | — |

**Clés étrangères**

| Contrainte | Colonne | Référence | Suppression |
|---|---|---|---|
| `fk_district_antenne` | `antenne_id` | `antennes` | RESTRICT |

**Index** : `PRIMARY`, `uk_district_code`.

### `donnees_operation`

*33 ligne(s) en base.*

| Colonne | Type | Null | Défaut | Commentaire |
|---|---|---|---|---|
| `id` | entier | non | — | — |
| `dossier_id` | entier | non | — | — |
| `sous_type_id` | entier | oui | — | — |
| `reference_externe` | texte | oui | — | — |
| `reference_dossier_mere` | texte | oui | — | — |
| `matricule` | texte | oui | — | — |
| `periode` | texte | oui | — | — |
| `montant` | nombre | oui | — | — |
| `source_montant` | texte | oui | — | — |
| `date_reference` | date | oui | — | — |
| `destinataire` | texte | oui | — | — |
| `date_transmission` | date | oui | — | — |
| `reference_transmission` | texte | oui | — | — |
| `etat_transmission` | texte | oui | — | — |
| `localisation` | texte | oui | — | — |
| `observation` | texte | oui | — | — |
| `controleur_id` | entier | oui | — | — |
| `date_controle` | date | oui | — | — |
| `observations_controle` | texte | oui | — | — |
| `decision_controle` | texte | oui | — | — |
| `valide_par` | entier | oui | — | — |
| `date_validation` | date | oui | — | — |
| `donnees` | texte | oui | — | — |
| `created_at` | date | non | `current_timestamp()` | — |
| `updated_at` | date | non | `current_timestamp()` | — |

**Clés étrangères**

| Contrainte | Colonne | Référence | Suppression |
|---|---|---|---|
| `fk_operation_controleur` | `controleur_id` | `users` | SET NULL |
| `fk_operation_dossier` | `dossier_id` | `dossiers` | CASCADE |
| `fk_operation_sous_type` | `sous_type_id` | `sous_types_dossiers` | SET NULL |
| `fk_operation_valideur` | `valide_par` | `users` | SET NULL |

**Index** : `PRIMARY`, `uk_operation_dossier`.

### `dossiers_districts`

*2 ligne(s) en base.*

| Colonne | Type | Null | Défaut | Commentaire |
|---|---|---|---|---|
| `id` | entier | non | — | — |
| `dossier_id` | entier | non | — | — |
| `district_id` | entier | non | — | — |
| `date_rattachement` | date | non | — | — |
| `courante` | entier | non | `1` | — |
| `origine` | texte | non | `SAISIE` | — |
| `created_at` | date | non | `current_timestamp()` | — |

**Clés étrangères**

| Contrainte | Colonne | Référence | Suppression |
|---|---|---|---|
| `fk_dossier_district_district` | `district_id` | `districts` | RESTRICT |
| `fk_dossier_district_dossier` | `dossier_id` | `dossiers` | CASCADE |

**Index** : `PRIMARY`, `uk_dossier_district_courante`.

### `emargements`

*16 ligne(s) en base.*

| Colonne | Type | Null | Défaut | Commentaire |
|---|---|---|---|---|
| `id` | entier | non | — | — |
| `etat_emargement_id` | entier | non | — | — |
| `beneficiaire_id` | entier | non | — | — |
| `signataire` | texte | oui | — | — |
| `signe_le` | date | oui | — | — |
| `observation` | texte | oui | — | — |
| `updated_at` | date | non | `current_timestamp()` | — |

**Clés étrangères**

| Contrainte | Colonne | Référence | Suppression |
|---|---|---|---|
| `fk_emargement_beneficiaire` | `beneficiaire_id` | `mandatement_beneficiaires` | CASCADE |
| `fk_emargement_etat` | `etat_emargement_id` | `etats_emargement` | CASCADE |

**Index** : `PRIMARY`, `uk_emargement_beneficiaire`.

### `etats_emargement`

*8 ligne(s) en base.*

| Colonne | Type | Null | Défaut | Commentaire |
|---|---|---|---|---|
| `id` | entier | non | — | — |
| `mandatement_id` | entier | non | — | — |
| `genere_par` | entier | oui | — | — |
| `genere_le` | date | oui | — | — |
| `created_at` | date | non | `current_timestamp()` | — |
| `updated_at` | date | non | `current_timestamp()` | — |

**Clés étrangères**

| Contrainte | Colonne | Référence | Suppression |
|---|---|---|---|
| `fk_emargement_genere_par` | `genere_par` | `users` | SET NULL |
| `fk_emargement_mandatement` | `mandatement_id` | `mandatements` | CASCADE |

**Index** : `PRIMARY`, `uk_emargement_mandatement`.

### `immatriculations`

*37 ligne(s) en base.*

| Colonne | Type | Null | Défaut | Commentaire |
|---|---|---|---|---|
| `id` | entier | non | — | — |
| `nom` | texte | non | — | — |
| `prenom` | texte | non | — | — |
| `cin` | texte | oui | — | — |
| `date_naissance` | date | oui | — | — |
| `corps` | texte | oui | — | — |
| `grade` | texte | oui | — | — |
| `indice` | entier | oui | — | — |
| `date_entree` | date | oui | — | — |
| `division_id` | entier | oui | — | — |
| `matricule` | texte | oui | — | — |
| `statut` | enum('en_attente','active','rejetee') | non | `EN_ATTENTE` | — |
| `observations` | texte | oui | — | — |
| `created_by` | entier | oui | — | — |
| `created_at` | date | non | `current_timestamp()` | — |
| `updated_at` | date | non | `current_timestamp()` | — |

**Clés étrangères**

| Contrainte | Colonne | Référence | Suppression |
|---|---|---|---|
| `fk_imma_auteur` | `created_by` | `users` | SET NULL |
| `fk_imma_division` | `division_id` | `divisions` | SET NULL |

**Index** : `PRIMARY`.

### `insertions_paiement`

*20 ligne(s) en base.*

| Colonne | Type | Null | Défaut | Commentaire |
|---|---|---|---|---|
| `id` | entier | non | — | — |
| `immatriculation_id` | entier | non | — | — |
| `matricule_augure` | texte | oui | — | — |
| `situation_familiale` | texte | oui | — | — |
| `adresse` | texte | oui | — | — |
| `telephone` | texte | oui | — | — |
| `date_naissance` | date | oui | — | — |
| `indice_base` | entier | oui | — | — |
| `salaire_base` | nombre | oui | — | — |
| `statut` | enum('a_inserer','insere','rejete') | non | `A_INSERER` | — |
| `observations` | texte | oui | — | — |
| `created_by` | entier | oui | — | — |
| `created_at` | date | non | `current_timestamp()` | — |
| `updated_at` | date | non | `current_timestamp()` | — |

**Clés étrangères**

| Contrainte | Colonne | Référence | Suppression |
|---|---|---|---|
| `fk_insertion_auteur` | `created_by` | `users` | SET NULL |
| `fk_insertion_imma` | `immatriculation_id` | `immatriculations` | CASCADE |

**Index** : `PRIMARY`.

### `liquidations_pension`

*0 ligne(s) en base.*

| Colonne | Type | Null | Défaut | Commentaire |
|---|---|---|---|---|
| `id` | entier | non | — | — |
| `dossier_id` | entier | non | — | — |
| `agent_id` | entier | oui | — | — |
| `annees_service` | smallint(5) unsigned | non | `0` | — |
| `indice_final` | entier | oui | — | — |
| `pension_brute` | entier | non | `0` | — |
| `retenues` | entier | non | `0` | — |
| `observation` | texte | oui | — | — |
| `date_calcul` | date | non | `current_timestamp()` | — |
| `updated_at` | date | non | `current_timestamp()` | — |

**Clés étrangères**

| Contrainte | Colonne | Référence | Suppression |
|---|---|---|---|
| `fk_liquidation_agent` | `agent_id` | `agents` | SET NULL |
| `fk_liquidation_dossier` | `dossier_id` | `dossiers` | CASCADE |

**Index** : `PRIMARY`, `uk_liquidation_dossier`.

### `mandatement_beneficiaires`

*16 ligne(s) en base.*

| Colonne | Type | Null | Défaut | Commentaire |
|---|---|---|---|---|
| `id` | entier | non | — | — |
| `mandatement_id` | entier | non | — | — |
| `nom` | texte | non | — | — |
| `prenom` | texte | oui | — | — |
| `lien` | texte | oui | — | — |
| `quote_part` | nombre | non | `0.00` | — |
| `montant` | nombre | non | `0.00` | — |
| `matricule` | texte | oui | — | — |

**Clés étrangères**

| Contrainte | Colonne | Référence | Suppression |
|---|---|---|---|
| `fk_beneficiaire_mandatement` | `mandatement_id` | `mandatements` | CASCADE |

**Index** : `PRIMARY`.

### `mandatement_pieces`

*0 ligne(s) en base.*

| Colonne | Type | Null | Défaut | Commentaire |
|---|---|---|---|---|
| `code` | texte | non | — | — |
| `libelle` | texte | non | — | — |
| `ordre` | smallint(5) unsigned | non | `0` | — |

**Index** : `PRIMARY`.

### `mandatement_pieces_etat`

*0 ligne(s) en base.*

| Colonne | Type | Null | Défaut | Commentaire |
|---|---|---|---|---|
| `mandatement_id` | entier | non | — | — |
| `piece_code` | texte | non | — | — |
| `imprimee` | entier | non | `0` | — |
| `date_impression` | date | oui | — | — |

**Clés étrangères**

| Contrainte | Colonne | Référence | Suppression |
|---|---|---|---|
| `fk_piece_etat_mandatement` | `mandatement_id` | `mandatements` | CASCADE |

**Index** : `PRIMARY`.

### `modes_paiement`

*21 ligne(s) en base.*

| Colonne | Type | Null | Défaut | Commentaire |
|---|---|---|---|---|
| `id` | entier | non | — | — |
| `immatriculation_id` | entier | non | — | — |
| `mode` | enum('virement','cheque','especes','mandat') | non | — | — |
| `banque` | texte | oui | — | — |
| `compte_bancaire` | texte | oui | — | — |
| `motif` | texte | non | — | — |
| `pieces_verifiees` | entier | non | `0` | — |
| `statut` | enum('en_attente','approuve','rejete') | non | `EN_ATTENTE` | — |
| `observations` | texte | oui | — | — |
| `created_by` | entier | oui | — | — |
| `created_at` | date | non | `current_timestamp()` | — |
| `updated_at` | date | non | `current_timestamp()` | — |

**Clés étrangères**

| Contrainte | Colonne | Référence | Suppression |
|---|---|---|---|
| `fk_mode_auteur` | `created_by` | `users` | SET NULL |
| `fk_mode_imma` | `immatriculation_id` | `immatriculations` | CASCADE |

**Index** : `PRIMARY`.

### `references_logiciel_secours`

*7 ligne(s) en base.*

| Colonne | Type | Null | Défaut | Commentaire |
|---|---|---|---|---|
| `id` | entier | non | — | — |
| `mandatement_id` | entier | non | — | — |
| `code` | texte | non | — | — |
| `libelle` | texte | non | — | — |
| `valeur` | texte | non | — | — |
| `reporte_par` | entier | oui | — | — |
| `reporte_le` | date | oui | — | — |

**Clés étrangères**

| Contrainte | Colonne | Référence | Suppression |
|---|---|---|---|
| `fk_ref_logiciel_mandatement` | `mandatement_id` | `mandatements` | CASCADE |
| `fk_ref_logiciel_user` | `reporte_par` | `users` | SET NULL |

**Index** : `PRIMARY`, `uk_reference_logiciel`.

### `referentiel_fonctionnalites`

*460 ligne(s) en base.*

| Colonne | Type | Null | Défaut | Commentaire |
|---|---|---|---|---|
| `id` | entier | non | — | — |
| `document` | texte | non | `HISTORIQUE` | — |
| `numero_source` | entier | non | — | — |
| `poste_code` | texte | non | — | — |
| `libelle` | texte | non | — | — |
| `detail` | texte | oui | — | — |
| `section_source` | texte | non | — | — |
| `nature` | enum('metier','institutionnel','structure','integration') | non | `METIER` | — |
| `permission_nom` | texte | oui | — | — |
| `etat` | enum('livree','partielle','inerte','non_construite','hors_plateforme') | non | `NON_CONSTRUITE` | — |
| `motif` | texte | oui | — | — |
| `created_at` | date | non | `current_timestamp()` | — |
| `updated_at` | date | non | `current_timestamp()` | — |

**Index** : `PRIMARY`, `uk_fonctionnalite_document_numero`.

### `referentiel_postes`

*18 ligne(s) en base.*

| Colonne | Type | Null | Défaut | Commentaire |
|---|---|---|---|---|
| `id` | entier | non | — | — |
| `code` | texte | non | — | — |
| `libelle` | texte | non | — | — |
| `role_nom` | texte | oui | — | — |
| `niveau` | entier | non | `3` | — |
| `actif` | entier | non | `1` | — |
| `created_at` | date | non | `current_timestamp()` | — |

**Index** : `PRIMARY`, `uk_poste_code`.

### `referentiel_service`

*19 ligne(s) en base.*

| Colonne | Type | Null | Défaut | Commentaire |
|---|---|---|---|---|
| `id` | entier | non | — | — |
| `cle` | texte | non | — | — |
| `libelle` | texte | non | — | — |
| `valeur` | texte | oui | — | — |
| `categorie` | texte | non | — | — |
| `ordre` | smallint(5) unsigned | non | `0` | — |

**Index** : `PRIMARY`, `uk_service_cle`.

### `reinitialisations_mot_de_passe`

*27 ligne(s) en base.*

| Colonne | Type | Null | Défaut | Commentaire |
|---|---|---|---|---|
| `id` | entier | non | — | — |
| `user_id` | entier | non | — | — |
| `identifiant_saisi` | texte | oui | — | — |
| `statut` | enum('en_attente','code_genere','utilise','annule','expire') | non | `EN_ATTENTE` | — |
| `empreinte` | texte | oui | — | — |
| `code_genere_par` | entier | oui | — | — |
| `code_genere_le` | date | oui | — | — |
| `expire_le` | date | oui | — | — |
| `tentatives` | entier | non | `0` | — |
| `utilise_le` | date | oui | — | — |
| `motif` | texte | oui | — | — |
| `ip_address` | texte | oui | — | — |
| `created_at` | date | non | `current_timestamp()` | — |
| `updated_at` | date | non | `current_timestamp()` | — |

**Clés étrangères**

| Contrainte | Colonne | Référence | Suppression |
|---|---|---|---|
| `fk_reinit_admin` | `code_genere_par` | `users` | SET NULL |
| `fk_reinit_user` | `user_id` | `users` | CASCADE |

**Index** : `PRIMARY`.

### `schema_migrations`

*48 ligne(s) en base.*

| Colonne | Type | Null | Défaut | Commentaire |
|---|---|---|---|---|
| `id` | entier | non | — | — |
| `version` | entier | non | — | — |
| `fichier` | texte | non | — | — |
| `sha256` | texte | non | — | — |
| `lignes` | entier | non | `0` | — |
| `applique_le` | date | non | `current_timestamp()` | — |

**Index** : `PRIMARY`, `uq_schema_migrations_fichier`.

### `schemas_operations`

*235 ligne(s) en base.*

| Colonne | Type | Null | Défaut | Commentaire |
|---|---|---|---|---|
| `id` | entier | non | — | — |
| `sous_type_id` | entier | non | — | — |
| `cle` | texte | non | — | — |
| `libelle` | texte | non | — | — |
| `type_champ` | texte | non | `texte` | — |
| `requis` | entier | non | `0` | — |
| `options` | texte | oui | — | — |
| `aide` | texte | oui | — | — |
| `ordre` | smallint(6) | non | `0` | — |
| `created_at` | date | non | `current_timestamp()` | — |

**Clés étrangères**

| Contrainte | Colonne | Référence | Suppression |
|---|---|---|---|
| `fk_schema_sous_type` | `sous_type_id` | `sous_types_dossiers` | CASCADE |

**Index** : `PRIMARY`, `uk_schema_champ`.

### `signalements_dossier`

*8 ligne(s) en base.*

| Colonne | Type | Null | Défaut | Commentaire |
|---|---|---|---|---|
| `id` | entier | non | — | — |
| `dossier_id` | entier | non | — | — |
| `division_id` | entier | oui | — | — |
| `signale_par` | entier | non | — | — |
| `type` | enum('blocage','interlocution','arbitrage') | non | `BLOCAGE` | — |
| `priorite` | enum('normale','haute','critique') | non | `NORMALE` | — |
| `motif` | texte | non | — | — |
| `statut` | enum('ouvert','en_cours','resolu','rejete') | non | `OUVERT` | — |
| `traite_par` | entier | oui | — | — |
| `resolution` | texte | oui | — | — |
| `date_prise_en_charge` | date | oui | — | — |
| `date_resolution` | date | oui | — | — |
| `created_at` | date | non | `current_timestamp()` | — |
| `updated_at` | date | non | `current_timestamp()` | — |

**Clés étrangères**

| Contrainte | Colonne | Référence | Suppression |
|---|---|---|---|
| `fk_signalement_auteur` | `signale_par` | `users` | CASCADE |
| `fk_signalement_division` | `division_id` | `divisions` | SET NULL |
| `fk_signalement_dossier` | `dossier_id` | `dossiers` | CASCADE |
| `fk_signalement_traiteur` | `traite_par` | `users` | SET NULL |

**Index** : `PRIMARY`.

### `signatures_ordonnateur`

*8 ligne(s) en base.*

| Colonne | Type | Null | Défaut | Commentaire |
|---|---|---|---|---|
| `id` | entier | non | — | — |
| `mandatement_id` | entier | non | — | — |
| `reference_signature` | texte | non | — | — |
| `signe_par` | entier | oui | — | — |
| `signe_le` | date | oui | — | — |
| `archive_le` | date | oui | — | — |
| `observations` | texte | oui | — | — |
| `created_at` | date | non | `current_timestamp()` | — |
| `updated_at` | date | non | `current_timestamp()` | — |

**Clés étrangères**

| Contrainte | Colonne | Référence | Suppression |
|---|---|---|---|
| `fk_signature_ord_mandatement` | `mandatement_id` | `mandatements` | CASCADE |
| `fk_signature_ord_user` | `signe_par` | `users` | SET NULL |

**Index** : `PRIMARY`, `uk_signature_ord_mandatement`, `uk_signature_ord_reference`.

### `validations`

*160 ligne(s) en base.*

| Colonne | Type | Null | Défaut | Commentaire |
|---|---|---|---|---|
| `id` | entier | non | — | — |
| `dossier_id` | entier | non | — | — |
| `valide_par` | entier | oui | — | — |
| `decision` | texte | oui | — | — |
| `commentaire` | texte | oui | — | — |
| `date_validation` | date | oui | `current_timestamp()` | — |

**Clés étrangères**

| Contrainte | Colonne | Référence | Suppression |
|---|---|---|---|
| `fk_validations_dossier` | `dossier_id` | `dossiers` | CASCADE |
| `fk_validations_user` | `valide_par` | `users` | RESTRICT |

**Index** : `PRIMARY`.

### `verifications`

*99 ligne(s) en base.*

| Colonne | Type | Null | Défaut | Commentaire |
|---|---|---|---|---|
| `id` | entier | non | — | — |
| `dossier_id` | entier | non | — | — |
| `agent_id` | entier | oui | — | — |
| `resultat` | texte | oui | — | — |
| `observation` | texte | oui | — | — |
| `date_verification` | date | oui | `current_timestamp()` | — |

**Clés étrangères**

| Contrainte | Colonne | Référence | Suppression |
|---|---|---|---|
| `fk_verifications_agent` | `agent_id` | `agents` | SET NULL |
| `fk_verifications_dossier` | `dossier_id` | `dossiers` | CASCADE |

**Index** : `PRIMARY`.

### `visas_controle_financier`

*8 ligne(s) en base.*

| Colonne | Type | Null | Défaut | Commentaire |
|---|---|---|---|---|
| `id` | entier | non | — | — |
| `dossier_id` | entier | non | — | — |
| `numero_visa` | texte | non | — | — |
| `signe_par` | texte | oui | — | — |
| `date_visa` | date | non | — | — |
| `commentaire` | texte | oui | — | — |
| `enregistre_par` | entier | non | — | — |
| `created_at` | date | non | `current_timestamp()` | — |

**Clés étrangères**

| Contrainte | Colonne | Référence | Suppression |
|---|---|---|---|
| `fk_visa_cf_dossier` | `dossier_id` | `dossiers` | CASCADE |
| `fk_visa_cf_user` | `enregistre_par` | `users` | RESTRICT |

**Index** : `PRIMARY`, `uk_visa_cf_dossier`, `uk_visa_cf_numero_unique`.

