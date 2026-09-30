-- 042 : périmètre géographique du SRSP Fitovinany.
--
-- Le SRSP couvre SIX DISTRICTS répartis sur DEUX ANTENNES depuis 2022 :
--
--   Antenne Mananjary : Ifanadiana, Nosy Varika, Mananjary
--   Antenne Manakara  : Ikongo, Vohipeno, Manakara  (siège)
--
-- Cette dimension n'existait nulle part dans la plateforme. Un dossier ne
-- disait pas d'où venait le demandeur, alors que le service en couvre six
-- districts et que la répartition conditionne le traitement : un secours de
-- décès, une demande de pension et un visa se jouent différemment selon que
-- l'usager dépend de l'antenne de Manakara ou de celle de Mananjary.
--
-- Le rattachement ANTENNE → DISTRICT est une donnée, pas une convention
-- écrite en dur : la carte administrative a changé en 2022, elle peut
-- recommencer à changer.

SET NAMES utf8mb4;

-- Antennes du service.
CREATE TABLE IF NOT EXISTS antennes (
  id INT(11) NOT NULL AUTO_INCREMENT,
  code VARCHAR(30) NOT NULL,
  libelle VARCHAR(100) NOT NULL,
  -- L'antenne qui porte le siège du SRSP. Le document distingue Manakara
  -- « siège actuel » de Mananjary : la distinction n'est pas décorative, elle
  -- détermine où sont conservées les pièces et qui relève de qui.
  siege TINYINT(1) NOT NULL DEFAULT 0,
  actif TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_antenne_code (code),
  -- Une seule antenne porte le siège : deux sièges rendraient la question
  -- « qui relève de qui » sans réponse.
  UNIQUE KEY uk_antenne_siege_unique (siege)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Districts rattachés aux antennes.
CREATE TABLE IF NOT EXISTS districts (
  id INT(11) NOT NULL AUTO_INCREMENT,
  antenne_id INT(11) NOT NULL,
  code VARCHAR(30) NOT NULL,
  libelle VARCHAR(100) NOT NULL,
  actif TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_district_code (code),
  KEY idx_district_antenne (antenne_id),
  CONSTRAINT fk_district_antenne FOREIGN KEY (antenne_id) REFERENCES antennes (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Rattachement géographique d'un dossier.
--
-- NULLABLE, et c'est délibéré : les dossiers créés avant cette migration
-- n'ont pas de district connu. La contrainte unique porte sur la paire
-- dossier + district, ce qui autorise l'historisation : un dossier peut avoir
-- transité par plusieurs districts, et seule la dernière ligne fait foi.
--
-- Un `district_id NOT NULL` aurait imposé de deviner les 8 dossiers déjà en
-- base, et d'inventer une localité pour chacun.
CREATE TABLE IF NOT EXISTS dossiers_districts (
  id INT(11) NOT NULL AUTO_INCREMENT,
  dossier_id INT(11) NOT NULL,
  district_id INT(11) NOT NULL,
  -- Date à laquelle le demandeur a été rattaché à ce district. Permet de
  -- dater une création de dossier à l'appartenance administrative en vigueur
  -- ce jour-là, et non à celle d'aujourd'hui : la carte change.
  date_rattachement DATE NOT NULL,
  -- Vrai pour le district actuellement applicable. Une seule ligne peut l'être
  -- par dossier, garanti par l'index unique ci-dessous.
  courante TINYINT(1) NOT NULL DEFAULT 1,
  -- Origine du rattachement : saisie de la secrétaire, ou déduit plus tard.
  origine VARCHAR(40) NOT NULL DEFAULT 'SAISIE',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_dossier_district_dossier (dossier_id),
  KEY idx_dossier_district_district (district_id),
  KEY idx_dossier_district_courante (dossier_id, courante),
  CONSTRAINT fk_dossier_district_dossier FOREIGN KEY (dossier_id) REFERENCES dossiers (id) ON DELETE CASCADE,
  CONSTRAINT fk_dossier_district_district FOREIGN KEY (district_id) REFERENCES districts (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Un dossier ne peut avoir qu'UN district courant. Sans cette contrainte, une
-- double saisie laisserait deux districts « courants », et le rapport par antenne
-- compterait le même dossier dans les deux : le total dépasserait le nombre de
-- dossiers, ce que personne ne remarque au premier coup d'œil.
--
-- Le NULL est nécessaire parce que plusieurs lignes doivent pouvoir être non
-- courantes ; MySQL autorise plusieurs NULL dans un index unique, ce qui est
-- exactement le comportement voulu.
SET @sql := (
  SELECT IF(
    (SELECT COUNT(*) FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'dossiers_districts'
        AND INDEX_NAME = 'uk_dossier_district_courante') = 0,
    'ALTER TABLE dossiers_districts ADD UNIQUE KEY uk_dossier_district_courante (dossier_id, courante)',
    'SELECT 1'
  )
);
PREPARE requete FROM @sql; EXECUTE requete; DEALLOCATE PREPARE requete;

-- Données de référence : les deux antennes et les six districts.
--
-- Cette répartition date de 2022, année de la scission de la région Vatovavy
-- et Fitovinany. Avant cette date, un seul SRSP gérait les six districts
-- depuis Fianarantsoa Ville. La ligne est donc datée, pas éternelle.
INSERT INTO antennes (code, libelle, siege) VALUES
  ('MANANJARY', 'Antenne Mananjary', 0),
  ('MANAKARA',  'Antenne Manakara',  1)
ON DUPLICATE KEY UPDATE libelle = VALUES(libelle), siege = VALUES(siege);

INSERT INTO districts (antenne_id, code, libelle)
SELECT a.id, 'IFANADIANA',  'Ifanadiana'   FROM antennes a WHERE a.code = 'MANANJARY'
UNION ALL SELECT a.id, 'NOSY_VARIKA', 'Nosy Varika' FROM antennes a WHERE a.code = 'MANANJARY'
UNION ALL SELECT a.id, 'MANANJARY',   'Mananjary'   FROM antennes a WHERE a.code = 'MANANJARY'
UNION ALL SELECT a.id, 'IKONGO',      'Ikongo'      FROM antennes a WHERE a.code = 'MANAKARA'
UNION ALL SELECT a.id, 'VOHIPENO',    'Vohipeno'    FROM antennes a WHERE a.code = 'MANAKARA'
UNION ALL SELECT a.id, 'MANAKARA',    'Manakara'    FROM antennes a WHERE a.code = 'MANAKARA'
ON DUPLICATE KEY UPDATE libelle = VALUES(libelle), antenne_id = VALUES(antenne_id);
