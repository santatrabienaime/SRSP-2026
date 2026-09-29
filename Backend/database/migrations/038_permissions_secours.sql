-- 038 : permissions propres à la Division Secours.
--
-- Les quatre étapes ajoutées en 037 (visa du CF, état d'émargement, cachet,
-- références du logiciel secours) n'ont aucune permission existante :
-- `gerer_ordonnancement` couvre l'ordonnancement, pas le visa d'un document
-- extérieur à la division. Sans permission dédiée, n'importe quel rôle
-- pourrait enregistrer un visa de contrôle financier — un acte qui atteste
-- qu'une pièce a été visée par le CF.
--
-- La signature de l'ordonnateur, elle, appartient au Chef de Service et à lui
-- seul : le donner au Chef de Division Secours lui permettrait d'authentifier sa
-- propre dépense, ce qui supprime le contrôle même que l'ordonnancement existe
-- pour assurer.

SET NAMES utf8mb4;

INSERT INTO permissions (nom, description) VALUES
  ('enregistrer_visa_cf',
   'Enregistrer et contrôler le visa du contrôle financier : numéro, signature et date.'),
  ('generer_etat_emargement',
   'Préparer les références du logiciel secours et générer l''état d''émargement des bénéficiaires.'),
  ('apposer_cachet',
   'Apposer le cachet, le titre et la date de l''ordonnateur sur les pièces de mandatement.')
ON DUPLICATE KEY UPDATE description = VALUES(description);

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.nom = 'CHEF_DIVISION_SECOURS'
  AND p.nom IN ('enregistrer_visa_cf', 'generer_etat_emargement', 'apposer_cachet');

/* Le chargé de secours prépare les fichiers de l'ordonnateur et appose le
   cachet, ce qui est matériel : c'est lui qui tient les pièces. Il ne valide
   toutefois pas le visa du CF, qui engage la conformité du dossier. */
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.nom = 'CHARGE_SECOURS'
  AND p.nom = 'apposer_cachet';

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.nom = 'ADMIN'
  AND p.nom IN ('enregistrer_visa_cf', 'generer_etat_emargement', 'apposer_cachet');
