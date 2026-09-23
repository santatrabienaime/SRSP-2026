USE srsp_db;

INSERT INTO divisions (code, nom) VALUES
('VISAS', 'Division Visas'),
('SOLDE', 'Division Solde'),
('PENSIONS', 'Division Pensions'),
('SECOURS', 'Division Secours')
ON DUPLICATE KEY UPDATE nom = VALUES(nom);