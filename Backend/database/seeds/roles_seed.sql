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