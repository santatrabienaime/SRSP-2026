-- 031_consultation_archives.sql
-- « Recherche et tri dans les archives » — qui peut consulter les archives.
--
-- Le document distingue deux droits qu'une seule permission confondait :
--   - CONSULTER les archives : Chef de Service, Administrateur, et Chef de
--     Division pour SA division ;
--   - ARCHIVER un dossier : Chef de Service et Administrateur seulement.
--
-- Or il n'existait qu'archiver_dossier (Chef de Service, Administrateur). Les
-- chefs de division ne pouvaient donc pas consulter les archives de leur
-- propre division, ce que le document leur accorde explicitement.
--
-- view_archives est la permission de LECTURE. Elle ouvre la consultation, sans
-- donner le droit d'archiver ni de restaurer, qui restent sur archiver_dossier.
-- L'accès d'un chef de division est de plus restreint à sa division côté
-- serveur (cloisonnement), ce qu'aucune permission ne peut garantir.

INSERT INTO permissions (nom, description)
SELECT 'view_archives', 'Consulter les archives'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE nom = 'view_archives');

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.nom = 'view_archives'
WHERE r.nom IN ('ADMIN', 'CHEF_SERVICE', 'CHEF_DIVISION_VISA', 'CHEF_DIVISION_SOLDE',
                'CHEF_DIVISION_PENSION', 'CHEF_DIVISION_SECOURS')
  AND NOT EXISTS (
    SELECT 1 FROM role_permissions rp
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );
