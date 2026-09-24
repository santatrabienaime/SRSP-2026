-- =============================================
-- SEEDS SRSP FITOVINANY (assemblés)
-- Ordre : permissions, rôles, statuts, types,
-- priorités, divisions, fonctions, courriers,
-- documents, matrice RBAC
-- =============================================

-- >>> seeds/permissions_seed.sql (permissions — cahier v2.0, 41 permissions)
USE srsp_db;

-- Renommage des anciennes permissions (v1) vers les noms canoniques v2.0
UPDATE permissions SET nom = 'create_dossier',           description = 'Créer un dossier'                WHERE nom = 'dossier.creer';
UPDATE permissions SET nom = 'edit_dossier',             description = 'Modifier un dossier'             WHERE nom = 'dossier.modifier';
UPDATE permissions SET nom = 'delete_dossier',           description = 'Supprimer un dossier'            WHERE nom = 'dossier.supprimer';
UPDATE permissions SET nom = 'affecter_dossier',         description = 'Affecter un dossier à un agent'   WHERE nom = 'dossier.affecter';
UPDATE permissions SET nom = 'traiter_dossier',          description = 'Traiter un dossier'               WHERE nom = 'dossier.traiter';
UPDATE permissions SET nom = 'verifier_dossier',         description = 'Vérifier / décider d''un dossier soumis' WHERE nom = 'dossier.verifier';
UPDATE permissions SET nom = 'valider_dossier',          description = 'Valider un dossier'               WHERE nom = 'dossier.valider';
UPDATE permissions SET nom = 'cloturer_dossier',         description = 'Clôturer un dossier signé'        WHERE nom = 'dossier.cloturer';
UPDATE permissions SET nom = 'archiver_dossier',         description = 'Archiver un dossier clôturé'      WHERE nom = 'dossier.archiver';
UPDATE permissions SET nom = 'manage_users',             description = 'Gérer les utilisateurs'           WHERE nom = 'user.gerer';
UPDATE permissions SET nom = 'manage_roles',             description = 'Gérer les rôles et permissions'   WHERE nom = 'role.gerer';
UPDATE permissions SET nom = 'manage_divisions',         description = 'Gérer les divisions'              WHERE nom = 'division.gerer';
UPDATE permissions SET nom = 'manage_personnel',         description = 'Gérer les agents et le personnel' WHERE nom = 'agent.gerer';
UPDATE permissions SET nom = 'manage_courriers',         description = 'Gérer les courriers'              WHERE nom = 'courrier.gerer';

INSERT INTO permissions (nom, description) VALUES
-- Dossiers & workflow
('create_dossier', 'Créer un dossier'),
('edit_dossier', 'Modifier un dossier'),
('delete_dossier', 'Supprimer un dossier'),
('orienter_dossier', 'Orienter un dossier vers une division'),
('affecter_dossier', 'Affecter un dossier à un agent'),
('traiter_dossier', 'Traiter un dossier'),
('soumettre_verification', 'Soumettre un dossier à vérification (agent)'),
('verifier_dossier', 'Vérifier / décider d''un dossier soumis'),
('valider_dossier', 'Valider un dossier'),
('signer_dossier', 'Signer un dossier validé'),
('cloturer_dossier', 'Clôturer un dossier signé'),
('archiver_dossier', 'Archiver un dossier clôturé'),
('view_all_dossiers', 'Consulter tous les dossiers'),
('view_assigned_dossiers', 'Consulter ses dossiers affectés'),
-- Administration & sécurité
('manage_users', 'Gérer les utilisateurs'),
('manage_roles', 'Gérer les rôles et permissions'),
('manage_divisions', 'Gérer les divisions'),
('manage_personnel', 'Gérer les agents et le personnel'),
('view_audit', 'Consulter le journal d''audit'),
('system_config', 'Configurer le système'),
-- Courriers & documents
('manage_courriers', 'Gérer les courriers'),
('manage_documents', 'Gérer les documents comptables'),
('upload_document', 'Téléverser des documents'),
-- Statistiques & rapports
('view_stats', 'Consulter les statistiques'),
('export_data', 'Exporter les données (PDF/Excel)'),
('consolidate_reports', 'Consolider les rapports d''activité'),
-- Division Solde
('controler_decomptes', 'Contrôler les décomptes'),
('approuver_bons', 'Approuver les bons de caisse'),
('calculer_avances', 'Calculer les décomptes d''avance'),
-- Division Pension
('gerer_correspondances', 'Gérer les correspondances de la division'),
('suivre_oppositions', 'Suivre les oppositions'),
('liquider_pension', 'Liquider les pensions'),
('gerer_dossiers_meres', 'Gérer les dossiers mères'),
-- Division Secours
('preparer_mandatement', 'Préparer le mandatement'),
('gerer_ordonnancement', 'Gérer l''ordonnancement'),
('suivre_signature', 'Suivre la signature des pièces'),
('depouiller_pieces', 'Dépouiller les pièces'),
('archiver_pieces', 'Archiver les pièces justificatives'),
-- Coordonnatrice
('gerer_immatriculations', 'Gérer les immatriculations'),
('gerer_augure', 'Gérer les insertions Augure'),
('gerer_paiements', 'Gérer les changements de mode de paiement')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- >>> seeds/roles_seed.sql (rôles)
USE srsp_db;

