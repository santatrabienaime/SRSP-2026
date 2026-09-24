-- 021_calculs_financiers.sql
-- Liquidation de pension (division Pension) et décompte d'avance (division Solde).
-- Montants en Ariary, entiers : pas de centimes dans la monnaie nationale.

-- 1. Liquidation de pension ---------------------------------------------------
CREATE TABLE IF NOT EXISTS liquidations_pension (
  id INT(11) NOT NULL AUTO_INCREMENT,
  dossier_id INT(11) NOT NULL,
  agent_id INT(11) NULL,
  -- données de l'agent
  annees_service SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  indice_final INT UNSIGNED NULL,
  -- montants
  pension_brute BIGINT UNSIGNED NOT NULL DEFAULT 0,
  retenues BIGINT UNSIGNED NOT NULL DEFAULT 0,
  observation TEXT NULL,
  date_calcul DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_liquidation_dossier (dossier_id),
  CONSTRAINT fk_liquidation_dossier
    FOREIGN KEY (dossier_id) REFERENCES dossiers (id) ON DELETE CASCADE,
  CONSTRAINT fk_liquidation_agent
    FOREIGN KEY (agent_id) REFERENCES agents (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Décompte d'avance --------------------------------------------------------
CREATE TABLE IF NOT EXISTS decomptes_avance (
  id INT(11) NOT NULL AUTO_INCREMENT,
  dossier_id INT(11) NOT NULL,
  agent_id INT(11) NULL,
  -- données de base
  salaire_mensuel BIGINT UNSIGNED NOT NULL DEFAULT 0,
  indice INT UNSIGNED NULL,
  echelon SMALLINT UNSIGNED NULL,
  -- données du calcul
  avance_demandee BIGINT UNSIGNED NOT NULL DEFAULT 0,
  retenue_mensuelle BIGINT UNSIGNED NOT NULL DEFAULT 0,
  duree_mois SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  mois_rembourses SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  -- montants calculés par le service (pas de colonne générée : compatibilité
  -- MariaDB et calculs centralisés/testables côté applicatif)
  net_a_payer BIGINT UNSIGNED NOT NULL DEFAULT 0,
  reste_a_rembourser BIGINT UNSIGNED NOT NULL DEFAULT 0,
  observation TEXT NULL,
  date_calcul DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_decompte_dossier (dossier_id),
  CONSTRAINT fk_decompte_dossier
    FOREIGN KEY (dossier_id) REFERENCES dossiers (id) ON DELETE CASCADE,
  CONSTRAINT fk_decompte_agent
    FOREIGN KEY (agent_id) REFERENCES agents (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Contrôle de décompte (Chef de Division Solde) ---------------------------
CREATE TABLE IF NOT EXISTS controles_decompte (
  id INT(11) NOT NULL AUTO_INCREMENT,
  dossier_id INT(11) NOT NULL,
  controleur_id INT(11) NULL,
  decision ENUM('APPROUVE', 'RETOURNE') NOT NULL,
  -- checklist de contrôle
  calculs_verifies TINYINT(1) NOT NULL DEFAULT 0,
  pieces_justificatives TINYINT(1) NOT NULL DEFAULT 0,
  certificat_cessation TINYINT(1) NOT NULL DEFAULT 0,
  observation TEXT NULL,
  date_controle DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_controle_dossier (dossier_id),
  CONSTRAINT fk_controle_dossier
    FOREIGN KEY (dossier_id) REFERENCES dossiers (id) ON DELETE CASCADE,
  CONSTRAINT fk_controle_agent
    FOREIGN KEY (controleur_id) REFERENCES agents (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
