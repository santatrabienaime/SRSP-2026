# UML — SRSP Fitovinany

Diagramme de classes (Mermaid) représentant l'ensemble des 61 entités du
schéma PostgreSQL `srsp_db` et leurs relations (clés étrangères). Chaque
entité porte ses attributs principaux ; les relations sont celles déclarées
dans `database/srsp_db.sql` (102 clés étrangères).

## Diagramme de classes

```mermaid
classDiagram
    %% =====================================================================
    %% REFERENTIEL
    %% =====================================================================
    namespace Referentiel {
        class roles {
            +id PK
            +nom
            +description
        }
        class permissions {
            +id PK
            +nom
            +description
        }
        class role_permissions {
            +role_id FK
            +permission_id FK
        }
        class users {
            +id PK
            +username
            +email
            +password_hash
            +role_id FK
            +actif
            +derniere_connexion
            +mot_de_passe_change_le
            +tentatives_echouees
            +verrouille_jusqua
        }
        class priorites {
            +id PK
            +code
            +libelle
            +niveau
        }
        class statuts_dossiers {
            +id PK
            +code
            +libelle
            +ordre
        }
        class types_dossiers {
            +id PK
            +code
            +libelle
            +actif
        }
        class sous_types_dossiers {
            +id PK
            +type_dossier_id FK
            +code
            +libelle
            +actif
            +ordre
        }
        class divisions {
            +id PK
            +code
            +nom
            +type_dossier_id FK
            +responsable_id FK
        }
        class antennes {
            +id PK
            +code
            +libelle
        }
        class districts {
            +id PK
            +code
            +libelle
            +antenne_id FK
        }
        class fonctions {
            +id PK
            +code
            +libelle
        }
        class types_courriers {
            +id PK
            +code
            +libelle
        }
        class types_documents {
            +id PK
            +code
            +libelle
        }
        class types_pieces {
            +id PK
            +code
            +libelle
            +type_dossier_id FK
            +sous_type_id FK
            +phase
            +obligatoire
            +actif
            +ordre
        }
        class compteurs_numerotation {
            +cle PK
            +valeur
        }
        class schemas_operations {
            +id PK
            +sous_type_id FK
            +code
            +libelle
        }
    }

    %% =====================================================================
    %% AGENTS & AFFECTATIONS
    %% =====================================================================
    namespace Agents {
        class agents {
            +id PK
            +user_id FK
            +nom
            +prenom
            +matricule
            +fonction_id FK
            +division_id FK
            +email
            +telephone
            +actif
        }
        class affectations {
            +id PK
            +agent_id FK
            +division_id FK
            +dossier_id FK
            +date_affectation
        }
        class delegations {
            +id PK
            +agent_id FK
            +remplacant_id FK
            +created_by FK
            +date_debut
            +date_fin
            +motif
        }
        class transferts {
            +id PK
            +dossier_id FK
            +ancien_agent_id FK
            +nouveau_agent_id FK
            +date_transfert
            +motif
        }
        class traitements {
            +id PK
            +dossier_id FK
            +agent_id FK
            +date_traitement
            +observation
        }
    }

    %% =====================================================================
    %% DOSSIERS
    %% =====================================================================
    namespace Dossiers {
        class dossiers {
            +id PK
            +numero
            +reference_visa
            +type_id FK
            +sous_type_id FK
            +objet
            +demandeur
            +matricule
            +date_reception
            +date_heure_reception
            +date_limite
            +division_id FK
            +priorite_id FK
            +statut_id FK
            +agent_responsable_id FK
            +observation
            +date_cloture
            +date_archivage
            +created_by FK
            +demandeur_nom
            +demandeur_prenom
            +demandeur_tel
            +demandeur_email
            +demandeur_adresse
            +origine_presentateur
            +comptable_presentateur
            +type_acte
            +annee_reference
            +verificateur_id FK
            +date_signature
            +signataire_id FK
            +reference_signature
            +exception_validation
            +exception_autorisee_par FK
            +date_exception
            +motif_complement
            +beneficiaire
            +organisme
        }
        class dossiers_districts {
            +id PK
            +dossier_id FK
            +district_id FK
        }
        class dossier_commentaires {
            +id PK
            +dossier_id FK
            +auteur_id FK
            +contenu
            +date_commentaire
        }
        class signalements_dossier {
            +id PK
            +dossier_id FK
            +division_id FK
            +signale_par FK
            +traite_par FK
            +type
            +priorite
            +motif
            +statut
            +date_signalement
            +date_traitement
            +resolution
        }
        class historique_actions {
            +id PK
            +dossier_id FK
            +user_id FK
            +action
            +ancienne_valeur
            +nouvelle_valeur
            +details
            +ip_address
            +date_action
        }
        class suppressions_dossiers {
            +id PK
            +dossier_id
            +numero
            +motif
            +supprime_par FK
            +supprime_par_nom
            +date_suppression
            +historique_json
            +nb_actions_historique
        }
    }

    %% =====================================================================
    %% PIECES & DOCUMENTS
    %% =====================================================================
    namespace PiecesDocuments {
        class depouillements {
            +id PK
            +dossier_id FK
            +agent_id FK
            +piece
            +presente
            +etat
            +observation
            +motif
            +date_controle
        }
        class documents {
            +id PK
            +dossier_id FK
            +courrier_id FK
            +type_id FK
            +piece_code
            +version
            +remplace
            +motif_remplacement
            +nom_fichier
            +chemin_stockage
            +taille
            +description
            +valide
            +upload_par FK
            +created_at
        }
        class types_documents {
            +id PK
            +code
            +libelle
        }
    }

    %% =====================================================================
    %% WORKFLOW / VERIFICATION / VALIDATION
    %% =====================================================================
    namespace Workflow {
        class verifications {
            +id PK
            +dossier_id FK
            +agent_id FK
            +resultat
            +observation
            +date_verification
        }
        class validations {
            +id PK
            +dossier_id FK
            +valide_par FK
            +decision
            +commentaire
            +date_validation
        }
    }

    %% =====================================================================
    %% COURRIERS & CORRESPONDANCES
    %% =====================================================================
    namespace Courriers {
        class courriers {
            +id PK
            +numero
            +sens
            +type_id FK
            +division_id FK
            +dossier_id FK
            +document_id FK
            +expediteur
            +destinataire
            +objet
            +created_by FK
            +created_at
        }
        class types_courriers {
            +id PK
            +code
            +libelle
        }
        class correspondances {
            +id PK
            +dossier_id FK
            +type
            +reference
            +piece_code
            +etat_reponse
            +date_envoi
            +date_reponse
            +created_by FK
        }
    }

    %% =====================================================================
    %% BORDEREAUX & TRANSMISSIONS
    %% =====================================================================
    namespace Bordereaux {
        class bordereaux {
            +id PK
            +reference
            +division_id FK
            +agent_id FK
            +recu_par FK
            +statut
            +date_transmission
            +observation
        }
        class bordereaux_dossiers {
            +bordereau_id FK
            +dossier_id FK
        }
    }

    %% =====================================================================
    %% OPERATIONS PAR DIVISION
    %% =====================================================================
    namespace Operations {
        class donnees_operation {
            +id PK
            +dossier_id FK
            +sous_type_id FK
            +reference_externe
            +reference_dossier_mere
            +periode
            +montant
            +source_montant
            +valide_par FK
            +date_validation
            +decision_controle
            +date_controle
            +controleur_id FK
            +destinataire
            +localisation
            +observation
        }
        class schemas_operations {
            +id PK
            +sous_type_id FK
            +code
            +libelle
        }
        class immatriculations {
            +id PK
            +dossier_id FK
            +type_demande
            +reference
            +division_id FK
            +created_at
        }
        class modes_paiement {
            +id PK
            +code
            +libelle
        }
        class insertions_paiement {
            +id PK
            +dossier_id FK
            +mode_paiement_id FK
            +reference
            +date_insertion
        }
    }

    %% =====================================================================
    %% VISA
    %% =====================================================================
    namespace Visa {
        class visas_controle_financier {
            +id PK
            +dossier_id FK
            +numero_visa
            +date_visa
            +enregistre_par FK
        }
    }

    %% =====================================================================
    %% SOLDE
    %% =====================================================================
    namespace Solde {
        class decomptes_avance {
            +id PK
            +dossier_id FK
            +agent_id FK
            +montant
            +date_decompte
        }
        class controles_decompte {
            +id PK
            +dossier_id FK
            +controleur_id FK
            +decision
            +date_controle
        }
    }

    %% =====================================================================
    %% PENSION
    %% =====================================================================
    namespace Pension {
        class liquidations_pension {
            +id PK
            +dossier_id FK
            +montant
            +date_liquidation
        }
        class mandatements {
            +id PK
            +dossier_id FK
            +numero
            +montant_total
            +etat
            +date_mandatement
        }
        class mandatement_beneficiaires {
            +id PK
            +mandatement_id FK
            +nom
            +prenom
            +montant
        }
        class mandatement_pieces {
            +id PK
            +mandatement_id FK
            +code
            +libelle
        }
        class mandatement_pieces_etat {
            +id PK
            +mandatement_piece_id FK
            +etat
            +date_controle
        }
        class cachets_mandatement {
            +id PK
            +mandatement_id FK
            +cache_par FK
            +date_cache
        }
        class signatures_ordonnateur {
            +id PK
            +mandatement_id FK
            +signe_par FK
            +date_signature
            +reference_signature
        }
        class emargements {
            +id PK
            +mandatement_id FK
            +beneficiaire_id FK
            +date_emargement
        }
        class etats_emargement {
            +id PK
            +mandatement_id FK
            +genere_par FK
            +date_generation
        }
    }

    %% =====================================================================
    %% SECOURS
    %% =====================================================================
    namespace Secours {
        class references_logiciel_secours {
            +id PK
            +mandatement_id FK
            +code
            +libelle
            +valeur
            +reporte_par FK
            +reporte_le
        }
    }

    %% =====================================================================
    %% ARCHIVES
    %% =====================================================================
    namespace Archives {
        class archives {
            +id PK
            +dossier_id FK
            +date_archivage
            +reference_archivage
            +emplacement_physique
            +localisation_numerique
            +archive_par FK
            +restaure
        }
    }

    %% =====================================================================
    %% NOTIFICATIONS & MESSAGES
    %% =====================================================================
    namespace Notifications {
        class notifications {
            +id PK
            +user_id FK
            +dossier_id FK
            +type
            +action
            +message
            +lu
            +created_at
        }
        class messages {
            +id PK
            +expediteur_id FK
            +destinataire_id FK
            +contenu
            +date_envoi
            +lu
        }
        class reinitialisations_mot_de_passe {
            +id PK
            +user_id FK
            +code
            +date_demande
            +date_expiration
            +utilise
        }
    }

    %% =====================================================================
    %% RELATIONS (cles etrangeres)
    %% =====================================================================
    roles "1" --> "*" role_permissions : contient
    permissions "1" --> "*" role_permissions : accorde
    users "1" --> "*" role_permissions : possede
    users "1" --> "0..1" agents : compte
    roles "1" --> "*" users : role
    agents "1" --> "0..1" divisions : responsable
    agents "1" --> "0..1" fonctions : fonction

    types_dossiers "1" --> "*" sous_types_dossiers : contient
    types_dossiers "1" --> "*" divisions : type par defaut
    divisions "1" --> "*" dossiers : accueille
    priorites "1" --> "*" dossiers : priorite
    statuts_dossiers "1" --> "*" dossiers : statut
    agents "1" --> "*" dossiers : responsable
    users "1" --> "*" dossiers : cree_par
    sous_types_dossiers "1" --> "*" dossiers : sous_type
    dossiers "1" --> "*" dossiers_districts : rattachement
    districts "1" --> "*" dossiers_districts : district
    antennes "1" --> "*" districts : antenne

    dossiers "1" --> "*" depouillements : controle
    agents "1" --> "*" depouillements : controleur
    dossiers "1" --> "*" documents : pieces jointes
    users "1" --> "*" documents : deposite_par
    types_documents "1" --> "*" documents : type
    courriers "1" --> "0..1" documents : piece liee
    types_pieces "1" --> "*" depouillements : code piece

    dossiers "1" --> "*" verifications : verification
    agents "1" --> "*" verifications : verificateur
    dossiers "1" --> "*" validations : validation
    users "1" --> "*" validations : valide_par
    dossiers "1" --> "*" traitements : traitement
    agents "1" --> "*" traitements : agent
    dossiers "1" --> "*" historique_actions : journal
    users "1" --> "*" historique_actions : auteur
    dossiers "1" --> "*" dossier_commentaires : commentaire
    users "1" --> "*" dossier_commentaires : auteur
    dossiers "1" --> "*" signalements_dossier : signalement
    users "1" --> "*" signalements_dossier : signale_par / traite_par
    divisions "1" --> "*" signalements_dossier : division
    users "1" --> "*" suppressions_dossiers : supprime_par

    dossiers "1" --> "*" affectations : affectation
    agents "1" --> "*" affectations : agent
    divisions "1" --> "*" affectations : division
    agents "1" --> "*" delegations : agent / remplacant
    users "1" --> "*" delegations : created_by
    dossiers "1" --> "*" transferts : transfert
    agents "1" --> "*" transferts : ancien / nouveau

    dossiers "1" --> "*" courriers : courrier
    divisions "1" --> "*" courriers : division
    types_courriers "1" --> "*" courriers : type
    users "1" --> "*" courriers : created_by
    dossiers "1" --> "*" correspondances : correspondance
    users "1" --> "*" correspondances : created_by

    divisions "1" --> "*" bordereaux : bordereau
    agents "1" --> "*" bordereaux : emetteur / recu_par
    bordereaux "1" --> "*" bordereaux_dossiers : ligne
    dossiers "1" --> "*" bordereaux_dossiers : dossier

    dossiers "1" --> "*" donnees_operation : operation
    sous_types_dossiers "1" --> "*" donnees_operation : sous_type
    users "1" --> "*" donnees_operation : valide_par / controleur_id
    schemas_operations "1" --> "*" sous_types_dossiers : schema
    dossiers "1" --> "*" immatriculations : immatriculation
    divisions "1" --> "*" immatriculations : division
    dossiers "1" --> "*" insertions_paiement : insertion
    modes_paiement "1" --> "*" insertions_paiement : mode

    dossiers "1" --> "*" visas_controle_financier : visa
    users "1" --> "*" visas_controle_financier : enregistre_par

    dossiers "1" --> "*" decomptes_avance : decompte
    agents "1" --> "*" decomptes_avance : agent
    dossiers "1" --> "*" controles_decompte : controle
    agents "1" --> "*" controles_decompte : controleur

    dossiers "1" --> "*" liquidations_pension : liquidation
    dossiers "1" --> "*" mandatements : mandatement
    mandatements "1" --> "*" mandatement_beneficiaires : beneficiaire
    mandatements "1" --> "*" mandatement_pieces : piece
    mandatement_pieces "1" --> "*" mandatement_pieces_etat : etat
    mandatements "1" --> "*" cachets_mandatement : cachet
    users "1" --> "*" cachets_mandatement : cache_par
    mandatements "1" --> "*" signatures_ordonnateur : signature
    users "1" --> "*" signatures_ordonnateur : signe_par
    mandatements "1" --> "*" emargements : emargement
    mandatement_beneficiaires "1" --> "*" emargements : beneficiaire
    mandatements "1" --> "*" etats_emargement : etat
    users "1" --> "*" etats_emargement : genere_par
    mandatements "1" --> "*" references_logiciel_secours : reference
    users "1" --> "*" references_logiciel_secours : reporte_par

    dossiers "1" --> "*" archives : archive
    users "1" --> "*" archives : archive_par

    users "1" --> "*" notifications : notification
    dossiers "1" --> "*" notifications : notification
    users "1" --> "*" messages : expediteur / destinataire
    users "1" --> "*" reinitialisations_mot_de_passe : reinitialisation

    users "1" --> "*" roles : role (via role_permissions)
    users "1" --> "*" permissions : permission (via role_permissions)
```

