USE srsp_db;

INSERT INTO types_documents (libelle, extensions_autorisees, taille_max) VALUES
('PIECE_IDENTITE', 'pdf,jpg,jpeg,png', 5242880),
('ACTE_DECES', 'pdf,jpg,jpeg,png', 5242880),
('CERTIFICAT', 'pdf,jpg,jpeg,png', 5242880),
('RAPPORT', 'pdf,docx,doc', 5242880),
('DECOMPTE', 'xlsx,xls,pdf', 5242880),
('BON_CAISSE', 'pdf,xlsx', 5242880),
('AUTRE', 'pdf,docx,xlsx,jpg,jpeg,png', 5242880)
ON DUPLICATE KEY UPDATE extensions_autorisees = VALUES(extensions_autorisees), taille_max = VALUES(taille_max);