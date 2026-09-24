-- 020_depouillement.sql
-- Dépouillement des pièces d'un dossier de secours (rôle Chargé de Secours).
-- Le cahier des charges liste 6 pièces obligatoires à contrôler.

CREATE TABLE IF NOT EXISTS depouillements (
  id INT(11) NOT NULL AUTO_INCREMENT,
  dossier_id INT(11) NOT NULL,
  agent_id INT(11) NULL,
  -- pièce contrôlée
  piece VARCHAR(80) NOT NULL,
  presente TINYINT(1) NOT NULL DEFAULT 0,
  observation TEXT NULL,
  date_controle DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_depouillement_dossier_piece (dossier_id, piece),
  KEY idx_depouillements_piece (piece),
  CONSTRAINT fk_depouillements_dossier
    FOREIGN KEY (dossier_id) REFERENCES dossiers (id) ON DELETE CASCADE,
  CONSTRAINT fk_depouillements_agent
    FOREIGN KEY (agent_id) REFERENCES agents (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Pièces officielles : sert de référentiel et évite de_dupliquer les libellés.
CREATE TABLE IF NOT EXISTS types_pieces (
  id INT(11) NOT NULL AUTO_INCREMENT,
  code VARCHAR(50) NOT NULL,
  libelle VARCHAR(150) NOT NULL,
  obligatoire TINYINT(1) NOT NULL DEFAULT 1,
  division_code VARCHAR(30) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_type_piece_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Checklist « dossier de secours » du cahier des charges.
INSERT INTO types_pieces (code, libelle, obligatoire, division_code) VALUES
  ('ACTE_DECES',   'Acte de décès',                 1, 'SECOURS'),
  ('ACTE_MARIAGE', 'Acte de mariage',               1, 'SECOURS'),
  ('CERT_NSC',     'Certificat de NSC',             1, 'SECOURS'),
  ('CERT_NDIV',    'Certificat de non-divorce',     1, 'SECOURS'),
  ('CIN_DEFUNT',   'CIN du défunt',                 1, 'SECOURS'),
  ('CIN_BENEF',    'CIN du bénéficiaire',           1, 'SECOURS')
ON DUPLICATE KEY UPDATE libelle = VALUES(libelle), obligatoire = VALUES(obligatoire);
