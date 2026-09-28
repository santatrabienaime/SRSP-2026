USE srsp_db;

-- =============================================================================
-- Matrice RBAC — cahier des charges v2.0 §14 (matrice récapitulative)
-- Reconstruction complète (idempotente) : DELETE puis INSERT par rôle.
-- À exécuter après permissions_seed.sql.
-- =============================================================================

DELETE FROM role_permissions;

-- ADMIN : toutes les permissions (41)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p WHERE r.nom = 'ADMIN';

-- CHEF_SERVICE : supervision, workflow final, contrôle du décompte
-- (contrôle AVANT validation, donc lui revient), rapports, courriers.
-- Volontairement SANS traiter_dossier, affecter_dossier ni verifier_dossier :
-- le document lui retireexpressément ces travaux, qui sont ceux des agents et
-- des chefs de division. Il garde view_all_dossiers : il supervise les quatre
-- divisions sans agir à leur place. Voir migration 029.
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p
WHERE r.nom = 'CHEF_SERVICE' AND p.nom IN (
  'view_all_dossiers', 'valider_dossier', 'signer_dossier',
  'cloturer_dossier', 'archiver_dossier',
  'controler_decomptes',
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

-- CHEF DIVISION SOLDE : affectation, décision, contrôle interne des décomptes
-- de sa division, bons de caisse (le contrôle avant validation revient au
-- Chef de Service ; voir migration 028)
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
  'view_all_dossiers', 'affecter_dossier', 'verifier_dossier', 'valider_dossier',
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
  'view_all_dossiers', 'affecter_dossier', 'verifier_dossier', 'valider_dossier',
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
