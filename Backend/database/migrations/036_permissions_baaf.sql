-- 036 : permissions propres au Chef BAAF.
--
-- Les permissions existantes (`manage_personnel`, `consolidate_reports`) sont trop
-- larges : `manage_personnel` couvre l'administration des agents, pas l'etablissement
-- d'un ordre de route. Sans permission dediee, un role quinee possessing
-- `manage_personnel` pourrait etablir des ordres de deplacement — pieces
-- officielles engageant le service.
--
-- Trois permissions, et non une : etablir, signer, executer. La signature engage
-- la responsabilite du Chef de Service et ne peut pas appartenir au meme role que
-- la redaction, sans quoi la separation des fonctions que suppose un ordre de
-- mission disparait.

SET NAMES utf8mb4;

INSERT INTO permissions (nom, description) VALUES
  ('etablir_pieces_deplacement',
   'Etablir les ordres de route, ordres de mission, autorisations de retrait de bon de caisse et notes d interim.'),
  ('signer_pieces_deplacement',
   'Signer une piece de deplacement et y apposer la reference de signature.'),
  ('executer_pieces_deplacement',
   'Declarer une piece de deplacement executee et la cloturer au retour.')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- Le Chef BAAF etablit et execute ; il ne signe pas : la signature appartient au
-- Chef de Service. Lui donner `signer_pieces_deplacement` lui permettrait d'apposer
-- sa propre signature sur une piece qu il a redigee.
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.nom = 'CHEF_BAAF'
  AND p.nom IN ('etablir_pieces_deplacement', 'executer_pieces_deplacement');

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.nom = 'CHEF_SERVICE'
  AND p.nom = 'signer_pieces_deplacement';

-- L'administrateur configure la plateforme : il doit pouvoir voir les pieces
-- pour verifier le fonctionnement, sans les etablir pour le compte du service.
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.nom = 'ADMIN'
  AND p.nom IN ('etablir_pieces_deplacement', 'signer_pieces_deplacement', 'executer_pieces_deplacement');
