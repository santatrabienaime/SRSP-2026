-- 033_consultation_journal.sql
-- « Affichage des agents responsables avec date et heure exactes » — qui peut
-- consulter le journal des actions.
--
-- Le journal était ouvert à quiconque possède `view_all_dossiers`, c'est-à-dire
-- à presque tous les rôles, secrétaire comprise. C'était une confusion de
-- granularité : cette permission dit qu'on voit tous les DOSSIERS, pas toutes
-- les ACTIONS des autres. Concrètement, une secrétaire pouvait lire l'historique
-- des connexions, signatures et clôtures de tous les agents du service.
--
-- Le journal contient des données qui ne concernent pas son rôle : qui s'est
-- connecté, depuis quelle adresse, et sur quel dossier. On lui crée donc son
-- propre droit, `view_journal`, restreint aux rôles de pilotage.
--
-- Un chef de division reste limité à SA division par le cloisonnement appliqué
-- dans le service : la permission ouvre l'accès au journal, elle ne dit pas
-- quelles lignes sont lisibles.
--
-- La lecture de l'historique d'un dossier dans la fiche dossier ne passe pas par
-- cette permission : c'est `accesDossier` qui la gouverne, comme pour le dossier
-- lui-même. Qui peut ouvrir un dossier peut lire sa traçabilité.
--
-- Les chefs de division sont inclus : ils ont à auditer le traitement de LEURS
-- dossiers, et le service restreint déjà le journal à leur division. Leur
-- donner la permission sans le cloisonnement leur ouvrirait toutes les divisions ;
-- c'est précisément l'inverse qui est fait.

INSERT INTO permissions (nom, description)
SELECT 'view_journal', 'Consulter le journal global des actions'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE nom = 'view_journal');

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.nom = 'view_journal'
WHERE r.nom IN ('ADMIN', 'CHEF_SERVICE', 'CHEF_BAAF',
                'CHEF_DIVISION_VISA', 'CHEF_DIVISION_SOLDE',
                'CHEF_DIVISION_PENSION', 'CHEF_DIVISION_SECOURS')
  AND NOT EXISTS (
    SELECT 1 FROM role_permissions rp
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );
