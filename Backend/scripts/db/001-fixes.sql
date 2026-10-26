-- ============================================================================
-- SRSP Fitovinany — Migration de correction (001)
-- À appliquer UNE SEULE FOIS sur srsp_db.
-- ============================================================================

BEGIN;

-- 1. Fonction datediff (utilisée par le code applicatif comme si elle était
--    native, alors que PostgreSQL n'a que la soustraction de dates).
CREATE OR REPLACE FUNCTION datediff(a timestamp, b timestamp)
RETURNS integer AS $$
  SELECT (a::date - b::date)::integer;
$$ LANGUAGE SQL IMMUTABLE;

-- 2. Déduplication des notifications hors dossier.
--    Avec dossier_id NULL, la contrainte UNIQUE classique ne déduplique pas.
--    NULLS NOT DISTINCT (PG15+) traite les NULL comme égaux.
DO $$
DECLARE
  v_pg_version int;
BEGIN
  SELECT current_setting('server_version_num')::int INTO v_pg_version;

  IF v_pg_version >= 150000 THEN
    ALTER TABLE notifications
      DROP CONSTRAINT IF EXISTS notifications_user_id_dossier_id_action_key;

    ALTER TABLE notifications
      ADD CONSTRAINT notifications_user_id_dossier_id_action_key
      UNIQUE NULLS NOT DISTINCT (user_id, dossier_id, action);
    RAISE NOTICE 'Contrainte notifications : NULLS NOT DISTINCT appliquée.';
  ELSE
    -- Fallback PG14- : index unique partiel sur les lignes sans dossier
    CREATE UNIQUE INDEX IF NOT EXISTS notifications_sans_dossier_unique
      ON notifications (user_id, action)
      WHERE dossier_id IS NULL;
    RAISE NOTICE 'Contrainte notifications : index partiel appliqué (PG < 15).';
  END IF;
END $$;

-- 3. Resynchroniser les compteurs (au cas où des références auraient été
--    générées par COUNT(*)+1 en double).
DO $$
DECLARE
  r RECORD;
  v_annee int;
  v_max int;
BEGIN
  v_annee := EXTRACT(YEAR FROM CURRENT_DATE)::int;

  -- Bordereaux
  SELECT COALESCE(MAX(CAST(regexp_replace(reference::text COLLATE "C", '^.*-', '') AS INTEGER)), 0) INTO v_max
    FROM bordereaux WHERE reference COLLATE "C" LIKE 'BORD-' || v_annee || '-%';
  INSERT INTO compteurs_numerotation (cle, valeur)
    VALUES ('BORDEREAU-' || v_annee, v_max)
    ON CONFLICT (cle) DO UPDATE SET valeur = GREATEST(compteurs_numerotation.valeur, EXCLUDED.valeur);

  -- Archives
  SELECT COALESCE(MAX(CAST(regexp_replace(reference_archivage::text COLLATE "C", '^.*-', '') AS INTEGER)), 0) INTO v_max
    FROM archives WHERE reference_archivage COLLATE "C" LIKE 'ARCH-' || v_annee || '-%';
  INSERT INTO compteurs_numerotation (cle, valeur)
    VALUES ('ARCHIVE-' || v_annee, v_max)
    ON CONFLICT (cle) DO UPDATE SET valeur = GREATEST(compteurs_numerotation.valeur, EXCLUDED.valeur);

  -- Courriers
  SELECT COALESCE(MAX(CAST(regexp_replace(numero::text COLLATE "C", '^.*-', '') AS INTEGER)), 0) INTO v_max
    FROM courriers WHERE numero COLLATE "C" LIKE 'C_-' || v_annee || '-%';
  INSERT INTO compteurs_numerotation (cle, valeur)
    VALUES ('COURRIER-' || v_annee, v_max)
    ON CONFLICT (cle) DO UPDATE SET valeur = GREATEST(compteurs_numerotation.valeur, EXCLUDED.valeur);
END $$;

COMMIT;