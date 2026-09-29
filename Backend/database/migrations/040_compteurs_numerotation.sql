-- 040 : compteurs de numérotation en base.
--
-- Les numéros de dossier, d'immatriculation et de pièce de déplacement étaient
-- calculés par COUNT(*) + 1. Ce calcul n'est pas atomique : deux requêtes
-- simultanées lisent le même total avant que l'une n'écrive, et obtiennent le
-- MÊME numéro. La contrainte d'unicité rejette alors la seconde insertion.
--
-- Reproduit : sur 6 créations de dossiers Secours simultanées, 3 échouaient
-- avec « Duplicate entry for key 'numero' ». C'est le régime normal d'un
-- service qui reçoit plusieurs dossiers dans la même journée : la secrétaire
-- saisit deux dossiers, l'un des deux est refusé, et rien n'indique pourquoi.
--
-- Le passage à un compteurPersistant rend l'opération atomique : c'est
-- l'INCrément lui-même qui réserve le numéro, sous verrou, dans la même
-- instruction que sa conservation.

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS compteurs_numerotation (
  cle VARCHAR(60) NOT NULL,
  valeur INT(11) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (cle)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Remplissage initial à partir de l'existant : les compteurs démarrent au
-- maximum déjà attribué, jamais à 1. Sans cela, le premier dossier créé après
-- la migration entrerait en collision avec le dossier numéro 1.
--
-- La clé porte l'ANNÉE : les compteurs de 2027 ne doivent pas repartir du
-- compteur de 2026. Le format est donc DOSSIER-{type}-{annee}.
INSERT INTO compteurs_numerotation (cle, valeur)
SELECT
  CONCAT('DOSSIER-', type_id, '-', annee),
  COALESCE(MAX(numero), 0)
FROM (
  SELECT type_id,
         YEAR(date_reception) AS annee,
         CAST(SUBSTRING_INDEX(numero, '-', -1) AS UNSIGNED) AS numero
  FROM dossiers
  WHERE numero IS NOT NULL AND numero REGEXP '^[A-Z]+-[0-9]{4}-[0-9]+$'
) reels
GROUP BY type_id, annee
ON DUPLICATE KEY UPDATE valeur = GREATEST(valeur, VALUES(valeur));

INSERT INTO compteurs_numerotation (cle, valeur)
SELECT
  'IMMATRICULATION',
  COALESCE(MAX(CAST(SUBSTRING_INDEX(numero, '-', -1) AS UNSIGNED)), 0)
FROM immatriculations
WHERE numero REGEXP '[0-9]{6}$'
ON DUPLICATE KEY UPDATE valeur = GREATEST(valeur, VALUES(valeur));

-- Lignes manquantes : un type de dossier encore jamais utilisé n'a pas de
-- dossier, donc pas de ligne dérivée ci-dessus. Le code sait en créer une à la
-- demande (INSERT ... ON DUPLICATE KEY), ce remplissage reste néanmoins utile
-- pour que l'administrateur VOIE les compteurs existants plutôt que de les
-- découvrir par une création.
INSERT IGNORE INTO compteurs_numerotation (cle, valeur)
SELECT CONCAT('DOSSIER-', id, '-', YEAR(NOW())), 0 FROM types_dossiers;

-- Nettoyage des clés sans année, produites par une première exécution de ce
-- fichier avant que le format de clé ne soit aligné sur le code.
DELETE FROM compteurs_numerotation WHERE cle REGEXP '^DOSSIER-[0-9]+$';
