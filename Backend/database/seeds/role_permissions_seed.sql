USE srsp_db;

-- ADMIN : toutes les permissions
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p
WHERE r.nom = 'ADMIN' AND p.nom IN (
  'dossier.creer', 'dossier.modifier', 'dossier.supprimer', 'dossier.affecter',
  'dossier.traiter', 'dossier.verifier', 'dossier.valider', 'dossier.cloturer',
  'dossier.archiver', 'user.gerer', 'role.gerer', 'division.gerer', 'agent.gerer', 'courrier.gerer'
);

-- CHEF_SERVICE : supervision, traitement, vérification, validation, clôture, archivage
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p
WHERE r.nom = 'CHEF_SERVICE' AND p.nom IN (
  'dossier.creer', 'dossier.modifier', 'dossier.traiter', 'dossier.verifier',
  'dossier.valider', 'dossier.cloturer', 'dossier.archiver'
);

-- CHEF_BAAF et COORDINATRICE
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p
WHERE r.nom IN ('CHEF_BAAF', 'COORDINATRICE') AND p.nom IN (
  'dossier.creer', 'dossier.modifier', 'dossier.traiter', 'dossier.verifier',
  'dossier.valider', 'dossier.archiver', 'courrier.gerer'
);

-- SECRETAIRE : réception, enregistrement, distribution/orientation, clôture, courriers
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p
WHERE r.nom = 'SECRETAIRE' AND p.nom IN (
  'dossier.creer', 'dossier.modifier', 'dossier.affecter', 'dossier.cloturer',
  'dossier.archiver', 'courrier.gerer'
);

-- CHEFS DE DIVISION : affectation, traitement, vérification, validation, clôture, archivage
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p
WHERE r.nom IN ('CHEF_DIVISION_VISA', 'CHEF_DIVISION_SOLDE', 'CHEF_DIVISION_PENSION', 'CHEF_DIVISION_SECOURS')
  AND p.nom IN (
    'dossier.affecter', 'dossier.traiter', 'dossier.verifier',
    'dossier.valider', 'dossier.cloturer', 'dossier.archiver', 'courrier.gerer'
  );

-- AGENTS DE TRAITEMENT (vérificateurs, liquidateurs, chargés)
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p
WHERE r.nom IN ('VERIFICATEUR_VISA', 'VERIFICATEUR_SOLDE', 'LIQUIDATEUR_PENSION', 'CHARGE_SECOURS')
  AND p.nom IN ('dossier.traiter', 'dossier.verifier', 'dossier.archiver');