-- 023_division_type_dossier.sql
-- Lie explicitement chaque division au type de dossier qu'elle traite.
-- Les codes ne correspondent pas (division VISAS / type VISA,
-- division PENSIONS / type PENSION) : sans cette colonne, il faut bricoler
-- une correspondance dans le code. La relation devient ici une donnée.

ALTER TABLE divisions
  ADD COLUMN type_dossier_id INT(11) NULL DEFAULT NULL AFTER nom,
  ADD KEY idx_division_type (type_dossier_id);

-- Rattachement officiel des 4 divisions
UPDATE divisions dv
JOIN types_dossiers td
  ON (dv.code = td.code)
   OR (dv.code = CONCAT(td.code, 'S'))
   OR (dv.code = CONCAT(td.code, 'NS'))
SET dv.type_dossier_id = td.id;

-- Contrôle : les 4 divisions doivent être rattachées
SELECT dv.code AS division, td.code AS type
FROM divisions dv
LEFT JOIN types_dossiers td ON td.id = dv.type_dossier_id
ORDER BY dv.id;

ALTER TABLE divisions
  MOD COLUMN type_dossier_id INT(11) NOT NULL,
  ADD CONSTRAINT fk_division_type_dossier
    FOREIGN KEY (type_dossier_id) REFERENCES types_dossiers (id);
