-- 047 : la chronologie des actes du Secrétaire.
--
-- Fonctionnalité 164 du document des fonctionnalités obligatoires : « Gérer la
-- chronologie ». Elle était déclarée NON_CONSTRUITE : aucune numérotation
-- d'actes n'existait.
--
-- Un acte officiel porte un numéro. C'est ce numéro qui est cité dans les
-- dossiers, dans les lettres, dans les notes de service : « conformément à la
-- note n° NOT-2026-000007 ». Sans registre, deux actes peuvent porter le même
-- numéro, et personne ne peut dire lequel a été annulé. Le registre est donc
-- un état à part entière, pas une impression d'écran.
--
-- Le format est celui déjà imposé pour les dossiers par la fonctionnalité 27 :
-- {PREFIXE}-{ANNEE}-{6CARACTERES}. Les 6 caractères sont des chiffres, comme
-- pour les dossiers, parce que c'est ce que le service utilise déjà et que
-- changer de format entre deux familles de documents obligerait l'agent à
-- compter les chiffres.
--
-- Les types d'actes sont dans une TABLE, et non dans un ENUM. Le document ne
-- décrit pas la nomenclature complète des actes du Secrétaire : il cite des
-- bons d'entrée, des notes et des lettres. En coder davantage en dur serait
-- inventer une nomenclature ; en figer trois dans une énumération, il faudrait
-- une migration à chaque acte nouveau. Trois types sont amorcés, et le reste
-- s'ajoute par l'API.
--
-- Un acte enregistré n'est jamais supprimé, seulement annulé : son numéro fait
-- partie du registre, et le supprimer laisserait un trou que personne ne
-- pourraient expliquer.

SET NAMES utf8mb4;

-- ---------------------------------------------------------------------------
-- Types d'actes
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS types_actes (
  id INT(11) NOT NULL AUTO_INCREMENT,
  code VARCHAR(30) NOT NULL,
  libelle VARCHAR(120) NOT NULL,
  prefixe VARCHAR(10) NOT NULL,
  description TEXT NULL,
  actif TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_type_acte_code (code),
  UNIQUE KEY uk_type_acte_prefixe (prefixe)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Les trois types cités par le document. Les autres sont inconnus : ils
-- s'ajoutent par l'API, avec leur préfixe, sans migration.
INSERT INTO types_actes (code, libelle, prefixe, description)
VALUES
  ('BON_ENTREE', 'Bon d’entrée', 'BE',
   'Enregistrement d’une pièce ou d’un courrier reçu.'),
  ('NOTE', 'Note de service', 'NOT',
   'Note adressée à un agent, une division ou l’administration.'),
  ('LETTRE', 'Lettre', 'LET',
   'Correspondance formelle sortante.')
ON DUPLICATE KEY UPDATE libelle = VALUES(libelle), description = VALUES(description);

-- ---------------------------------------------------------------------------
-- Le registre
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS actes (
  id INT(11) NOT NULL AUTO_INCREMENT,
  numero VARCHAR(50) NOT NULL,
  type_acte_id INT(11) NOT NULL,
  annee SMALLINT(5) NOT NULL,
  date_acte DATE NOT NULL,
  objet VARCHAR(255) NOT NULL,
  destinataire VARCHAR(150) NULL,
  expediteur VARCHAR(150) NULL,
  dossier_id INT(11) NULL,
  division_id INT(11) NULL,
  created_by INT(11) NULL,
  -- ENREGISTRE : acte au registre.
  -- ANNULE : l'acte a existé, son numéro reste réservé et visible, il est
  --           simplement rayé. Le numéro ne revient jamais à la file.
  statut VARCHAR(20) NOT NULL DEFAULT 'ENREGISTRE',
  observations TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_acte_numero (numero),
  KEY idx_acte_type (type_acte_id),
  KEY idx_acte_annee (annee),
  KEY idx_acte_dossier (dossier_id),
  KEY idx_acte_date (date_acte),
  KEY idx_acte_statut (statut),
  -- Un numéro n'existe qu'une fois : l'unicité est dans la base, pas seulement
  -- dans le code. Deux secrétaires qui enregistrent un acte au même instant
  -- obtiennent deux numéros différents, et un numéro annulé puis réattribué est
  -- refusé par la base au lieu d'apparaître deux fois au registre.
  -- La contrainte est dans le CREATE TABLE, et non dans un ALTER après coup :
  -- un ALTER n'est pas rejouable, et la migration doit pouvoir être relancée
  -- sans échouer au second passage.
  CONSTRAINT ck_acte_statut CHECK (statut IN ('ENREGISTRE', 'ANNULE')),
  CONSTRAINT fk_acte_type FOREIGN KEY (type_acte_id) REFERENCES types_actes (id),
  CONSTRAINT fk_acte_dossier FOREIGN KEY (dossier_id) REFERENCES dossiers (id) ON DELETE SET NULL,
  CONSTRAINT fk_acte_division FOREIGN KEY (division_id) REFERENCES divisions (id) ON DELETE SET NULL,
  CONSTRAINT fk_acte_auteur FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- La permission
-- ---------------------------------------------------------------------------
-- Le document ne dit pas qui consulte le registre, seulement que la
-- Secrétaire le gère. Elle reçoit la gestion. Le Chef de Service et
-- l'administrateur lisent : un registre qui ne se consulte qu'auprès de la
-- seule personne qui le tient n'est pas un registre, c'est un carnet.
INSERT INTO permissions (nom, description)
VALUES ('gerer_chronologie_actes',
        'Enregistrer et annuler les actes du registre chronologique')
ON DUPLICATE KEY UPDATE description = VALUES(description);

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.nom IN ('SECRETAIRE', 'CHEF_SERVICE', 'ADMIN') AND p.nom = 'gerer_chronologie_actes';
