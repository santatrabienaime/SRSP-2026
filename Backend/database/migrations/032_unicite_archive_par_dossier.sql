-- 032_unicite_archive_par_dossier.sql
-- « Recherche et tri dans les archives » — un dossier = une archive.
--
-- Deux défauts se sont révélés à la mise en place de la recherche :
--
-- 1. La restauration marquait `archives.restaure` à partir de l'identifiant
--    du DOSSIER et non de celui de la LIGNE D'ARCHIVE. Comme le dossier
--    visé avait par exemple l'identifiant 10 et les archives allaient de 1 à 8,
--    l'ordre UPDATE ne touchait aucune ligne : la restauration semblait
--    réussie (le dossier repassait bien en clôture) mais l'archive restait
--    présente aux archives. Erreur silencieuse, sans trace.
--
-- 2. Réarchiver un dossier restauré INSÉRAIT une seconde ligne au lieu de
--    réutiliser la précédente. Chaque aller-retour restauration/archivage
--    augmentait donc le nombre d'archives, et un dossier pouvait apparaître
--    plusieurs fois dans les résultats — faussant à la fois le compte
--    affiché et les statistiques.
--
-- La contrainte d'unicité ci-dessous ferme la seconde voie : désormais un
-- second archivage du même dossier est refusé par la base, et non seulement
-- évité par le code applicatif. Un dossier ne peut avoir qu'une archive, et
-- donc n'apparaître qu'une fois.
--
-- Les doublons éventuels sont purgés avant de poser la contrainte, en ne
-- gardant que la ligne la plus récente (c'est celle qui reflète l'état réel).

DELETE a_ancien
FROM archives a_ancien
JOIN archives a_recent
  ON a_ancien.dossier_id = a_recent.dossier_id
 AND a_ancien.id < a_recent.id;

-- La colonne existe déjà sur certaines installations : ne pas la dupliquer.
SET @contrainteExiste := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'archives'
    AND INDEX_NAME = 'uq_archives_dossier'
);

SET @sql := IF(
  @contrainteExiste > 0,
  'SELECT 1',
  'ALTER TABLE archives ADD UNIQUE KEY uq_archives_dossier (dossier_id)'
);

PREPARE requete FROM @sql;
EXECUTE requete;
DEALLOCATE PREPARE requete;
