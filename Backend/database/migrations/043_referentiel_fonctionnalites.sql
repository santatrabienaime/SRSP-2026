-- 043 : référentiel des fonctionnalités, avec traçabilité à la source.
--
-- Le document « 325 fonctionnalités extraites de l'Historique du SRSP » a une
-- qualité que n'avaient pas les précédents : il rattache chaque ligne à sa
-- source. C'est cette traçabilité qui rend le document exploitable, et c'est
-- elle qu'il faut conserver — sinon la plateforme perd la seule chose qui
-- distingue une fonctionnalité documentée d'une fonctionnalité imaginée.
--
-- Le document compte 325 lignes, dont trois familles qui ne sont pas des actions
-- du logiciel :
--
--   - 41 sont des NŒUDS D'ORGANIGRAMME (« Représenter la Direction de la
--     Communication du Ministère »). Ce sont des lignes de l'organigramme
--     officiel, pas des actions. Les enregistrer comme fonctionnalités ferait
--     dire à l'écran « 325 fonctionnalités » dont 41 qu'aucun agent
--     n'accomplira jamais.
--   - 7 sont des INTÉGRATIONS avec des systèmes externes (SIIGFP, SIIGMP,
--     Augure, logiciel secours). La plateforme ne peut pas y écrire : elle
--     prépare ce qui doit y être reporté et trace ce qui l'a été.
--   - 26 sont INSTITUTIONNELLES : identité du service, historique, objectifs.
--     Affichables, et absents de la base — ils vivaient en dur dans la page de
--     connexion, où ils ne sont ni traduisibles, ni vérifiables, ni modifiables.
--
-- Le champ `nature` porte cette distinction. C'est la différence entre un outil
-- qui tient sa promesse et un écran qui affiche un total invérifiable.

SET NAMES utf8mb4;

-- Postes et structures auxquels une fonctionnalité se rattache.
CREATE TABLE IF NOT EXISTS referentiel_postes (
  id INT(11) NOT NULL AUTO_INCREMENT,
  code VARCHAR(60) NOT NULL,
  libelle VARCHAR(150) NOT NULL,
  -- Rôle de la plateforme auquel le poste correspond. NULL pour les structures
  -- purement organisationnelles : ce sont des postes réels, mais aucun ne porte
  -- de rôle ni d'accès.
  role_nom VARCHAR(60) NULL,
  niveau TINYINT(1) NOT NULL DEFAULT 3,
  actif TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_poste_code (code),
  KEY idx_poste_role (role_nom)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Fonctions du document. Une seule ligne par fonctionnalité.
CREATE TABLE IF NOT EXISTS referentiel_fonctionnalites (
  id INT(11) NOT NULL AUTO_INCREMENT,

  -- Numéro de la ligne DANS son document. La paire (document, numéro) est la
  -- référence : « fonction 118 du référentiel de l'historique » et « fonction 118
  -- des fonctionnalités obligatoires » ne désignent pas la même chose.
  --
  -- La clé n'était que numero_source, et les 189 fonctionnalités obligatoires
  -- ont alors ECRASTÉ les 325 de l'historique, ligne par ligne. Deux documents
  -- qui se détruisent ne peuvent pas coexister : il fallait le voir à la
  -- migration, pas après.
  document VARCHAR(60) NOT NULL DEFAULT 'HISTORIQUE',
  numero_source INT(11) NOT NULL,

  poste_code VARCHAR(60) NOT NULL,
  libelle VARCHAR(255) NOT NULL,
  detail VARCHAR(500) NULL,
  section_source VARCHAR(80) NOT NULL,

  -- CE QUE C'EST. La distinction change tout :
  --   METIER        une action qu'un agent accomplit dans la plateforme ;
  --   INSTITUTIONNEL une information du service à afficher ;
  --   STRUCTURE     une ligne d'organigramme, sans action ;
  --   INTEGRATION   un report vers un système externe, préparé et tracé.
  nature ENUM('METIER', 'INSTITUTIONNEL', 'STRUCTURE', 'INTEGRATION') NOT NULL DEFAULT 'METIER',

  -- Permission qui rend la fonctionnalité possible. NULL quand la ligne n'a pas
  -- d'action : c'est le cas des nœuds d'organigramme et des informations
  -- institutionnelles, qui s'affichent sans être autorisées.
  permission_nom VARCHAR(80) NULL,

  -- État réel, mesuré et non déclaré. Une ligne qui décrit une fonctionnalité
  -- non construite ne doit pas se lire comme livrée.
  etat ENUM('LIVREE', 'PARTIELLE', 'INERTE', 'NON_CONSTRUITE', 'HORS_PLATEFORME')
    NOT NULL DEFAULT 'NON_CONSTRUITE',

  -- Pourquoi la fonctionnalité n'est pas utilisable. Obligatoire pour tout état
  -- autre que LIVREE : une ligne sans motif ne peut pas être corrigée plus tard,
  -- seulement constatée.
  motif VARCHAR(500) NULL,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_fonctionnalite_document_numero (document, numero_source),
  KEY idx_fonctionnalite_poste (poste_code),
  KEY idx_fonctionnalite_document (document),
  KEY idx_fonctionnalite_nature (nature),
  KEY idx_fonctionnalite_etat (etat),
  KEY idx_fonctionnalite_permission (permission_nom)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ajout de la colonne `document` sur une table déjà peuplée, et réaffectation
-- des lignes existantes au référentiel de l'historique. Sans cette étape, une
-- base migrée avant la correction verrait les anciennes lignes porter un document
-- vide, et la clé unique ne les séparerait plus des fonctionnalités
-- obligatoires.
SET @sql := (
  SELECT IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'referentiel_fonctionnalites'
        AND COLUMN_NAME = 'document') = 0,
    'ALTER TABLE referentiel_fonctionnalites ADD COLUMN document VARCHAR(60) NOT NULL DEFAULT ''HISTORIQUE'' AFTER numero_source',
    'SELECT 1'
  )
);
PREPARE requete FROM @sql; EXECUTE requete; DEALLOCATE PREPARE requete;

