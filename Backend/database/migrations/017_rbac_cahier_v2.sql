-- =============================================================================
-- Migration 017 — Alignement RBAC sur le cahier des charges v2.0 (§14)
--
-- 1. Renomme les anciennes permissions (v1, notation pointée) vers les noms
--    canoniques du cahier des charges (41 permissions).
-- 2. Reconstruit intégralement la matrice rôle → permission (§14.1).
--
-- Idempotent : relancer ne change rien une fois appliqué.
-- Exécuter les fichiers suivants (équivalent) :
--   database/seeds/permissions_seed.sql
--   database/seeds/role_permissions_seed.sql
-- =============================================================================

USE srsp_db;

-- 1. Renommage des anciennes permissions (v1) vers les noms canoniques v2.0
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
('manage_users', 'Gérer les utilisateurs'),
('manage_roles', 'Gérer les rôles et permissions'),
('manage_divisions', 'Gérer les divisions'),
('manage_personnel', 'Gérer les agents et le personnel'),
('view_audit', 'Consulter le journal d''audit'),
('system_config', 'Configurer le système'),
('manage_courriers', 'Gérer les courriers'),
('manage_documents', 'Gérer les documents comptables'),
('upload_document', 'Téléverser des documents'),
('view_stats', 'Consulter les statistiques'),
('export_data', 'Exporter les données (PDF/Excel)'),
('consolidate_reports', 'Consolider les rapports d''activité'),
('controler_decomptes', 'Contrôler les décomptes'),
('approuver_bons', 'Approuver les bons de caisse'),
('calculer_avances', 'Calculer les décomptes d''avance'),
('gerer_correspondances', 'Gérer les correspondances de la division'),
('suivre_oppositions', 'Suivre les oppositions'),
('liquider_pension', 'Liquider les pensions'),
('gerer_dossiers_meres', 'Gérer les dossiers mères'),
('preparer_mandatement', 'Préparer le mandatement'),
('gerer_ordonnancement', 'Gérer l''ordonnancement'),
('suivre_signature', 'Suivre la signature des pièces'),
('depouiller_pieces', 'Dépouiller les pièces'),
('archiver_pieces', 'Archiver les pièces justificatives'),
('gerer_immatriculations', 'Gérer les immatriculations'),
('gerer_augure', 'Gérer les insertions Augure'),
('gerer_paiements', 'Gérer les changements de mode de paiement')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- 2. Reconstruction de la matrice rôle → permission (voir role_permissions_seed.sql)
DELETE FROM role_permissions;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p WHERE r.nom = 'ADMIN';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p
WHERE r.nom = 'CHEF_SERVICE' AND p.nom IN (
  'view_all_dossiers', 'affecter_dossier', 'traiter_dossier', 'verifier_dossier',
  'valider_dossier', 'signer_dossier', 'cloturer_dossier', 'archiver_dossier',
  'manage_courriers', 'upload_document', 'view_stats', 'export_data'
);

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p
WHERE r.nom = 'CHEF_BAAF' AND p.nom IN (
  'view_all_dossiers', 'manage_documents', 'manage_personnel',
  'consolidate_reports', 'upload_document', 'manage_courriers'
);

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p
WHERE r.nom = 'COORDINATRICE' AND p.nom IN (
  'view_all_dossiers', 'edit_dossier', 'view_stats', 'upload_document',
  'gerer_immatriculations', 'gerer_augure', 'gerer_paiements'
);

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p
WHERE r.nom = 'SECRETAIRE' AND p.nom IN (
  'create_dossier', 'edit_dossier', 'orienter_dossier',
  'view_all_dossiers', 'manage_courriers', 'upload_document'
);

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p
WHERE r.nom = 'CHEF_DIVISION_VISA' AND p.nom IN (
  'view_all_dossiers', 'affecter_dossier', 'verifier_dossier',
  'valider_dossier', 'view_stats', 'upload_document'
);

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p
WHERE r.nom = 'VERIFICATEUR_VISA' AND p.nom IN (
  'view_all_dossiers', 'view_assigned_dossiers', 'traiter_dossier',
  'soumettre_verification', 'upload_document'
);

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p
WHERE r.nom = 'CHEF_DIVISION_SOLDE' AND p.nom IN (
  'view_all_dossiers', 'affecter_dossier', 'verifier_dossier', 'valider_dossier',
  'controler_decomptes', 'approuver_bons', 'view_stats', 'upload_document'
);

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p
WHERE r.nom = 'VERIFICATEUR_SOLDE' AND p.nom IN (
  'view_all_dossiers', 'view_assigned_dossiers', 'traiter_dossier',
  'soumettre_verification', 'calculer_avances', 'upload_document'
);

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p
WHERE r.nom = 'CHEF_DIVISION_PENSION' AND p.nom IN (
  'view_all_dossiers', 'affecter_dossier', 'verifier_dossier',
  'gerer_correspondances', 'suivre_oppositions', 'view_stats', 'upload_document'
);

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p
WHERE r.nom = 'LIQUIDATEUR_PENSION' AND p.nom IN (
  'view_all_dossiers', 'view_assigned_dossiers', 'traiter_dossier',
  'soumettre_verification', 'liquider_pension', 'gerer_dossiers_meres', 'upload_document'
);

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p
WHERE r.nom = 'CHEF_DIVISION_SECOURS' AND p.nom IN (
  'view_all_dossiers', 'affecter_dossier', 'verifier_dossier',
  'preparer_mandatement', 'gerer_ordonnancement', 'suivre_signature',
  'view_stats', 'upload_document'
);

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p
WHERE r.nom = 'CHARGE_SECOURS' AND p.nom IN (
  'view_all_dossiers', 'view_assigned_dossiers', 'traiter_dossier',
  'soumettre_verification', 'depouiller_pieces', 'archiver_pieces', 'upload_document'
);
