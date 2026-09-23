USE srsp_db;

INSERT INTO types_dossiers (code, libelle, description, actif) VALUES
('VISA', 'Division Visa', 'Dossiers soumis pour visa et exploitation', TRUE),
('SOLDE', 'Division Solde', 'Dossiers de mandatement et avance de solde', TRUE),
('PENSION', 'Division Pension', 'Dossiers de liquidation de pension et secours au décès', TRUE),
('SECOURS', 'Division Secours', 'Dossiers de secours de décès', TRUE)
ON DUPLICATE KEY UPDATE libelle = VALUES(libelle), description = VALUES(description), actif = VALUES(actif);