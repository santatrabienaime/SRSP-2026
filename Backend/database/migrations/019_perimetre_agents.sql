-- 019_perimetre_agents.sql
-- Les rôles agents (Vérificateur, Liquidateur, Chargé de Secours) ne doivent voir
-- QUE les dossiers dont ils sont responsables (view_assigned_dossiers).
-- Ils ne doivent pas disposer de view_all_dossiers, qui exposait les dossiers
-- des autres divisions (défaut de cloisonnement inter-division).

DELETE rp
FROM role_permissions rp
JOIN permissions p ON p.id = rp.permission_id
JOIN roles r ON r.id = rp.role_id
WHERE p.nom = 'view_all_dossiers'
  AND r.nom IN (
    'VERIFICATEUR_VISA',
    'VERIFICATEUR_SOLDE',
    'LIQUIDATEUR_PENSION',
    'CHARGE_SECOURS'
  );
