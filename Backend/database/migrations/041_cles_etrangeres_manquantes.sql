-- 041 : clés étrangères manquantes sur trois colonnes de référence.
--
-- L'audit d'intégrité a relevé 83 clés étrangères, toutes saines, et trois
-- colonnes portant un identifiant sans contrainte. Rien n'y référençait un
-- identifiant inexistant, mais rien ne l'empêchait non plus : une écriture
-- erronée aurait été acceptée, et le défaut n'aurait été découvert qu'à la
-- lecture — quand un dossier aurait disparu de la file de son chef.
--
-- `visas_controle_financier.signe_par` reste du texte libre : c'est la
-- signature manuscrite du contrôle financier, relevée sur la pièce papier. Le
-- CF n'a pas de compte sur la plateforme, et il n'en aura pas.

SET NAMES utf8mb4;

-- 1. divisions.type_dossier_id : le routage automatique en dépend. Une
--    division rattachée à un type inexistant ferait échouer la création de
--    tout dossier de ce type, avec un message qui ne parle pas du routage.
SET @sql := (
  SELECT IF(
    (SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'divisions'
        AND COLUMN_NAME = 'type_dossier_id'
        AND REFERENCED_TABLE_NAME IS NOT NULL) = 0,
    'ALTER TABLE divisions ADD CONSTRAINT fk_division_type FOREIGN KEY (type_dossier_id) REFERENCES types_dossiers (id) ON DELETE SET NULL',
    'SELECT 1'
  )
);
PREPARE requete FROM @sql; EXECUTE requete; DEALLOCATE PREPARE requete;

-- 2. documents.courrier_id : un document peut être la pièce jointe d'un
--    courrier. Sans contrainte, la suppression d'un courrier laissait ses
--    documents pointer dans le vide.
SET @sql := (
  SELECT IF(
    (SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'documents'
        AND COLUMN_NAME = 'courrier_id'
        AND REFERENCED_TABLE_NAME IS NOT NULL) = 0,
    'ALTER TABLE documents ADD CONSTRAINT fk_document_courrier FOREIGN KEY (courrier_id) REFERENCES courriers (id) ON DELETE SET NULL',
    'SELECT 1'
  )
);
PREPARE requete FROM @sql; EXECUTE requete; DEALLOCATE PREPARE requete;

-- Les trois clés ne peuvent pas être posées en une seule instruction : chaque
-- ALTER est conditionnel, et tous doivent pouvoir s'exécuter sur une base
-- déjà migrée sans rien casser.