## Diagramme d'architecture (composants)

```mermaid
graph TB
    subgraph Frontend["Frontend (React + Vite)"]
        Pages["Pages (Dashboard, Dossiers, Rapports, Performance, Referentiel, ...)"]
        Components["Composants (DossierForm, DepouillementChecklist, DocumentsPanel, DossierActions, ...)"]
        Services["Services (dossierService, documentService, rapportService, performanceService, ...)"]
        Auth["AuthContext / useAuth"]
        UI["Composants UI (Card, Modal, Table, Badge, ...)"]
    end

    subgraph Backend["Backend (Node.js + Express)"]
        Routes["Routes (dossierRoutes, documentRoutes, rapportRoutes, performanceRoutes, ...)"]
        Controllers["Controllers (dossierController, documentController, rapportController, ...)"]
        ServicesB["Services (dossierService, documentService, rapportService, performanceService, scopeService, ...)"]
        Models["Models (dossierModel, documentModel, depouillementModel, ...)"]
        Middlewares["Middlewares (authMiddleware, rbacMiddleware, scopeDossiersMiddleware, uploadMiddleware, ...)"]
        Config["Config (db.js, env.js, multer.js, logger.js)"]
        Utils["Utils (constants.js, httpError.js, ...)"]
    end

    subgraph Database["PostgreSQL 18"]
        PG["srsp_db (61 tables, ICU ci, Africa/Nairobi)"]
        Datediff["datediff() function"]
        Migrations["Migrations (REJETEE, notifications NULLS NOT DISTINCT)"]
    end

    Pages --> Components
    Components --> Services
    Services --> Auth
    Auth --> API["API REST (port 5000)"]

    API --> Routes
    Routes --> Middlewares
    Middlewares --> Controllers
    Controllers --> ServicesB
    ServicesB --> Models
    Models --> Config
    Config --> PG
    PG --> Datediff
    PG --> Migrations

    Frontend -.->|"WebSocket (Socket.io)"| Backend
    Backend -.->|"Temps reel"| Frontend
```

