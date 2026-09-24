-- 024_notifications_personnelles.sql
-- Chaque utilisateur reçoit SES notifications, sans diffusion à un rôle entier
-- et sans doublon.

ALTER TABLE notifications
  ADD COLUMN dossier_id INT(11) NULL DEFAULT NULL AFTER user_id,
  ADD COLUMN action VARCHAR(50) NULL DEFAULT NULL AFTER type,
  ADD KEY idx_notif_user_lu (user_id, lu),
  ADD KEY idx_notif_dossier (dossier_id);

-- Suppression des doublons déjà présents : on ne garde que la plus ancienne
-- ligne pour chaque (utilisateur, message), qui est la plus relevante.
DELETE n1
FROM notifications n1
JOIN notifications n2
  ON n1.user_id = n2.user_id
 AND n1.message = n2.message
 AND n1.id > n2.id;

-- Un acte de workflow n'a lieu qu'une fois par dossier : on garantit qu'un
-- utilisateur ne reçoit pas deux fois la même alerte pour le même acte.
ALTER TABLE notifications
  ADD UNIQUE KEY uk_notif_user_action (user_id, dossier_id, action);

-- Rattachement des notifications antérieures à leur dossier et à leur acte.
-- Sans cela, dossier_id et action restent NULL : en SQL deux NULL ne sont jamais
-- considérés comme égaux, donc la contrainte d'unicité ne s'appliquerait pas et
-- les doublons pourraient réapparaître.
UPDATE notifications n
JOIN dossiers d ON n.message LIKE CONCAT('%', d.numero, '%')
SET n.dossier_id = d.id
WHERE n.dossier_id IS NULL;

UPDATE notifications
SET action = CASE
  WHEN type = 'AFFECTATION' THEN 'AFFECTE'
  WHEN type = 'VERIFICATION' THEN 'SOUMIS_A_VERIFICATION'
  WHEN type = 'CORRECTION'  THEN 'CORRECTION_DEMANDEE'
  WHEN type = 'VALIDATION'  THEN 'VALIDE'
  WHEN type = 'SIGNATURE'   THEN 'SIGNE'
  WHEN type = 'CLOTURE'     THEN 'CLOTURE'
  WHEN type = 'WORKFLOW'    THEN 'ORIENTE'
END
WHERE action IS NULL;

-- Second passage de dédoublonnage, maintenant que les clés sont renseignées.
DELETE n1
FROM notifications n1
JOIN notifications n2
  ON n1.user_id = n2.user_id
 AND COALESCE(n1.dossier_id, 0) = COALESCE(n2.dossier_id, 0)
 AND COALESCE(n1.action, '') = COALESCE(n2.action, '')
 AND n1.id > n2.id;
