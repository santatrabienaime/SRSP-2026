-- 027_libelles_types_dossiers.sql
-- Routage automatique : le libelle d'un TYPE ne doit pas reprendre le nom de
-- la DIVISION. types_dossiers.libelle vaut « Division Visa » : dans le
-- formulaire de creation, l'utilisateur choisissait donc une « Division Visa »
-- comme type, ce qui confondait le type et sa division.
--
-- On aligne le libelle sur le type (Visa, Solde, Pension, Secours) et la
-- description sur la portee metier decrite dans le document de routage.
-- La correspondance type -> division, elle, reste portee par
-- divisions.type_dossier_id : elle n'est pas ecrite en dur ici.

UPDATE types_dossiers SET
  libelle = 'Visa',   description = 'Intégration, avancement'                 WHERE code = 'VISA';
UPDATE types_dossiers SET
  libelle = 'Solde',  description = 'Salaire, mandatement'                   WHERE code = 'SOLDE';
UPDATE types_dossiers SET
  libelle = 'Pension', description = 'Retraite'                              WHERE code = 'PENSION';
UPDATE types_dossiers SET
  libelle = 'Secours', description = 'Décès, aide famille'                   WHERE code = 'SECOURS';
