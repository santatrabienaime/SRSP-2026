USE srsp_db;

INSERT INTO priorites (libelle, niveau) VALUES
('URGENTE', 4),
('HAUTE', 3),
('NORMALE', 2),
('BASSE', 1)
ON DUPLICATE KEY UPDATE niveau = VALUES(niveau);