-- 030_notifications_dossier_integrite.sql
-- « Chaque notification doit être personnelle et ciblée vers le bon
-- utilisateur ou la bonne division. »
--
-- Constat : la table notifications n'avait AUCUNE clé étrangère vers dossiers.
-- Rien n'empêchait donc d'y référencer un dossier supprimé, et rien ne
-- supprimait la notification avec lui.
--
-- Mesuré avant correction : 17 notifications pointaient vers un dossier
-- inexistant. Un clic sur l'une d'elles menait à une erreur 404, et son message
-- continuait d'afficher le numéro d'un dossier qui n'existe plus.
--
-- Une notification dont le dossier a disparu n'a plus de sens : elle est
-- supprimée avec lui (ON DELETE CASCADE). Le dossier_id reste nullable, car
-- certaines notifications d'information ne se rattachent à aucun dossier.

-- 1. Purge des références mortes.
DELETE n
FROM notifications n
LEFT JOIN dossiers d ON d.id = n.dossier_id
WHERE n.dossier_id IS NOT NULL AND d.id IS NULL;

-- 2. Intégrité garantie à l'avenir.
ALTER TABLE notifications
  ADD CONSTRAINT fk_notification_dossier
  FOREIGN KEY (dossier_id) REFERENCES dossiers (id)
  ON DELETE CASCADE;
