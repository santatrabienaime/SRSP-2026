-- =============================================
-- SEEDS SRSP FITOVINANY (assemblés)
-- Ordre : permissions, rôles, statuts, types,
-- priorités, divisions, fonctions, courriers,
-- documents, matrice RBAC
-- =============================================

-- >>> seeds/permissions_seed.sql
USE srsp_db;

INSERT INTO permissions (nom, description) VALUES
('dossier.creer', 'Créer un dossier'),
('dossier.modifier', 'Modifier un dossier'),
('dossier.supprimer', 'Supprimer un dossier'),
('dossier.affecter', 'Affecter un dossier'),
('dossier.traiter', 'Traiter un dossier'),
('dossier.verifier', 'Vérifier un dossier'),
('dossier.valider', 'Valider un dossier'),
('dossier.cloturer', 'Clôturer un dossier'),
('dossier.archiver', 'Archiver un dossier'),
('user.gerer', 'Gérer les utilisateurs'),
('role.gerer', 'Gérer les rôles et permissions'),
('division.gerer', 'Gérer les divisions'),
('agent.gerer', 'Gérer les agents'),
('courrier.gerer', 'Gérer les courriers')
ON DUPLICATE KEY UPDATE description = VALUES(description);
-- >>> seeds/roles_seed.sql
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
-- >>> seeds/statuts_seed.sql
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
-- >>> seeds/types_dossiers_seed.sql
USE srsp_db;

INSERT INTO types_dossiers (code, libelle, description, actif) VALUES
('VISA', 'Division Visa', 'Dossiers soumis pour visa et exploitation', TRUE),
('SOLDE', 'Division Solde', 'Dossiers de mandatement et avance de solde', TRUE),
('PENSION', 'Division Pension', 'Dossiers de liquidation de pension et secours au décès', TRUE),
('SECOURS', 'Division Secours', 'Dossiers de secours de décès', TRUE)
ON DUPLICATE KEY UPDATE libelle = VALUES(libelle), description = VALUES(description), actif = VALUES(actif);
-- >>> seeds/priorites_seed.sql
USE srsp_db;

INSERT INTO priorites (libelle, niveau) VALUES
('URGENTE', 4),
('HAUTE', 3),
('NORMALE', 2),
('BASSE', 1)
ON DUPLICATE KEY UPDATE niveau = VALUES(niveau);
-- >>> seeds/divisions_seed.sql
USE srsp_db;

INSERT INTO divisions (code, nom) VALUES
('VISAS', 'Division Visas'),
('SOLDE', 'Division Solde'),
('PENSIONS', 'Division Pensions'),
('SECOURS', 'Division Secours')
ON DUPLICATE KEY UPDATE nom = VALUES(nom);
-- >>> seeds/fonctions_seed.sql
USE srsp_db;

INSERT INTO fonctions (libelle, description) VALUES
('Chef de Service', 'Supervision générale du SRSP'),
('Chef BAAF', 'Gestion comptable et administrative'),
('Coordonnatrice', 'Immatriculation et suivi des insertions'),
('Secrétaire', 'Réception, enregistrement et distribution'),
('Chef de Division', 'Supervision d''une division'),
('Vérificateur', 'Exploitation et vérification des dossiers'),
('Liquidateur', 'Liquidation des pensions'),
('Chargé de Secours', 'Traitement des dossiers de secours')
ON DUPLICATE KEY UPDATE description = VALUES(description);
-- >>> seeds/types_courriers_seed.sql
USE srsp_db;

INSERT INTO types_courriers (libelle) VALUES
('DEMANDE'),
('INFORMATION'),
('NOTIFICATION'),
('RAPPORT'),
('CIRCULAIRE'),
('DECISION')
ON DUPLICATE KEY UPDATE libelle = VALUES(libelle);
-- >>> seeds/types_documents_seed.sql
USE srsp_db;

INSERT INTO types_documents (libelle, extensions_autorisees, taille_max) VALUES
('PIECE_IDENTITE', 'pdf,jpg,jpeg,png', 5242880),
('ACTE_DECES', 'pdf,jpg,jpeg,png', 5242880),
('CERTIFICAT', 'pdf,jpg,jpeg,png', 5242880),
('RAPPORT', 'pdf,docx,doc', 5242880),
('DECOMPTE', 'xlsx,xls,pdf', 5242880),
('BON_CAISSE', 'pdf,xlsx', 5242880),
('AUTRE', 'pdf,docx,xlsx,jpg,jpeg,png', 5242880)
ON DUPLICATE KEY UPDATE extensions_autorisees = VALUES(extensions_autorisees), taille_max = VALUES(taille_max);
-- >>> seeds/role_permissions_seed.sql
USE srsp_db;

-- ADMIN : toutes les permissions
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p
WHERE r.nom = 'ADMIN' AND p.nom IN (
  'dossier.creer', 'dossier.modifier', 'dossier.supprimer', 'dossier.affecter',
  'dossier.traiter', 'dossier.verifier', 'dossier.valider', 'dossier.cloturer',
  'dossier.archiver', 'user.gerer', 'role.gerer', 'division.gerer', 'agent.gerer', 'courrier.gerer'
);

-- CHEF_SERVICE : supervision, traitement, vérification, validation, clôture, archivage
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p
WHERE r.nom = 'CHEF_SERVICE' AND p.nom IN (
  'dossier.creer', 'dossier.modifier', 'dossier.traiter', 'dossier.verifier',
  'dossier.valider', 'dossier.cloturer', 'dossier.archiver'
);

-- CHEF_BAAF et COORDINATRICE
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p
WHERE r.nom IN ('CHEF_BAAF', 'COORDINATRICE') AND p.nom IN (
  'dossier.creer', 'dossier.modifier', 'dossier.traiter', 'dossier.verifier',
  'dossier.valider', 'dossier.archiver', 'courrier.gerer'
);

-- SECRETAIRE : réception, enregistrement, distribution/orientation, clôture, courriers
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p
WHERE r.nom = 'SECRETAIRE' AND p.nom IN (
  'dossier.creer', 'dossier.modifier', 'dossier.affecter', 'dossier.cloturer',
  'dossier.archiver', 'courrier.gerer'
);

-- CHEFS DE DIVISION : affectation, traitement, vérification, validation, clôture, archivage
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p
WHERE r.nom IN ('CHEF_DIVISION_VISA', 'CHEF_DIVISION_SOLDE', 'CHEF_DIVISION_PENSION', 'CHEF_DIVISION_SECOURS')
  AND p.nom IN (
    'dossier.affecter', 'dossier.traiter', 'dossier.verifier',
    'dossier.valider', 'dossier.cloturer', 'dossier.archiver', 'courrier.gerer'
  );

-- AGENTS DE TRAITEMENT (vérificateurs, liquidateurs, chargés)
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p
WHERE r.nom IN ('VERIFICATEUR_VISA', 'VERIFICATEUR_SOLDE', 'LIQUIDATEUR_PENSION', 'CHARGE_SECOURS')
  AND p.nom IN ('dossier.traiter', 'dossier.verifier', 'dossier.archiver');
