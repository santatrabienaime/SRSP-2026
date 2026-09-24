-- 022_dépouillement_officiel_mandatement_correspondances.sql
-- Aligne le dépouillement sur la source officielle (REF-ATTRIB, Chargés de Secours)
-- qui distingue DEUX listes :
--   1. Dépouillement des pièces reçues du contrôle financier (PGA) :
--      Décision, État de décompte, CCETPP, Demande de l'intéressé(e)
--   2. Archivage des pièces du dossier de décès :
--      Actes de décès/mariage, Certificats NSC et NDiv, CIN
-- Ajoute le mandatement (division Secours) et les correspondances (division Pension).

-- 1. Phase de la pièce : dépouiller ou archiver --------------------------------
ALTER TABLE types_pieces
  ADD COLUMN phase ENUM('DEPOUILLEMENT','ARCHIVAGE') NOT NULL DEFAULT 'ARCHIVAGE' AFTER obligatoire,
  ADD COLUMN ordre SMALLINT UNSIGNED NOT NULL DEFAULT 0 AFTER phase;

-- Les 6 pièces existantes (actes, certificats, CIN) relèvent de l'archivage.
UPDATE types_pieces SET phase = 'ARCHIVAGE' WHERE code IN
  ('ACTE_DECES','ACTE_MARIAGE','CERT_NSC','CERT_NDIV','CIN_DEFUNT','CIN_BENEF');
UPDATE types_pieces SET ordre = 10 WHERE code = 'ACTE_DECES';
UPDATE types_pieces SET ordre = 20 WHERE code = 'ACTE_MARIAGE';
UPDATE types_pieces SET ordre = 30 WHERE code = 'CERT_NSC';
UPDATE types_pieces SET ordre = 40 WHERE code = 'CERT_NDIV';
UPDATE types_pieces SET ordre = 50 WHERE code = 'CIN_DEFUNT';
UPDATE types_pieces SET ordre = 60 WHERE code = 'CIN_BENEF';

-- Pièces à dépouiller (reçues du contrôle financier).
INSERT INTO types_pieces (code, libelle, obligatoire, division_code, phase, ordre) VALUES
  ('DECISION',          'Décision visée par le contrôle financier', 1, 'SECOURS', 'DEPOUILLEMENT', 10),
  ('ETAT_DECOMPTE',     'État de décompte',                          1, 'SECOURS', 'DEPOUILLEMENT', 20),
  ('CCETPP',            'CCETPP',                                     1, 'SECOURS', 'DEPOUILLEMENT', 30),
  ('DEMANDE_INTERESSE', 'Demande de l\'intéressé(e)',                 1, 'SECOURS', 'DEPOUILLEMENT', 40)
ON DUPLICATE KEY UPDATE
  libelle = VALUES(libelle), phase = VALUES(phase), ordre = VALUES(ordre);

-- 2. Mandatement (Chef de Division Secours) -----------------------------------
CREATE TABLE IF NOT EXISTS mandatements (
  id INT(11) NOT NULL AUTO_INCREMENT,
  dossier_id INT(11) NOT NULL,
  montant_total BIGINT UNSIGNED NOT NULL DEFAULT 0,
  -- états de la chaîne de traitement
  etat ENUM('BROUILLON','A_ORDONNANCER','ORDONNANCE','LIQUIDE')
      NOT NULL DEFAULT 'BROUILLON',
  ordonnancement_date DATETIME NULL,
  ordonnateur_id INT(11) NULL,
  liquidation_date DATETIME NULL,
  observation TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_mandatement_dossier (dossier_id),
  CONSTRAINT fk_mandatement_dossier
    FOREIGN KEY (dossier_id) REFERENCES dossiers (id) ON DELETE CASCADE,
  CONSTRAINT fk_mandatement_ordonnateur
    FOREIGN KEY (ordonnateur_id) REFERENCES agents (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Bénéficiaires : la quote-part de chacun doit totaliser 100 %.
CREATE TABLE IF NOT EXISTS mandatement_beneficiaires (
  id INT(11) NOT NULL AUTO_INCREMENT,
  mandatement_id INT(11) NOT NULL,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NULL,
  lien VARCHAR(60) NULL,
  quote_part DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  montant DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  matricule VARCHAR(50) NULL,
  PRIMARY KEY (id),
  KEY idx_beneficiaire_mandatement (mandatement_id),
  CONSTRAINT fk_beneficiaire_mandatement
    FOREIGN KEY (mandatement_id) REFERENCES mandatements (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Pièces à imprimer lors du mandatement.
CREATE TABLE IF NOT EXISTS mandatement_pieces (
  code VARCHAR(50) NOT NULL,
  libelle VARCHAR(150) NOT NULL,
  ordre SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Suivi de production/édition de chaque pièce pour un mandatement.
CREATE TABLE IF NOT EXISTS mandatement_pieces_etat (
  mandatement_id INT(11) NOT NULL,
  piece_code VARCHAR(50) NOT NULL,
  -- nom sans accent : évite les pièges d'encodage d'identifiants SQL
  imprimee TINYINT(1) NOT NULL DEFAULT 0,
  date_impression DATETIME NULL,
  PRIMARY KEY (mandatement_id, piece_code),
  CONSTRAINT fk_piece_etat_mandatement
    FOREIGN KEY (mandatement_id) REFERENCES mandatements (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Les 8 pièces du mandatement (source officielle).
INSERT INTO mandatement_pieces (code, libelle, ordre) VALUES
  ('TEF',                'TEF (Titre d\' Engagement de Dépense)',   10),
  ('MANDAT',             'Mandat de paiement',                       20),
  ('BON_CAISSE',         'Bon de caisse',                            30),
  ('BORDEREAU_PIECES',   'Bordereau des pièces',                    40),
  ('BORD_EMISSIONS',     'Bord d\'émissions',                        50),
  ('BORD_MANDATS',       'Bord de mandats',                          60),
  ('ETAT_EMARGEMENT',    'État d\'émargement',                        70),
  ('TICKET_MANDATEMENT', 'Tickets de mandatement',                   80)
ON DUPLICATE KEY UPDATE libelle = VALUES(libelle), ordre = VALUES(ordre);

-- 3. Correspondances (Chef de Division Pensions) -----------------------------
CREATE TABLE IF NOT EXISTS correspondances (
  id INT(11) NOT NULL AUTO_INCREMENT,
  dossier_id INT(11) NULL,
  type ENUM('LETTRE_PRESCRIPTION','DEMANDE_DOSSIERE_MERE',
            'OPPOSITION_PENSION_ALIMENTAIRE','OPPOSITION_CESSION_VOLONTAIRE',
            'OPPOSITION_SAISIE_ARRET')
      NOT NULL,
  destinataire VARCHAR(150) NOT NULL,
  objet VARCHAR(200) NOT NULL,
  contenu TEXT NULL,
  etat ENUM('BROUILLON','ENVOYEE') NOT NULL DEFAULT 'BROUILLON',
  date_envoi DATETIME NULL,
  created_by INT(11) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_correspondance_dossier (dossier_id),
  KEY idx_correspondance_type (type),
  CONSTRAINT fk_correspondance_dossier
    FOREIGN KEY (dossier_id) REFERENCES dossiers (id) ON DELETE CASCADE,
  CONSTRAINT fk_correspondance_auteur
    FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
