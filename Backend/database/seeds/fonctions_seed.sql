USE srsp_db;

INSERT INTO fonctions (id, libelle, description) VALUES
(1, 'Chef de Service', 'Supervision générale du SRSP'),
(2, 'Chef BAAF', 'Gestion comptable et administrative'),
(3, 'Coordonnatrice', 'Immatriculation et suivi des insertions'),
(4, 'Secrétaire', 'Réception, enregistrement et distribution'),
(5, 'Chef de Division', 'Supervision d''une division'),
(6, 'Vérificateur', 'Exploitation et vérification des dossiers'),
(7, 'Liquidateur', 'Liquidation des pensions'),
(8, 'Chargé de Secours', 'Traitement des dossiers de secours')
ON DUPLICATE KEY UPDATE libelle = VALUES(libelle), description = VALUES(description);