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