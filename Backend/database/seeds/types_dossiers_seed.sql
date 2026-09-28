USE srsp_db;

-- Le libelle designe le TYPE (Visa), pas la division : la division decoule
-- du type via divisions.type_dossier_id (migration 027).
INSERT INTO types_dossiers (code, libelle, description, actif) VALUES
('VISA', 'Visa', 'Intégration, avancement', TRUE),
('SOLDE', 'Solde', 'Salaire, mandatement', TRUE),
('PENSION', 'Pension', 'Retraite', TRUE),
('SECOURS', 'Secours', 'Décès, aide famille', TRUE)
ON DUPLICATE KEY UPDATE libelle = VALUES(libelle), description = VALUES(description), actif = VALUES(actif);