## Diagramme de séquence — Marquage d'une pièce (Présente/Absente/Rejetée)

```mermaid
sequenceDiagram
    actor Agent as Agent / Chef de Division
    participant UI as DepouillementChecklist.jsx
    participant API as API REST (port 5000)
    participant DS as depouillementService.js
    participant DM as depouillementModel.js
    participant DB as PostgreSQL

    Agent->>UI: Clique sur "Présente" / "Absente" / "Rejetée"
    alt État non satisfait (Absente / Rejetée)
        UI->>UI: Ouvre modale de motif
        Agent->>UI: Saisit le motif et valide
    end
    UI->>API: POST /dossiers/:id/depouillement { piece, presente, etat, motif }
    API->>API: Vérifie permission (depouiller_pieces / verifier_dossier / valider_dossier)
    API->>API: Vérifie accès au dossier (scope)
    API->>DS: enregistrer(dossierId, data, userId)
    DS->>DS: Valide l'état (ETATS_PIECE_VALIDES)
    DS->>DS: Vérifie motif obligatoire si état dans ETATS_PIECE_A_MOTIVER
    DS->>DM: saveDepouillement(dossierId, piece, etat, motif)
    DM->>DB: INSERT/UPDATE depouillements
    DM->>DB: INSERT historique_actions
    DB-->>DM: OK
    DM-->>DS: pièce enregistrée
    DS->>DS: Recalcule le résumé (complet / incomplet)
    DS-->>API: { resume, depouillement }
    API-->>UI: 200 OK
    UI->>UI: Met à jour le badge et le résumé
    UI-->>Agent: Pièce marquée, résumé mis à jour
```

