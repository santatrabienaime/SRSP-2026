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