-- Création de la base
CREATE DATABASE IF NOT EXISTS srsp_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE srsp_db;

-- Table roles
CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Table permissions
CREATE TABLE IF NOT EXISTS permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Table role_permissions
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id INT NOT NULL,
  permission_id INT NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table users
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role_id INT,
  actif BOOLEAN DEFAULT TRUE,
  derniere_connexion DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id)
) ENGINE=InnoDB;

-- Table fonctions
CREATE TABLE IF NOT EXISTS fonctions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  libelle VARCHAR(100) NOT NULL,
  description TEXT,
  UNIQUE KEY uq_fonctions_libelle (libelle)
) ENGINE=InnoDB;

-- Table divisions
CREATE TABLE IF NOT EXISTS divisions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL,
  nom VARCHAR(100) NOT NULL,
  responsable_id INT,
  actif BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Table agents
CREATE TABLE IF NOT EXISTS agents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  matricule VARCHAR(50) UNIQUE,
  fonction_id INT,
  division_id INT,
  email VARCHAR(100),
  telephone VARCHAR(30),
  actif BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (fonction_id) REFERENCES fonctions(id),
  FOREIGN KEY (division_id) REFERENCES divisions(id)
) ENGINE=InnoDB;

-- Ajouter la contrainte responsable_id sur divisions après création agents
SET @fk_exists = (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = 'divisions' AND CONSTRAINT_NAME = 'fk_division_responsable');
SET @fk_sql = IF(@fk_exists = 0,
  'ALTER TABLE divisions ADD CONSTRAINT fk_division_responsable FOREIGN KEY (responsable_id) REFERENCES agents(id) ON DELETE SET NULL',
  'SELECT 1');
PREPARE fk_stmt FROM @fk_sql;
EXECUTE fk_stmt;
DEALLOCATE PREPARE fk_stmt;

-- Table types_dossiers
CREATE TABLE IF NOT EXISTS types_dossiers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) UNIQUE,
  libelle VARCHAR(100) NOT NULL,
  description TEXT,
  actif BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB;

-- Table statuts_dossiers
CREATE TABLE IF NOT EXISTS statuts_dossiers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  libelle VARCHAR(100) NOT NULL,
  ordre INT DEFAULT 0
) ENGINE=InnoDB;

-- Table priorites
CREATE TABLE IF NOT EXISTS priorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  libelle VARCHAR(50) NOT NULL,
  niveau INT DEFAULT 1,
  UNIQUE KEY uq_priorites_libelle (libelle)
) ENGINE=InnoDB;

-- Table dossiers
CREATE TABLE IF NOT EXISTS dossiers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  numero VARCHAR(50) UNIQUE NOT NULL,
  type_id INT,
  objet TEXT NOT NULL,
  demandeur VARCHAR(150) NOT NULL,
  matricule VARCHAR(50),
  date_reception DATE NOT NULL,
  division_id INT,
  priorite_id INT,
  statut_id INT,
  agent_responsable_id INT,
  observation TEXT,
  date_cloture DATE,
  date_archivage DATE,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (type_id) REFERENCES types_dossiers(id),
  FOREIGN KEY (division_id) REFERENCES divisions(id),
  FOREIGN KEY (priorite_id) REFERENCES priorites(id),
  FOREIGN KEY (statut_id) REFERENCES statuts_dossiers(id),
  FOREIGN KEY (agent_responsable_id) REFERENCES agents(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB;

-- Table types_documents
CREATE TABLE IF NOT EXISTS types_documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  libelle VARCHAR(100) NOT NULL,
  extensions_autorisees VARCHAR(255) DEFAULT 'pdf,jpg,jpeg,png,docx,xlsx',
  taille_max INT DEFAULT 10485760,
  UNIQUE KEY uq_types_documents_libelle (libelle)
) ENGINE=InnoDB;

-- Table documents
CREATE TABLE IF NOT EXISTS documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dossier_id INT,
  courrier_id INT,
  type_id INT,
  nom_fichier VARCHAR(255) NOT NULL,
  chemin_stockage VARCHAR(500) NOT NULL,
  taille INT,
  valide BOOLEAN DEFAULT FALSE,
  upload_par INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (dossier_id) REFERENCES dossiers(id) ON DELETE CASCADE,
  FOREIGN KEY (type_id) REFERENCES types_documents(id),
  FOREIGN KEY (upload_par) REFERENCES users(id)
) ENGINE=InnoDB;

-- Table types_courriers
CREATE TABLE IF NOT EXISTS types_courriers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  libelle VARCHAR(100) NOT NULL,
  UNIQUE KEY uq_types_courriers_libelle (libelle)
) ENGINE=InnoDB;

