USE srsp_db;

INSERT INTO priorites (id, libelle, niveau) VALUES
(1, 'URGENTE', 4),
(2, 'HAUTE', 3),
(3, 'NORMALE', 2),
(4, 'BASSE', 1)
ON DUPLICATE KEY UPDATE libelle = VALUES(libelle), niveau = VALUES(niveau);