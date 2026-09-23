USE srsp_db;

INSERT INTO types_courriers (id, libelle) VALUES
(1, 'DEMANDE'),
(2, 'INFORMATION'),
(3, 'NOTIFICATION'),
(4, 'RAPPORT'),
(5, 'CIRCULAIRE'),
(6, 'DECISION')
ON DUPLICATE KEY UPDATE libelle = VALUES(libelle);