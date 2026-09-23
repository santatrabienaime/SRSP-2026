USE srsp_db;

-- =============================================================================
-- Renommage des anciennes permissions (v1, notation pointée) vers les noms
-- canoniques du cahier des charges v2.0 (§Permissions / §14).
-- Idempotent : si les anciens noms n'existent pas, les UPDATE ne font rien.
-- =============================================================================
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

-- =============================================================================
-- Catalogue complet : 41 permissions du cahier des charges v2.0
-- =============================================================================
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
