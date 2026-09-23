USE srsp_db;

INSERT INTO types_documents (id, libelle, extensions_autorisees, taille_max) VALUES
(1, 'PIECE_IDENTITE', 'pdf,jpg,jpeg,png', 5242880),
(2, 'ACTE_DECES', 'pdf,jpg,jpeg,png', 5242880),
(3, 'CERTIFICAT', 'pdf,jpg,jpeg,png', 5242880),
(4, 'RAPPORT', 'pdf,docx,doc', 5242880),
(5, 'DECOMPTE', 'xlsx,xls,pdf', 5242880),
(6, 'BON_CAISSE', 'pdf,xlsx', 5242880),
(7, 'AUTRE', 'pdf,docx,xlsx,jpg,jpeg,png', 5242880)
ON DUPLICATE KEY UPDATE extensions_autorisees = VALUES(extensions_autorisees), taille_max = VALUES(taille_max);