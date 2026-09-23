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