INSERT INTO roles (nom, description) VALUES
('ADMIN', 'Administrateur système du SRSP'),
('CHEF_SERVICE', 'Chef de Service SRSP – supervision, validation et signature finale'),
('CHEF_BAAF', 'Chef BAAF – documents comptables, personnel, rapports, secrétariat'),
('COORDINATRICE', 'Coordonnatrice – immatriculation, insertions Augure, changements de paiement'),
('SECRETAIRE', 'Secrétaire – réception, enregistrement, distribution et chronologie'),
('CHEF_DIVISION_VISA', 'Chef Division Visa – supervision, vérification et rapports Visa'),
('VERIFICATEUR_VISA', 'Vérificateur de la Division Visa – exploitation, vérification, archivage'),
('CHEF_DIVISION_SOLDE', 'Chef Division Solde – supervision du mandatement, contrôles, bons de caisse'),
('VERIFICATEUR_SOLDE', 'Vérificateur de la Division Solde – exploitation, fiches de contrôle, mandatement'),
('CHEF_DIVISION_PENSION', 'Chef Division Pension – supervision de la liquidation, vérification'),
('LIQUIDATEUR_PENSION', 'Liquidateur de la Division Pension – liquidation, secours, dossiers mères, certificats'),
('CHEF_DIVISION_SECOURS', 'Chef Division Secours – réception, préparation, mandatement, ordonnancement'),
('CHARGE_SECOURS', 'Chargé de la Division Secours – traitement, dépouillement, archivage des pièces')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- >>> seeds/statuts_seed.sql (statuts)
USE srsp_db;

INSERT INTO statuts_dossiers (code, libelle, ordre) VALUES
('RECU', 'Reçu', 1),
('ENREGISTRE', 'Enregistré', 2),
('ORIENTE', 'Orienté', 3),
('AFFECTE', 'Affecté', 4),
('EN_TRAITEMENT', 'En traitement', 5),
('SOUMIS_A_VERIFICATION', 'Soumis à vérification', 6),
('CORRECTION_DEMANDEE', 'Correction demandée', 7),
('VALIDE', 'Validé', 8),
('SIGNE', 'Signé', 9),
('CLOTURE', 'Clôturé', 10),
('ARCHIVE', 'Archivé', 11)
ON DUPLICATE KEY UPDATE libelle = VALUES(libelle), ordre = VALUES(ordre);

-- >>> seeds/types_dossiers_seed.sql (types de dossiers)
USE srsp_db;

