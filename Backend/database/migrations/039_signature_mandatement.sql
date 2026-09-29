-- 039 : permission de signature des pièces de mandatement, réservée au Chef de
-- Service.
--
-- La permission existante `suivre_signature` est portée par le Chef de Division
-- Secours. La réutiliser pour autoriser la signature des pièces de mandatement
-- lui permettrait d'apposer sa propre signature sur sa propre dépense : le contrôle
-- que l'ordonnancement existe pour assurer disparaîtrait.
--
-- `suivre_signature` reste ce qu'elle signifie vraiment : SUIVRE l'état des
-- signatures, c'est-à-dire consulter qui a signé et relancer. Signer est un
-- acte d'ordonnancement, pas un suivi.
--
-- L'administrateur conserve la permission : il doit pouvoir vérifier le
-- fonctionnement de la plateforme. Il ne signe pas pour le compte du service —
-- la trace l'identifie comme lui, et le journal le montre.

SET NAMES utf8mb4;

INSERT INTO permissions (nom, description) VALUES
  ('signer_pieces_mandatement',
   'Apposer la signature de l''ordonnateur sur les pièces de mandatement d''un secours de décès.')
ON DUPLICATE KEY UPDATE description = VALUES(description);

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.nom IN ('CHEF_SERVICE', 'ADMIN')
  AND p.nom = 'signer_pieces_mandatement';

-- Archiver la copie signée est un acte MATÉRIEL, pas un acte d'ordonnancement :
-- le document (1.7, étape 5) le confie au Chef de Division Secours, qui
-- assemble le dossier. Le rattacher à `signer_pieces_mandatement` le aurait
-- réservé au Chef de Service, c'est-à-dire à celui qui n'a pas le dossier en
-- main. Permission propre, donc.
INSERT INTO permissions (nom, description) VALUES
  ('archiver_copie_mandatement',
   'Archiver la copie signée des pièces de mandatement une fois la signature apposée.')
ON DUPLICATE KEY UPDATE description = VALUES(description);

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.nom IN ('CHEF_DIVISION_SECOURS', 'ADMIN')
  AND p.nom = 'archiver_copie_mandatement';