## Diagramme de séquence — Décision du Chef de Division (Valider / Correction)

```mermaid
sequenceDiagram
    actor Chef as Chef de Division
    participant UI as DossierActions.jsx
    participant API as API REST
    participant DS as dossierService.js
    participant DS2 as depouillementService.js
    participant DB as PostgreSQL

    Chef->>UI: Ouvre le panneau "Décision"
    UI->>UI: Charge le résumé du dépouillement (peutDecider)
    UI->>API: GET /dossiers/:id/depouillement
    API->>DS2: getChecklist(dossierId)
    DS2-->>API: { resume, depouillement }
    API-->>UI: Résumé chargé
    UI->>UI: Affiche les pièces non satisfaites (si incomplet)
    Chef->>UI: Sélectionne "Valider" ou "Demander une correction"
    alt Dossier incomplet et décision VALIDER
        alt Chef de Service (dérogation)
            UI->>UI: Affiche le champ motif de dérogation
            Chef->>UI: Saisit le motif et valide
        else Chef de Division (sans dérogation)
            UI->>UI: Affiche message : "Demander une correction"
            UI->>UI: Bouton désactivé (avec explication visible)
        end
    end
    UI->>API: POST /dossiers/:id/valider { decision, commentaire, motif_exception }
    API->>DS: valider(id, data, userId)
    DS->>DS: Vérifie statut SOUMIS_A_VERIFICATION
    DS->>DS: controlerCompletudeValidation(id, motifException, userId)
    alt Dossier incomplet sans dérogation
        DS-->>API: 422 — Demander une correction ou un complément
        API-->>UI: 422 avec message explicite
        UI-->>Chef: Affiche le message d'incomplétude
    else Dossier complet ou dérogation valide
        DS->>DS: workflowService.transition(id, VALIDE, ...)
        DS-->>API: 200 OK
        API-->>UI: Validation réussie
        UI-->>Chef: Dossier validé
    end
```

