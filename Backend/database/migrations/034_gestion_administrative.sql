-- 034_gestion_administrative.sql
-- Fonctions de la Coordinatrice, absentes de la plateforme.
--
-- La Coordinatrice possede `gerer_immatriculations`, `gerer_augure` et
-- `gerer_paiements` depuis l'origine, mais aucune de ces permissions ne menait
-- nulle part : pas de table, pas de route, pas d'ecran. Un role entier se
-- connectait et ne pouvait rien faire.
--
-- Les trois activites partageant le meme objet — la personne fonctionnaire —
-- et la meme logique de suivi, elles sont modelees de facon coherente :
-- identite, situation, dates, et qui a fait quoi.
--
-- Deux regles reprisees des fonctions deja construites plutot qu'inventees :
--   - numerotation unique et lisible, generee en base (cf. generateDossierNumber) ;
--   - toute ecriture est tracee dans historique_actions, comme toute autre.

-- ------------------------------------------------------------------ --
-- 1. Immatriculation du fonctionnaire                              --
-- ------------------------------------------------------------------ --
-- Un fonctionnaire est immatricule UNE fois : le numero d'immatriculation est
-- son identifiant administratif definitif. La contrainte d'unicite est donc
-- posee, sans quoi deux fiches du meme fonctionnaire se melangeraient et
-- partager un numero et les paiements seraient.routes au mauvais compte.
CREATE TABLE IF NOT EXISTS immatriculations (
  id INT(11) NOT NULL AUTO_INCREMENT,
  numero VARCHAR(50) NOT NULL,
  -- Identite
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  cin VARCHAR(50) NULL,
  date_naissance DATE NULL,
  -- Situation administrative
  corps VARCHAR(100) NULL,
  grade VARCHAR(100) NULL,
  indice INT(11) NULL,
  date_entree DATE NULL,
  -- Rattachement au service
  division_id INT(11) NULL,
  -- Suivi
  statut ENUM('EN_ATTENTE', 'ACTIVE', 'REJETEE') NOT NULL DEFAULT 'EN_ATTENTE',
  observations TEXT NULL,
  created_by INT(11) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_immatriculation_numero (numero),
  KEY idx_immatriculation_cin (cin),
  KEY idx_immatriculation_statut (statut),
  CONSTRAINT fk_imm_division FOREIGN KEY (division_id) REFERENCES divisions (id) ON DELETE SET NULL,
  CONSTRAINT fk_imm_user FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------ --
-- 2. Insertion Augure                                              --
-- ------------------------------------------------------------------ --
-- Augure est le logiciel de la fonction publique : chaque fonctionnaire y
-- entre une fois. On trace l'etat de la saisie pour que la Coordinatrice sache
-- ce qui reste a faire, plutot que de le deviner dans un logiciel externe.
CREATE TABLE IF NOT EXISTS insertions_augure (
  id INT(11) NOT NULL AUTO_INCREMENT,
  -- Reference a l'immatriculation : un arrivant est toujours un immatricule
  -- deja connu. ON DELETE RESTRICT : on ne supprime pas une immatriculation
  -- qui a deja produit une insertion.
  immatriculation_id INT(11) NOT NULL,
  matricule_augure VARCHAR(50) NULL,
  situation_familiale VARCHAR(100) NULL,
  adresse VARCHAR(255) NULL,
  telephone VARCHAR(30) NULL,
  date_naissance DATE NULL,
  -- Donnees de remuneration : l'agent les saisit, pas la platforme
  indice_base INT(11) NULL,
  salaire_base DECIMAL(14, 2) NULL,
  statut ENUM('A_INSERER', 'INSERE', 'REJETE') NOT NULL DEFAULT 'A_INSERER',
  observations TEXT NULL,
  insere_par INT(11) NULL,
  insere_le DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_augure_immatriculation (immatriculation_id),
  KEY idx_augure_statut (statut),
  CONSTRAINT fk_augure_imm FOREIGN KEY (immatriculation_id) REFERENCES immatriculations (id) ON DELETE RESTRICT,
  CONSTRAINT fk_augure_user FOREIGN KEY (insere_par) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------ --
-- 3. Mode de paiement                                              --
-- ------------------------------------------------------------------ --
-- Un fonctionnaire ne peut avoir qu'un mode de paiement a la fois. La
-- contrainte d'unicite est donc sur la personne et porte sur la periode
-- courante, pas sur toute la table : l'historique des changements doit
-- pouvoir etre conserve.
--
-- On modelise donc une table d'historique, et c'est l'application qui garantit
-- qu'un seul enregistrement ACTIF existe par personne a un instant donne. Sans
-- contrainte en base, deux validations quasi simultanees creatent deux modes
-- actifs et le virement part vers deux comptes.
CREATE TABLE IF NOT EXISTS modes_paiement (
  id INT(11) NOT NULL AUTO_INCREMENT,
  immatriculation_id INT(11) NOT NULL,
  mode ENUM('VIREMENT', 'CHEQUE', 'ESPECES', 'MANDAT') NOT NULL,
  banque VARCHAR(100) NULL,
  compte_bancaire VARCHAR(50) NULL,
  motif TEXT NOT NULL,
  -- Pieces justificatives vues par la Coordinatrice (4.3 : « contrôle les pièces
  -- justificatives »). Le piece jointe reel est deposee dans documents, lie au
  -- dossier ; ce champ trace ce qui a ete verifie, et non ce qui a ete affiche.
  pieces_verifiees TINYINT(1) NOT NULL DEFAULT 0,
  statut ENUM('EN_ATTENTE', 'APPROUVE', 'REJETE') NOT NULL DEFAULT 'EN_ATTENTE',
  -- Observations de traitement : pourquoi la demande est approuvée ou refusée.
  -- Sans elles, une décision financière reste inexplicable plus tard.
  observations TEXT NULL,
  traite_par INT(11) NULL,
  traite_le DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_paiement_immatriculation (immatriculation_id),
  KEY idx_paiement_statut (statut),
  CONSTRAINT fk_paiement_imm FOREIGN KEY (immatriculation_id) REFERENCES immatriculations (id) ON DELETE CASCADE,
  CONSTRAINT fk_paiement_user FOREIGN KEY (traite_par) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------ --
-- Rejouabilite                                                     --
-- ------------------------------------------------------------------
-- Sur une base ou les trois tables viennent d'etre creees, la colonne
-- `observations` peut manquer : la premiere version du fichier ne la
-- prevoyait pas. On l'ajoute si elle est absente, plutot que de laisser la
-- migration echouer au second deploiement.

SET @sql := (
  SELECT IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'modes_paiement'
        AND COLUMN_NAME = 'observations') = 0,
    'ALTER TABLE modes_paiement ADD COLUMN observations TEXT NULL AFTER statut',
    'SELECT 1'
  )
);
PREPARE requete FROM @sql; EXECUTE requete; DEALLOCATE PREPARE requete;

SET @sql := (
  SELECT IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'modes_paiement'
        AND COLUMN_NAME = 'pieces_verifiees') = 0,
    'ALTER TABLE modes_paiement ADD COLUMN pieces_verifiees TINYINT(1) NOT NULL DEFAULT 0 AFTER motif',
    'SELECT 1'
  )
);
PREPARE requete FROM @sql; EXECUTE requete; DEALLOCATE PREPARE requete;