INSERT INTO types_dossiers (code, libelle, description, actif) VALUES
('VISA', 'Division Visa', 'Dossiers soumis pour visa et exploitation', TRUE),
('SOLDE', 'Division Solde', 'Dossiers de mandatement et avance de solde', TRUE),
('PENSION', 'Division Pension', 'Dossiers de liquidation de pension et secours au décès', TRUE),
('SECOURS', 'Division Secours', 'Dossiers de secours de décès', TRUE)
ON DUPLICATE KEY UPDATE libelle = VALUES(libelle), description = VALUES(description), actif = VALUES(actif);

-- >>> seeds/priorites_seed.sql (priorités)
USE srsp_db;

INSERT INTO priorites (id, libelle, niveau) VALUES
(1, 'URGENTE', 4),
(2, 'HAUTE', 3),
(3, 'NORMALE', 2),
(4, 'BASSE', 1)
ON DUPLICATE KEY UPDATE libelle = VALUES(libelle), niveau = VALUES(niveau);

-- >>> seeds/divisions_seed.sql (divisions)
USE srsp_db;

INSERT INTO divisions (code, nom) VALUES
('VISAS', 'Division Visas'),
('SOLDE', 'Division Solde'),
('PENSIONS', 'Division Pensions'),
('SECOURS', 'Division Secours')
ON DUPLICATE KEY UPDATE nom = VALUES(nom);

-- >>> seeds/fonctions_seed.sql (fonctions)
USE srsp_db;

INSERT INTO fonctions (id, libelle, description) VALUES
(1, 'Chef de Service', 'Supervision générale du SRSP'),
(2, 'Chef BAAF', 'Gestion comptable et administrative'),
(3, 'Coordonnatrice', 'Immatriculation et suivi des insertions'),
(4, 'Secrétaire', 'Réception, enregistrement et distribution'),
(5, 'Chef de Division', 'Supervision d''une division'),
(6, 'Vérificateur', 'Exploitation et vérification des dossiers'),
(7, 'Liquidateur', 'Liquidation des pensions'),
(8, 'Chargé de Secours', 'Traitement des dossiers de secours')
ON DUPLICATE KEY UPDATE libelle = VALUES(libelle), description = VALUES(description);

-- >>> seeds/types_courriers_seed.sql (types courriers)
USE srsp_db;

INSERT INTO types_courriers (id, libelle) VALUES
(1, 'DEMANDE'),
(2, 'INFORMATION'),
(3, 'NOTIFICATION'),
(4, 'RAPPORT'),
(5, 'CIRCULAIRE'),
(6, 'DECISION')
ON DUPLICATE KEY UPDATE libelle = VALUES(libelle);

-- >>> seeds/types_documents_seed.sql (types documents)
USE srsp_db;

INSERT INTO types_documents (id, libelle, extensions_autorisees, taille_max) VALUES
(1, 'PIECE_IDENTITE', 'pdf,jpg,jpeg,png', 5242880),
(2, 'ACTE_DECES', 'pdf,jpg,jpeg,png', 5242880),
(3, 'CERTIFICAT', 'pdf,jpg,jpeg,png', 5242880),
(4, 'RAPPORT', 'pdf,docx,doc', 5242880),
(5, 'DECOMPTE', 'xlsx,xls,pdf', 5242880),
(6, 'BON_CAISSE', 'pdf,xlsx', 5242880),
(7, 'AUTRE', 'pdf,docx,xlsx,jpg,jpeg,png', 5242880)
ON DUPLICATE KEY UPDATE extensions_autorisees = VALUES(extensions_autorisees), taille_max = VALUES(taille_max);

-- >>> seeds/role_permissions_seed.sql (matrice RBAC — cahier v2.0 §14)
USE srsp_db;

DELETE FROM role_permissions;

-- ADMIN : toutes les permissions (41)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p WHERE r.nom = 'ADMIN';