-- L'ancienne clé unique ne peut plus coexister avec la nouvelle.
SET @sql := (
  SELECT IF(
    (SELECT COUNT(*) FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'referentiel_fonctionnalites'
        AND INDEX_NAME = 'uk_fonctionnalite_numero') = 1,
    'ALTER TABLE referentiel_fonctionnalites DROP INDEX uk_fonctionnalite_numero',
    'SELECT 1'
  )
);
PREPARE requete FROM @sql; EXECUTE requete; DEALLOCATE PREPARE requete;

-- La clé unique par (document, numéro) doit exister QUE la table vienne d'être
-- créée ou qu'elle ait été peuplée avant la correction : sur une table déjà
-- peuplée, le CREATE TABLE ne rejoue pas, et l'index manquait. Les deux cas
-- sont donc traités.
SET @sql := (
  SELECT IF(
    (SELECT COUNT(*) FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'referentiel_fonctionnalites'
        AND INDEX_NAME = 'uk_fonctionnalite_document_numero') = 0,
    'ALTER TABLE referentiel_fonctionnalites ADD UNIQUE KEY uk_fonctionnalite_document_numero (document, numero_source)',
    'SELECT 1'
  )
);
PREPARE requete FROM @sql; EXECUTE requete; DEALLOCATE PREPARE requete;

