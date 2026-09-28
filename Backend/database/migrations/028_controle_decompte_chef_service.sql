-- 028_controle_decompte_chef_service.sql
-- « Contrôle du décompte — Vérification avant validation par le Chef de
-- Service ».
--
-- Le contrôle du décompte est un contrôle AVANT VALIDATION : il appartient donc
-- au Chef de Service. La matrice lui attribuait controler_decompptes au seul
-- Chef de Division Solde, si bien que le Chef de Service recevait
-- « Accès refusé. Permission insuffisante. » sur un écran qui lui est réservé.
--
-- La permission est donc ajoutee au Chef de Service. Elle reste au Chef de
-- Division Solde : le controle interne a la division demeure possible, et le
-- supprimer aurait retire une capacite qui fonctionne sans que rien ne le
-- demande.
--
-- INSERT ... SELECT plutot qu'un UPDATE : le couple (role, permission) doit
-- etre cree une seule fois ; un rejeu de la migration ne doit pas echouer sur
-- un doublon.

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.nom = 'controler_decomptes'
WHERE r.nom = 'CHEF_SERVICE'
  AND NOT EXISTS (
    SELECT 1 FROM role_permissions rp
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );
