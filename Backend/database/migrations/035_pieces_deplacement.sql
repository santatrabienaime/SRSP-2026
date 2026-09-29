-- 035 : Chef BAAF — ordres de route et de mission, et pieces de deplacement.
--
-- Le Chef BAAF etablit les ordres de route, les ordres de mission, les
-- autorisations de retrait de bon de caisse et les notes d'interim, puis les
-- fait signer par le Chef de Service.
--
-- Regle centrale : un ordre porte sur UN agent et UN dossier. La piece de
-- deplacement n'a pas de sens isolee d'une mission, et un ordre sans dossier
-- rattache ne peut etre ni verifie ni controle a posteriori. La colonne
-- dossier_id est donc NOT NULL.

SET NAMES utf8mb4;

-- Types de pieces de deplacement. Un tableau de reference plutot qu'un ENUM :
-- ajouter un type ne doit pas exiger de modifier la structure d'une table
-- deja peuplee, ce qu'un ALTER sur un ENUM impose.
CREATE TABLE IF NOT EXISTS types_pieces_deplacement (
  id INT(11) NOT NULL AUTO_INCREMENT,
  code VARCHAR(30) NOT NULL,
  libelle VARCHAR(150) NOT NULL,
  description TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_type_piece_dep_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO types_pieces_deplacement (code, libelle, description) VALUES
  ('ORDRE_ROUTE',    'Ordre de route',                       'Autorisation de ciruler pour une mission hors du ressort.'),
  ('ORDRE_MISSION',  'Ordre de mission',                     'Instruction de se rendre sur un lieu et d y accomplir une tache.'),
  ('AUTORISATION_BC','Autorisation de retrait de bon de caisse','Retrait d un bon de caisse pour une depense de mission.'),
  ('NOTE_INTERIM',   'Note d interim',                       'Assurance temporaire d un agent absent.')
ON DUPLICATE KEY UPDATE libelle = VALUES(libelle), description = VALUES(description);

-- Ordres et notes de deplacement.
CREATE TABLE IF NOT EXISTS ordres_deplacement (
  id INT(11) NOT NULL AUTO_INCREMENT,
  numero VARCHAR(50) NOT NULL,
  type_id INT(11) NOT NULL,
  dossier_id INT(11) NOT NULL,

  -- Agent qui voyage. Un ordre porte sur une personne identifiee : sans CIN, on
  -- ne sait pas qui est parti, ni a qui le decompte sera verse au retour.
  agent_id INT(11) NOT NULL,
  cin_agent VARCHAR(20) NULL,

  -- Lieu et periode. La date de retour est obligatoire des que la mission n est
  -- plus une simple day's excursion : c est elle qui declenche le calcul du
  -- delai, et le delai declenche la demande de bon de caisse.
  lieu_depart VARCHAR(200) NOT NULL,
  lieu_destination VARCHAR(200) NOT NULL,
  date_depart DATE NOT NULL,
  date_retour DATE NOT NULL,

  objet VARCHAR(500) NOT NULL,
  observations TEXT NULL,

  -- Montant de l avance eventuellement accordee. NULL et non 0 : une avance
  -- non mentionnee n est pas une avance de zero, c est une avance inconnue.
  montant_avance DECIMAL(15,2) NULL,

  -- Circuit de validation : redige, soumis au Chef de Service, signe, execute,
  -- cloture au retour.
  statut ENUM('REDIGE', 'SOUMIS', 'SIGNE', 'EXECUTEE', 'CLOTUREE', 'REJETEE')
    NOT NULL DEFAULT 'REDIGE',

  -- Identification de la signature. Signe comme un dossier, avec une reference
  -- que l agent peut verifier aupres du service : « SIG-2026-0007 ».
  reference_signature VARCHAR(100) NULL,
  signe_par INT(11) NULL,
  signe_le DATETIME NULL,

  -- Cloture au retour : la mission a-t-elle eu lieu, et a-t-elle couté ce qui
  -- etait prevu. Sans ces trois champs, un ordre signe puis jamais reexecute ne
  -- laisse aucune trace de ce qu il est devenu.
  executee_le DATE NULL,
  montant_reel DECIMAL(15,2) NULL,
  motif_cloture VARCHAR(500) NULL,

  cree_par INT(11) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uk_ordre_dep_numero (numero),
  KEY idx_ordre_dep_type (type_id),
  KEY idx_ordre_dep_dossier (dossier_id),
  KEY idx_ordre_dep_agent (agent_id),
  KEY idx_ordre_dep_statut (statut),
  KEY idx_ordre_dep_dates (date_depart, date_retour),

  CONSTRAINT fk_ordre_dep_type FOREIGN KEY (type_id) REFERENCES types_pieces_deplacement (id),
  CONSTRAINT fk_ordre_dep_dossier FOREIGN KEY (dossier_id) REFERENCES dossiers (id) ON DELETE CASCADE,
  CONSTRAINT fk_ordre_dep_agent FOREIGN KEY (agent_id) REFERENCES agents (id),
  CONSTRAINT fk_ordre_dep_signe_par FOREIGN KEY (signe_par) REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT fk_ordre_dep_cree_par FOREIGN KEY (cree_par) REFERENCES users (id),

  -- Une date de retour anterieure a la date de depart rend l ordre inexecutable :
  -- on ne peut pas revenir avant d etre parti. Cette contrainte est dans la
  -- base, pas seulement dans le formulaire, parce qu une saisie par import ou
  -- par script ne passe pas par le formulaire.
  CONSTRAINT ck_ordre_dep_dates CHECK (date_retour >= date_depart),
  CONSTRAINT ck_ordre_dep_montants CHECK (montant_avance IS NULL OR montant_avance >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Rejouabilite : une migration doit pouvoir passer deux fois sans effet de bord.
SET @sql := (
  SELECT IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'ordres_deplacement'
        AND COLUMN_NAME = 'reference_signature') = 0,
    'ALTER TABLE ordres_deplacement ADD COLUMN reference_signature VARCHAR(100) NULL AFTER statut',
    'SELECT 1'
  )
);
PREPARE requete FROM @sql; EXECUTE requete; DEALLOCATE PREPARE requete;