-- Identité institutionnelle du service.
--
-- Ces informations vivaient en dur dans la page de connexion. Une coordonnée
-- téléphonique écrite dans du JSX n'est ni traduisible, ni vérifiable, ni
-- modifiable par l'administrateur : elle devient fausse au premier changement,
-- et personne ne sait qu'elle l'est.
CREATE TABLE IF NOT EXISTS referentiel_service (
  id INT(11) NOT NULL AUTO_INCREMENT,
  cle VARCHAR(60) NOT NULL,
  libelle VARCHAR(200) NOT NULL,
  valeur VARCHAR(500) NULL,
  categorie VARCHAR(60) NOT NULL,
  ordre SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uk_service_cle (cle)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Données de référence : postes du service et identité institutionnelle.
-- Postes : les 13 rôles de la plateforme, plus les structures purement
-- organisationnelles qui n'ont pas de rôle (accueil, suivi des courriers) et
-- les directions du Ministère, qui ne sont pas des postes du SRSP.
INSERT INTO referentiel_postes (code, libelle, role_nom, niveau) VALUES
  ('MINISTERE',        'Ministère de l’Économie et des Finances', NULL, 0),
  ('DGB',              'Direction Générale du Budget et des Finances', NULL, 1),
  ('DSP',              'Direction de la Solde et des Pensions', NULL, 2),
  ('CHEF_SERVICE',     'Chef de Service',              'CHEF_SERVICE', 1),
  ('CHEF_BAAF',        'Chef BAAF',                    'CHEF_BAAF', 2),
  ('COORDONNATRICE',   'Coordonnatrice',               'COORDINATRICE', 2),
  ('SECRETARIAT',      'Secrétariat',                  'SECRETAIRE', 3),
  ('CHEF_DIV_VISA',    'Chef de Division Visas',       'CHEF_DIVISION_VISA', 2),
  ('CHEF_DIV_SOLDE',   'Chef de Division Solde',       'CHEF_DIVISION_SOLDE', 2),
  ('CHEF_DIV_PENSION', 'Chef de Division Pensions',    'CHEF_DIVISION_PENSION', 2),
  ('CHEF_DIV_SECOURS', 'Chef de Division Secours',     'CHEF_DIVISION_SECOURS', 2),
  ('VERIF_VISA',       'Vérificateurs Visas',          'VERIFICATEUR_VISA', 3),
  ('VERIF_SOLDE',      'Vérificateurs Solde',          'VERIFICATEUR_SOLDE', 3),
  ('LIQUIDATEUR',      'Liquidateurs Pensions',        'LIQUIDATEUR_PENSION', 3),
  ('CHARGE_SECOURS',   'Chargés de Secours',           'CHARGE_SECOURS', 3),
  ('ACCUEIL',          'Accueil',                      NULL, 3),
  ('SUIVI_COURRIERS',  'Suivi des courriers',          NULL, 3),
  ('OBLIGATOIRE',      'Fonctionnalités obligatoires du projet', NULL, 9)
ON DUPLICATE KEY UPDATE libelle = VALUES(libelle), role_nom = VALUES(role_nom), niveau = VALUES(niveau);

-- Identité institutionnelle : les informations qui vivaient en dur dans la
-- page de connexion. Elles sont données par le document « Statut
-- d'identification ».
INSERT INTO referentiel_service (cle, libelle, valeur, categorie, ordre) VALUES
  ('DENOMINATION', 'Dénomination', 'Service Régional de la Solde et des Pensions', 'IDENTITE', 10),
  ('ACRONYME', 'Acronyme', 'SRSP', 'IDENTITE', 20),
  ('SIGLE_LOGO', 'Logo', 'DSP — Direction de la Solde et des Pensions', 'IDENTITE', 30),
  ('FORME_JURIDIQUE', 'Forme juridique', 'Entité gouvernementale relevant de l’administration publique', 'IDENTITE', 40),
  ('SIEGE_CENTRAL', 'Siège central', 'Immeuble Antaninarenina, Antananarivo', 'COORDONNEES', 50),
  ('SIEGE_SUCCURSALE', 'Siège succursale', 'Ambodiaplay, Manakara', 'COORDONNEES', 60),
  ('TELEPHONES', 'Téléphones', '+261 32 11 090 10 / +261 32 25 469 11', 'COORDONNEES', 70),
  ('EMAIL', 'Email', 'srsp.fitovinany@dgfag.mg', 'COORDONNEES', 80),
  ('RATTACHEMENT', 'Rattachement', 'Ministère de l’Économie et des Finances → Direction Générale du Trésor → Direction de la Solde et des Pensions', 'IDENTITE', 90),
  ('DATE_CREATION', 'Établissement', '22 septembre 2011', 'HISTORIQUE', 100),
  ('REGION_ORIGINE', 'Région d’origine', 'Vatovavy Fitovinany', 'HISTORIQUE', 110),
  ('PROVINCE', 'Province de rattachement', 'Fianarantsoa', 'HISTORIQUE', 120),
  ('SCISSION_2022', 'Scission de 2022', 'La région Vatovavy et Fitovinany devient deux entités distinctes ; le SRSP est divisé en antennes Mananjary et Manakara', 'HISTORIQUE', 130),
  ('REGIONS_MALGACHES', 'Régions de Madagascar', '23 depuis 2022', 'HISTORIQUE', 140),
  ('OBJECTIF_SOLDE', 'Objectif 1', 'Calculer et payer les salaires des fonctionnaires et employés du secteur public relevant de sa compétence territoriale', 'OBJECTIFS', 150),
  ('OBJECTIF_PENSION', 'Objectif 2', 'Gérer les pensions de retraite des fonctionnaires', 'OBJECTIFS', 160),
  ('OBJECTIF_CONFORMITE', 'Objectif 3', 'Veiller à la conformité des versements au regard de la réglementation en vigueur et des conventions collectives applicables', 'OBJECTIFS', 170),
  ('EFFECTIF_2011', 'Effectif à la création', '6 membres', 'EFFECTIFS', 180),
  ('EFFECTIF_ACTUEL', 'Effectif actuel', '21 membres', 'EFFECTIFS', 190)
ON DUPLICATE KEY UPDATE libelle = VALUES(libelle), valeur = VALUES(valeur), categorie = VALUES(categorie), ordre = VALUES(ordre);
