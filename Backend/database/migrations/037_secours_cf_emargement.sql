-- 037 : Division Secours — visa du contrôle financier, état d'émargement,
-- cachet et date, et envoi à la signature de l'ordonnateur.
--
-- Le document décrit quatre étapes qui n'existaient nulle part :
--   1.1  réception d'un dossier du CF, avec contrôle du n° de visa, de la
--        signature et de la date de visa ;
--   1.6  insertion des références dans le logiciel secours, d'où sort l'état
--        d'émargement ;
--   1.7  transmission des pièces à l'ordonnateur pour signature ;
--   2.4  apposition du cachet rond, du titre et du nom de l'ordonnateur, et de
--        la date sur les pièces de mandatement.
--
-- Le visa du CF est un QUATRIÈME point de contrôle de complétude, distinct des
-- quatre pièces du PGA : c'est le document lui-même qui est visé, et non une
-- pièce jointe. Le modéliser dans `controles_decompte` aurait confondu deux
-- objets différents.

SET NAMES utf8mb4;

-- Visa du contrôle financier, par dossier.
CREATE TABLE IF NOT EXISTS visas_controle_financier (
  id INT(11) NOT NULL AUTO_INCREMENT,
  dossier_id INT(11) NOT NULL,
  numero_visa VARCHAR(100) NOT NULL,
  signe_par VARCHAR(150) NULL,
  date_visa DATE NOT NULL,
  commentaire TEXT NULL,
  enregistre_par INT(11) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_visa_cf_dossier (dossier_id),
  KEY idx_visa_cf_numero (numero_visa),
  CONSTRAINT fk_visa_cf_dossier FOREIGN KEY (dossier_id) REFERENCES dossiers (id) ON DELETE CASCADE,
  CONSTRAINT fk_visa_cf_user FOREIGN KEY (enregistre_par) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Un numéro de visa est une référence officielle : il ne peut pas servir deux
-- fois sur deux dossiers différents. Sans cette contrainte, deux agents
--ervisorisant deux divisions pourraient viser le même numéro, et la référence
-- become inutilisable comme preuve.
SET @sql := (
  SELECT IF(
    (SELECT COUNT(*) FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'visas_controle_financier'
        AND INDEX_NAME = 'uk_visa_cf_numero_unique') = 0,
    'ALTER TABLE visas_controle_financier ADD UNIQUE KEY uk_visa_cf_numero_unique (numero_visa)',
    'SELECT 1'
  )
);
PREPARE requete FROM @sql; EXECUTE requete; DEALLOCATE PREPARE requete;

-- État d'émargement : les bénéficiaires ont signé, ou pas.
--
-- `signataire` est du texte libre et non une clé étrangère vers `agents` : le
-- bénéficiaire d'un secours de décès est très souvent un membre de la famille du
-- défunt, pas un agent du SRSP. Il n'a donc aucune fiche agent à quoi se lier.
CREATE TABLE IF NOT EXISTS etats_emargement (
  id INT(11) NOT NULL AUTO_INCREMENT,
  mandatement_id INT(11) NOT NULL,
  genere_par INT(11) NULL,
  genere_le DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_emargement_mandatement (mandatement_id),
  CONSTRAINT fk_emargement_mandatement FOREIGN KEY (mandatement_id) REFERENCES mandatements (id) ON DELETE CASCADE,
  CONSTRAINT fk_emargement_genere_par FOREIGN KEY (genere_par) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Rejouabilite : la colonne `numero`, prevue puis jamais alimentee, est
-- supprimee. Un etat d'emargement est identifie par son mandatement ; lui
-- inventer un numero autonome obligerait a le saisir a la main, et deux
-- emargements du meme mandatement ne peuvent pas en avoir deux differents.
SET @sql := (
  SELECT IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'etats_emargement'
        AND COLUMN_NAME = 'numero') = 1,
    'ALTER TABLE etats_emargement DROP COLUMN numero',
    'SELECT 1'
  )
);
PREPARE requete FROM @sql; EXECUTE requete; DEALLOCATE PREPARE requete;