## Diagramme de séquence — Suppression d'une pièce jointe

```mermaid
sequenceDiagram
    actor User as Déposant / Chef de Division
    participant UI as DocumentsPanel.jsx
    participant API as API REST
    participant DocS as documentService.js
    participant DB as PostgreSQL
    participant FS as Système de fichiers

    User->>UI: Clique sur "Supprimer" (icône corbeille)
    UI->>UI: Affiche la confirmation
    User->>UI: Confirme la suppression
    UI->>API: DELETE /dossiers/:id/documents/:documentId
    API->>API: Vérifie permission (upload_document / manage_documents / verifier_dossier / valider_dossier / depouiller_pieces)
    API->>API: Vérifie accès au dossier (scope)
    API->>DocS: supprimer(dossierId, documentId, userId)
    DocS->>DB: SELECT document (findPourDossier)
    DocS->>DB: Vérifie statut dossier (pas ARCHIVE)
    DocS->>DB: Vérifie permissions (déposant ou manage_documents/verifier/valider/depouiller)
    alt Non autorisé
        DocS-->>API: 403 — Seul le déposant, un chef de division ou un administrateur
        API-->>UI: 403
    else Autorisé
        DocS->>FS: Supprime le fichier physique (unlinkSync)
        DocS->>DB: UPDATE documents SET remplace = NULL WHERE remplace = :id
        DocS->>DB: DELETE FROM documents WHERE id = :id
        DocS->>DB: INSERT historique_actions (SUPPRESSION_DOCUMENT)
        DB-->>DocS: OK
        DocS-->>API: { message: "Document supprimé." }
        API-->>UI: 200 OK
        UI->>UI: Recharge la liste des documents
        UI-->>User: Pièce supprimée
    end
```

