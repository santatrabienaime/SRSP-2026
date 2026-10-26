-- Migration : ajout de l'état « Rejetée » au dépouillement des pièces.
--
-- Le code historique de l'absence reste `MANQUANTE` : seul son libellé
-- affiché devient « Absente ». L'état `REJETEE` distingue une pièce présente
-- mais refusée (non conforme, expirée, falsifiée) d'une pièce absente.
--
-- À appliquer sur une base existante avant de démarrer la version qui
-- propose le bouton « Rejetée ». Le dump `database/srsp_db.sql` contient déjà
-- cette contrainte pour une restauration neuve.

BEGIN;

ALTER TABLE public.depouillements
  DROP CONSTRAINT IF EXISTS chk_depouillements_etat;

ALTER TABLE public.depouillements
  ADD CONSTRAINT chk_depouillements_etat
  CHECK (etat IN (
    'PRESENTE',
    'MANQUANTE',
    'REJETEE',
    'ILLISIBLE',
    'A_CORRIGER',
    'NON_APPLICABLE'
  ));

COMMIT;