CREATE TABLE IF NOT EXISTS emargements (
  id INT(11) NOT NULL AUTO_INCREMENT,
  etat_emargement_id INT(11) NOT NULL,
  beneficiaire_id INT(11) NOT NULL,
  signataire VARCHAR(200) NULL,
  signe_le DATE NULL,
  observation VARCHAR(500) NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_emargement_beneficiaire (etat_emargement_id, beneficiaire_id),
  CONSTRAINT fk_emargement_etat FOREIGN KEY (etat_emargement_id) REFERENCES etats_emargement (id) ON DELETE CASCADE,
  CONSTRAINT fk_emargement_beneficiaire FOREIGN KEY (beneficiaire_id) REFERENCES mandatement_beneficiaires (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Transmission des pièces de mandatement à l'ordonnateur, puis signature.
--
-- Distincte de `mandatements`, qui suit l'etat comptable du mandat. Ici on suit
-- ce qui est sorti de l'imprimante : ce que l'ordonnateur a signe, et quand.
CREATE TABLE IF NOT EXISTS signatures_ordonnateur (
  id INT(11) NOT NULL AUTO_INCREMENT,
  mandatement_id INT(11) NOT NULL,
  reference_signature VARCHAR(100) NOT NULL,
  signe_par INT(11) NULL,
  signe_le DATETIME NULL,
  archive_le DATETIME NULL,
  observations VARCHAR(1000) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_signature_ord_mandatement (mandatement_id),
  UNIQUE KEY uk_signature_ord_reference (reference_signature),
  KEY idx_signature_ord_date (signe_le),
  CONSTRAINT fk_signature_ord_mandatement FOREIGN KEY (mandatement_id) REFERENCES mandatements (id) ON DELETE CASCADE,
  CONSTRAINT fk_signature_ord_user FOREIGN KEY (signe_par) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Cachet, titre de l'ordonnateur et date apposés sur les pièces de mandatement.
CREATE TABLE IF NOT EXISTS cachets_mandatement (
  id INT(11) NOT NULL AUTO_INCREMENT,
  mandatement_id INT(11) NOT NULL,
  cache_par INT(11) NOT NULL,
  date_cachet DATE NOT NULL,
  titre_ordonnateur VARCHAR(200) NOT NULL,
  nom_ordonnateur VARCHAR(150) NOT NULL,
  observations VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_cachet_mandatement (mandatement_id),
  CONSTRAINT fk_cachet_mandatement FOREIGN KEY (mandatement_id) REFERENCES mandatements (id) ON DELETE CASCADE,
  CONSTRAINT fk_cachet_user FOREIGN KEY (cache_par) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Références reportées dans le logiciel secours.
--
-- Le logiciel secours est EXTERNE : la plateforme ne peut pas y écrire. Elle
-- prépare donc les références que l'agent doit reporter, et trace ce qu'il a
-- dit avoir reporter. Un en-tête « logiciel secours » strictement égal à cette table
-- serait une promesse que la plateforme ne tient pas.
CREATE TABLE IF NOT EXISTS references_logiciel_secours (
  id INT(11) NOT NULL AUTO_INCREMENT,
  mandatement_id INT(11) NOT NULL,
  code VARCHAR(30) NOT NULL,
  libelle VARCHAR(200) NOT NULL,
  valeur VARCHAR(200) NOT NULL,
  reporte_par INT(11) NULL,
  reporte_le DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_reference_logiciel (mandatement_id, code),
  CONSTRAINT fk_ref_logiciel_mandatement FOREIGN KEY (mandatement_id) REFERENCES mandatements (id) ON DELETE CASCADE,
  CONSTRAINT fk_ref_logiciel_user FOREIGN KEY (reporte_par) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
