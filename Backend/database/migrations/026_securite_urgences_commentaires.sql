-- 026_securite_urgences_commentaires.sql
-- Articles 1.5, 2.4, 2.8 et 4.4 du rapport explicatif.

-- 1.5 : renouvellement obligatoire du mot de passe -----------------------
ALTER TABLE users
  ADD COLUMN mot_de_passe_change_le DATETIME NULL DEFAULT NULL AFTER derniere_connexion;

-- 2.4 / 4.4 : date limite d'un dossier (echeance) --------------------------
ALTER TABLE dossiers
  ADD COLUMN date_limite DATE NULL DEFAULT NULL AFTER date_reception,
  ADD KEY idx_dossier_echeance (date_limite);

-- 2.8 : commentaires internes sur un dossier --------------------------------
-- Un commentaire peut en mentionner un autre via la table mentions.
CREATE TABLE IF NOT EXISTS dossier_commentaires (
  id INT(11) NOT NULL AUTO_INCREMENT,
  dossier_id INT(11) NOT NULL,
  auteur_id INT(11) NOT NULL,
  contenu TEXT NOT NULL,
  date_creation TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  modifie_le DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_commentaire_dossier (dossier_id),
  CONSTRAINT fk_commentaire_dossier
    FOREIGN KEY (dossier_id) REFERENCES dossiers (id) ON DELETE CASCADE,
  CONSTRAINT fk_commentaire_auteur
    FOREIGN KEY (auteur_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Mentions « @utilisateur » : un commentaire peut viser plusieurs personnes.
CREATE TABLE IF NOT EXISTS commentaire_mentions (
  commentaire_id INT(11) NOT NULL,
  user_id INT(11) NOT NULL,
  PRIMARY KEY (commentaire_id, user_id),
  KEY idx_mention_user (user_id),
  CONSTRAINT fk_mention_commentaire
    FOREIGN KEY (commentaire_id) REFERENCES dossier_commentaires (id) ON DELETE CASCADE,
  CONSTRAINT fk_mention_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4.1 : délégation temporaire des dossiers d'un agent -----------------------
CREATE TABLE IF NOT EXISTS delegations (
  id INT(11) NOT NULL AUTO_INCREMENT,
  agent_id INT(11) NOT NULL,
  remplacant_id INT(11) NOT NULL,
  date_debut DATE NOT NULL,
  date_fin DATE NOT NULL,
  motif VARCHAR(200) NULL,
  created_by INT(11) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_delegation_agent (agent_id),
  KEY idx_delegation_remplacant (remplacant_id),
  CONSTRAINT fk_delegation_agent
    FOREIGN KEY (agent_id) REFERENCES agents (id) ON DELETE CASCADE,
  CONSTRAINT fk_delegation_remplacant
    FOREIGN KEY (remplacant_id) REFERENCES agents (id) ON DELETE CASCADE,
  CONSTRAINT fk_delegation_auteur
    FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
