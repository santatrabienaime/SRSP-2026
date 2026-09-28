-- 034_identification_demandeur.sql
-- « Création d'un dossier complet » — identité et coordonnées du demandeur.
--
-- Le formulaire du document distingue cinq informations : CIN, NOM, Prénom,
-- Téléphone, Email, Adresse. La table n'en portait qu'une, `demandeur` (150
-- caractères, « NOM Prénom » concaténé) plus `matricule`.
--
-- Deux conséquences concrètes, pas théoriques :
--   - « RAKOTO Jean » ne peut pas être filtré sur le nom seul. Un chef de
--     division cherchant les dossiers de RAKOTO trouve ceux de RAKOTOA, et ne
--     trouve pas ceux de Jean RAKOTO selon l'ordre de saisie.
--   - Les coordonnées du demandeur, exigées par la procédure d'accueil, n'ont
--     nulle part où être saisies : la secrétaire les note à côté de l'écran.
--
-- On ajoute donc les colonnes, SANS toucher à `demandeur` : des dossiers
-- existent déjà, et le code comme les exports lisent ce champ. Il reste la
-- source de vérité pour l'affichage, et est alimenté par défaut à partir des
-- nouvelles colonnes pour que les deux ne puissent pas diverger.
--
-- Le format du CIN mérite un mot : Madagascar l'écrit en 12 chiffres
-- (« 101 234 567 890 »), mais le service porte aussi des numéros de carte de
-- non-inscription alphanumériques (MAT-1234 dans le jeu d'essai). Une
-- contrainte de format sur 12 chiffres purs refuserait ces dossiers
-- légitimes. On n'impose donc PAS de format en base : le contrôle appartient à
-- la couche applicative, qui connaît les deux cas.

-- Rejouable : une migration doit pouvoir être relancée sur une base déjà à
-- jour sans échouer, sinon le déploiement s'arrête au second essai.
SET @sql := (
  SELECT GROUP_CONCAT(
    CONCAT('ADD COLUMN ', col, ' ', typ, ' NULL')
    ORDER BY ordr SEPARATOR ', ')
  FROM (
    SELECT 1 AS ordr, 'demandeur_nom'     AS col, 'VARCHAR(100)'  AS typ
    UNION ALL SELECT 2, 'demandeur_prenom',  'VARCHAR(100)'
    UNION ALL SELECT 3, 'demandeur_tel',     'VARCHAR(30)'
    UNION ALL SELECT 4, 'demandeur_email',   'VARCHAR(150)'
    UNION ALL SELECT 5, 'demandeur_adresse', 'VARCHAR(255)'
  ) AS attendues
  WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'dossiers'
      AND COLUMN_NAME = attendues.col
  )
);

SET @sql := IF(@sql IS NULL, 'SELECT 1', CONCAT('ALTER TABLE dossiers ', @sql));
PREPARE requete FROM @sql;
EXECUTE requete;
DEALLOCATE PREPARE requete;

-- Recherche par nom et par prénom : sans ces index, chaque frappe sur ces
-- colonnes déclenche un parcours complet de la table.
SET @sql := (
  SELECT GROUP_CONCAT(CONCAT('ADD INDEX ', idx) SEPARATOR ', ')
  FROM (
    SELECT 'idx_dossiers_demandeur_nom' AS idx
    UNION ALL SELECT 'idx_dossiers_demandeur_prenom'
  ) AS attendus
  WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'dossiers'
      AND INDEX_NAME = attendus.idx
  )
);

SET @sql := IF(@sql IS NULL, 'SELECT 1', CONCAT('ALTER TABLE dossiers ', @sql));
PREPARE requete FROM @sql;
EXECUTE requete;
DEALLOCATE PREPARE requete;