## Diagramme d'états — Cycle de vie d'une pièce au dépouillement

```mermaid
stateDiagram-v2
    [*] --> NonControlee : Pièce requise par le type de dossier
    NonControlee --> PRESENTE : Marquer "Présente"
    NonControlee --> MANQUANTE : Marquer "Absente" + motif
    NonControlee --> REJETEE : Marquer "Rejetée" + motif
    NonControlee --> NON_APPLICABLE : Marquer "Non applicable"

    PRESENTE --> MANQUANTE : Changement d'état + motif
    PRESENTE --> REJETEE : Changement d'état + motif
    PRESENTE --> NON_APPLICABLE : Changement d'état

    MANQUANTE --> PRESENTE : Marquer "Présente"
    MANQUANTE --> REJETEE : Changement d'état + motif
    MANQUANTE --> NON_APPLICABLE : Changement d'état

    REJETEE --> PRESENTE : Marquer "Présente"
    REJETEE --> MANQUANTE : Changement d'état + motif
    REJETEE --> NON_APPLICABLE : Changement d'état

    NON_APPLICABLE --> PRESENTE : Marquer "Présente"
    NON_APPLICABLE --> MANQUANTE : Changement d'état + motif
    NON_APPLICABLE --> REJETEE : Changement d'état + motif

    state PRESENTE {
        [*] : Satisfait l'obligation
    }
    state MANQUANTE {
        [*] : Absente — motif obligatoire
    }
    state REJETEE {
        [*] : Rejetée — motif obligatoire
    }
    state NON_APPLICABLE {
        [*] : Satisfait l'obligation (pièce non requise)
    }
```

