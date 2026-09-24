-- Rattachement des notifications existantes (34 lignes sans dossier_id).
-- Reprise de la migration 024, appliquée à une base déjà migrée.

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

DELETE n1
FROM notifications n1
JOIN notifications n2
  ON n1.user_id = n2.user_id
 AND COALESCE(n1.dossier_id, 0) = COALESCE(n2.dossier_id, 0)
 AND COALESCE(n1.action, '') = COALESCE(n2.action, '')
 AND n1.id > n2.id;

-- Les messages d'information (dossier enregistre) sont des actes a part
-- entiere : on leur donne une action pour que la protection anti-doublon
-- s'applique aussi (sans action, deux NULL ne sont jamais egaux en SQL).
UPDATE notifications
SET action = 'DOSSIER_ENREGISTRE'
WHERE action IS NULL AND type = 'INFO';

DELETE n1
FROM notifications n1
JOIN notifications n2
  ON n1.user_id = n2.user_id
 AND COALESCE(n1.dossier_id, 0) = COALESCE(n2.dossier_id, 0)
 AND COALESCE(n1.action, '') = COALESCE(n2.action, '')
 AND n1.id > n2.id;