-- CHEF_SERVICE : supervision, workflow complet final, rapports, courriers
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p
WHERE r.nom = 'CHEF_SERVICE' AND p.nom IN (
  'view_all_dossiers', 'affecter_dossier', 'traiter_dossier', 'verifier_dossier',
  'valider_dossier', 'signer_dossier', 'cloturer_dossier', 'archiver_dossier',
  'manage_courriers', 'upload_document', 'view_stats', 'export_data'
);

-- CHEF_BAAF : documents comptables, personnel, rapports, courriers
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p
WHERE r.nom = 'CHEF_BAAF' AND p.nom IN (
  'view_all_dossiers', 'manage_documents', 'manage_personnel',
  'consolidate_reports', 'upload_document', 'manage_courriers'
);

-- COORDINATRICE : immatriculations, insertions Augure, changements de paiement
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p
WHERE r.nom = 'COORDINATRICE' AND p.nom IN (
  'view_all_dossiers', 'edit_dossier', 'view_stats', 'upload_document',
  'gerer_immatriculations', 'gerer_augure', 'gerer_paiements'
);

-- SECRETAIRE : réception, création, orientation, courriers
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p
WHERE r.nom = 'SECRETAIRE' AND p.nom IN (
  'create_dossier', 'edit_dossier', 'orienter_dossier',
  'view_all_dossiers', 'manage_courriers', 'upload_document'
);

-- CHEF DIVISION VISA : affectation, vérification/décision, rapports
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p
WHERE r.nom = 'CHEF_DIVISION_VISA' AND p.nom IN (
  'view_all_dossiers', 'affecter_dossier', 'verifier_dossier',
  'valider_dossier', 'view_stats', 'upload_document'
);

-- VÉRIFICATEUR VISA : traitement, soumission à vérification
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p
WHERE r.nom = 'VERIFICATEUR_VISA' AND p.nom IN (
  'view_assigned_dossiers', 'traiter_dossier',
  'soumettre_verification', 'upload_document'
);

-- CHEF DIVISION SOLDE : affectation, décision, décomptes, bons de caisse
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p
WHERE r.nom = 'CHEF_DIVISION_SOLDE' AND p.nom IN (
  'view_all_dossiers', 'affecter_dossier', 'verifier_dossier', 'valider_dossier',
  'controler_decomptes', 'approuver_bons', 'view_stats', 'upload_document'
);

-- VÉRIFICATEUR SOLDE : traitement, avances
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p
WHERE r.nom = 'VERIFICATEUR_SOLDE' AND p.nom IN (
  'view_assigned_dossiers', 'traiter_dossier',
  'soumettre_verification', 'calculer_avances', 'upload_document'
);

-- CHEF DIVISION PENSION : affectation, décision, correspondances, oppositions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p
WHERE r.nom = 'CHEF_DIVISION_PENSION' AND p.nom IN (
  'view_all_dossiers', 'affecter_dossier', 'verifier_dossier',
  'gerer_correspondances', 'suivre_oppositions', 'view_stats', 'upload_document'
);

-- LIQUIDATEUR PENSION : traitement, liquidation, secours, dossiers mères
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p
WHERE r.nom = 'LIQUIDATEUR_PENSION' AND p.nom IN (
  'view_assigned_dossiers', 'traiter_dossier',
  'soumettre_verification', 'liquider_pension', 'gerer_dossiers_meres', 'upload_document'
);

-- CHEF DIVISION SECOURS : affectation, mandatement, ordonnancement, émargement
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p
WHERE r.nom = 'CHEF_DIVISION_SECOURS' AND p.nom IN (
  'view_all_dossiers', 'affecter_dossier', 'verifier_dossier',
  'preparer_mandatement', 'gerer_ordonnancement', 'suivre_signature',
  'view_stats', 'upload_document'
);

-- CHARGÉ DE SECOURS : traitement, dépouillement, archivage des pièces
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p
WHERE r.nom = 'CHARGE_SECOURS' AND p.nom IN (
  'view_assigned_dossiers', 'traiter_dossier',
  'soumettre_verification', 'depouiller_pieces', 'archiver_pieces', 'upload_document'
);