## Diagramme d'états — Cycle de vie d'un dossier

```mermaid
stateDiagram-v2
    [*] --> BROUILLON : Création en brouillon
    [*] --> RECU : Réception au guichet

    BROUILLON --> RECU : Publication

    RECU --> ENREGISTRE : Enregistrement
    ENREGISTRE --> ORIENTE : Orientation (automatique par type)
    ORIENTE --> AFFECTE : Affectation à un agent
    AFFECTE --> EN_TRAITEMENT : Prise en charge

    EN_TRAITEMENT --> EN_ATTENTE_COMPLEMENT : Demande de complément
    EN_ATTENTE_COMPLEMENT --> EN_TRAITEMENT : Complément reçu

    EN_TRAITEMENT --> SOUMIS_A_VERIFICATION : Soumission au Chef de Division

    SOUMIS_A_VERIFICATION --> VALIDE : Validation (si complet ou dérogation)
    SOUMIS_A_VERIFICATION --> CORRECTION_DEMANDEE : Demande de correction (motif)

    CORRECTION_DEMANDEE --> EN_TRAITEMENT : Retour en traitement

    VALIDE --> SIGNE : Signature (Chef de Service)
    SIGNE --> A_ARCHIVER : À archiver
    A_ARCHIVER --> ARCHIVE : Archivage (pièces d'archivage satisfaites)

    VALIDE --> CLOTURE : Clôture (Solde/Secours)
    CLOTURE --> ARCHIVE : Archivage

    ARCHIVE --> [*] : Archivé définitivement

    note right of SOUMIS_A_VERIFICATION
        Le dossier ne peut pas passer directement
        de "Correction demandée" à "Validé"
    end note

    note right of VALIDE
        Validation bloquée si dossier incomplet.
        Seul le Chef de Service peut déroger (motif).
    end note
```

## Diagramme de déploiement

```mermaid
graph TB
    subgraph Client["Client (Navigateur)"]
        Browser["Chrome / Firefox / Edge"]
        React["React 18 + Vite (port 5173)"]
        Browser --> React
    end

    subgraph Server["Serveur (Node.js)"]
        Express["Express 4 (port 5000)"]
        SocketIO["Socket.io (temps réel)"]
        Multer["Multer (uploads)"]
        PDFKit["PDFKit (rapports PDF)"]
        ExcelJS["ExcelJS (rapports Excel)"]
        JWT["JWT (authentification)"]
    end

    subgraph Database["PostgreSQL 18"]
        PG["srsp_db (61 tables)"]
        ICU["Collation ICU (ci)"]
        TZ["Timezone Africa/Nairobi"]
        PG --> ICU
        PG --> TZ
    end

    subgraph FileSystem["Système de fichiers"]
        Uploads["uploads/ (fichiers UUID)"]
        Logs["logs/ (api.out.log, api.err.log)"]
    end

    React -->|"HTTP REST (axios)"| Express
    React -->|"WebSocket (Socket.io)"| SocketIO
    Express --> SocketIO
    Express --> Multer
    Express --> PDFKit
    Express --> ExcelJS
    Express --> JWT
    Multer --> Uploads
    Express --> PG
    PG --> Datediff["datediff() function"]
```