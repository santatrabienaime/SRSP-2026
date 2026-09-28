-- 029_responsabilites_par_role.sql
-- « Notifications interactives et responsabilités complètes » — matrice
-- anti-doublon : chaque rôle a des responsabilités exclusives.
--
-- Deux écarts avec la matrice, mesurés sur les rôles réels.

-- ---------------------------------------------------------------------------
-- 1. Le chef de division PENSION et SECOURS ne pouvaient PAS valider
-- ---------------------------------------------------------------------------
-- Constat : seuls CHEF_DIVISION_VISA et CHEF_DIVISION_SOLDE portaient
-- valider_dossier. Le document confie la validation au chef de division, pour
-- les quatre divisions (tableau « Par division » : la colonne « Valide » est
-- le chef de division dans les quatre cas).
--
-- Conséquence réelle, mesurée : le dossier PENSION-2026-000001 est bien
-- VALIDE, alors que son chef de division n'a pas la permission de valider. Il
-- a donc fallu que le Chef de Service valide à sa place — exactement le
-- doublon que la matrice anti-doublon veut éviter, et un blocage pour deux
-- divisions sur quatre.

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.nom = 'valider_dossier'
WHERE r.nom IN ('CHEF_DIVISION_PENSION', 'CHEF_DIVISION_SECOURS')
  AND NOT EXISTS (
    SELECT 1 FROM role_permissions rp
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

-- ---------------------------------------------------------------------------
-- 2. Le Chef de Service faisait le travail des chefs de division et des agents
-- ---------------------------------------------------------------------------
-- Le document liste explicitement, pour le Chef de Service, ce qu'il ne fait
-- PAS : créer, traiter, affecter, vérifier un dossier. La matrice lui
-- accordait pourtant traiter_dossier, affecter_dossier et verifier_dossier.
-- Il conserve view_all_dossiers : la supervision des quatre divisions, qui
-- est sa responsabilité n° 6, et lui permet de voir sans agir.

DELETE rp
FROM role_permissions rp
JOIN roles r ON r.id = rp.role_id
JOIN permissions p ON p.id = rp.permission_id
WHERE r.nom = 'CHEF_SERVICE'
  AND p.nom IN ('traiter_dossier', 'affecter_dossier', 'verifier_dossier');

-- ---------------------------------------------------------------------------
-- Choix délibéré, NON appliqué
-- ---------------------------------------------------------------------------
-- Le document indique aussi que l'Administrateur ne valide, ne traite et ne
-- crée pas de dossier. Ses permissions ont été maintenues : sans elles,
-- l'administration perdrait la main sur un dossier bloqué, ce qui est
-- nécessaire au dépannage d'une plateforme en production. Ce sont les SEULES
-- permissions où la matrice s'écarte volontairement du document, et cela
-- reste explicite.