-- Table courriers
CREATE TABLE IF NOT EXISTS courriers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  numero VARCHAR(50) UNIQUE NOT NULL,
  type_id INT,
  sens ENUM('ENTRANT', 'SORTANT') NOT NULL,
  expediteur VARCHAR(150),
  destinataire VARCHAR(150),
  objet TEXT NOT NULL,
  division_id INT,
  statut VARCHAR(50) DEFAULT 'RECU',
  document_id INT,
  dossier_id INT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (type_id) REFERENCES types_courriers(id),
  FOREIGN KEY (division_id) REFERENCES divisions(id),
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE SET NULL,
  FOREIGN KEY (dossier_id) REFERENCES dossiers(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB;

-- Migration idempotente : index uniques sur les tables de référence
-- (évite les doublons lors des ré-initialisations répétées)
SET @idx_priorites = (SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'priorites' AND INDEX_NAME = 'uq_priorites_libelle');
SET @sql_priorites = IF(@idx_priorites = 0,
  'ALTER TABLE priorites ADD UNIQUE KEY uq_priorites_libelle (libelle)', 'SELECT 1');
PREPARE stmt FROM @sql_priorites; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_fonctions = (SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'fonctions' AND INDEX_NAME = 'uq_fonctions_libelle');
SET @sql_fonctions = IF(@idx_fonctions = 0,
  'ALTER TABLE fonctions ADD UNIQUE KEY uq_fonctions_libelle (libelle)', 'SELECT 1');
PREPARE stmt FROM @sql_fonctions; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_tc = (SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'types_courriers' AND INDEX_NAME = 'uq_types_courriers_libelle');
SET @sql_tc = IF(@idx_tc = 0,
  'ALTER TABLE types_courriers ADD UNIQUE KEY uq_types_courriers_libelle (libelle)', 'SELECT 1');
PREPARE stmt FROM @sql_tc; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_td = (SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'types_documents' AND INDEX_NAME = 'uq_types_documents_libelle');
SET @sql_td = IF(@idx_td = 0,
  'ALTER TABLE types_documents ADD UNIQUE KEY uq_types_documents_libelle (libelle)', 'SELECT 1');
PREPARE stmt FROM @sql_td; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Table affectations
CREATE TABLE IF NOT EXISTS affectations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dossier_id INT NOT NULL,
  division_id INT,
  agent_id INT,
  motif TEXT,
  date_affectation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (dossier_id) REFERENCES dossiers(id) ON DELETE CASCADE,
  FOREIGN KEY (division_id) REFERENCES divisions(id),
  FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Table transferts
CREATE TABLE IF NOT EXISTS transferts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dossier_id INT NOT NULL,
  ancien_agent_id INT,
  nouveau_agent_id INT,
  motif TEXT,
  date_transfert TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (dossier_id) REFERENCES dossiers(id) ON DELETE CASCADE,
  FOREIGN KEY (ancien_agent_id) REFERENCES agents(id) ON DELETE SET NULL,
  FOREIGN KEY (nouveau_agent_id) REFERENCES agents(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Table traitements
CREATE TABLE IF NOT EXISTS traitements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dossier_id INT NOT NULL,
  agent_id INT,
  date_debut TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_fin TIMESTAMP,
  observation TEXT,
  FOREIGN KEY (dossier_id) REFERENCES dossiers(id) ON DELETE CASCADE,
  FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Table verifications
CREATE TABLE IF NOT EXISTS verifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dossier_id INT NOT NULL,
  agent_id INT,
  resultat VARCHAR(50),
  observation TEXT,
  date_verification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (dossier_id) REFERENCES dossiers(id) ON DELETE CASCADE,
  FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Table validations
CREATE TABLE IF NOT EXISTS validations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dossier_id INT NOT NULL,
  valide_par INT,
  decision VARCHAR(50),
  commentaire TEXT,
  date_validation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (dossier_id) REFERENCES dossiers(id) ON DELETE CASCADE,
  FOREIGN KEY (valide_par) REFERENCES users(id)
) ENGINE=InnoDB;

-- Table notifications
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type VARCHAR(50),
  message TEXT NOT NULL,
  lien VARCHAR(255),
  lu BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table historique_actions
CREATE TABLE IF NOT EXISTS historique_actions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  action VARCHAR(100) NOT NULL,
  dossier_id INT,
  ancienne_valeur TEXT,
  nouvelle_valeur TEXT,
  details TEXT,
  date_action TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (dossier_id) REFERENCES dossiers(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table archives
CREATE TABLE IF NOT EXISTS archives (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dossier_id INT NOT NULL,
  date_archivage TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  archive_par INT,
  motif TEXT,
  restaure BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (dossier_id) REFERENCES dossiers(id) ON DELETE CASCADE,
  FOREIGN KEY (archive_par) REFERENCES users(id)
) ENGINE=InnoDB;