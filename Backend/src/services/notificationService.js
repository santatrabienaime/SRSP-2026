import * as notificationModel from '../models/notificationModel.js';
import db from '../config/db.js';
import * as dossierModel from '../models/dossierModel.js';

/** Notifications personnelles de l'utilisateur, avec son compteur de non-lues. */
export async function getNotifications(userId) {
  const [notifications, nonLues] = await Promise.all([
    notificationModel.findByUser(userId),
    notificationModel.countUnread(userId),
  ]);
  return { notifications, non_lues: nonLues };
}

export async function markAsRead(id, userId) {
  return notificationModel.markAsRead(id, userId);
}

/** Une notification existe-t-elle pour cet utilisateur ? (lecture seule) */
export async function existe(id, userId) {
  const rows = await db.query(
    'SELECT id FROM notifications WHERE id = ? AND user_id = ? LIMIT 1',
    [id, userId]
  );
  return rows.length > 0;
}

export async function markAllRead(userId) {
  return notificationModel.markAllAsRead(userId);
}

export async function create(payload) {
  return notificationModel.create(payload);
}

/**
 * Notifie le secrétaire qu'un dossier est incomplet (pièces manquantes).
 */
export async function notifyDossierIncomplet(dossierId, piecesManquantes) {
  const info = await dossierModel.findDivisionOfDossier(dossierId);
  const [dossier] = await db.query('SELECT numero FROM dossiers WHERE id = ?', [dossierId]);
  const numero = dossier?.numero || `#${dossierId}`;
  const lien = `/dossiers/${dossierId}`;
  const _division_id = info?.division_id;

  // Notifier les secrétaires (rôle SECRETAIRE)
  const ids = await notificationModel.getUserIdsByRole('SECRETAIRE');
  let envoyees = 0;
  for (const id of ids) {
    if (await notificationModel.create({
      user_id: id,
      dossier_id: dossierId,
      action: 'DOSSIER_INCOMPLET',
      type: 'WARNING',
      message: `Le dossier ${numero} est incomplet : ${piecesManquantes.length} pièce(s) manquante(s) — ${piecesManquantes.join(', ')}.`,
      lien,
    })) envoyees++;
  }
  return envoyees;
}

/**
 * Notifie le secrétaire que des pièces complémentaires ont été reçues.
 */
export async function notifyPiecesRecues(dossierId, piecesRecues) {
  const [dossier] = await db.query('SELECT numero FROM dossiers WHERE id = ?', [dossierId]);
  const numero = dossier?.numero || `#${dossierId}`;
  const lien = `/dossiers/${dossierId}`;

  const ids = await notificationModel.getUserIdsByRole('SECRETAIRE');
  let envoyees = 0;
  for (const id of ids) {
    if (await notificationModel.create({
      user_id: id,
      dossier_id: dossierId,
      action: 'PIECES_RECUES',
      type: 'INFO',
      message: `Pièces complémentaires reçues pour le dossier ${numero} : ${piecesRecues.join(', ')}.`,
      lien,
    })) envoyees++;
  }
  return envoyees;
}

/**
 * Notifie le secrétaire qu'un bordereau a été émis (transmission vers division).
 */
export async function notifyBordereauEmis(bordereau) {
  const { reference, division_nom, dossiers = [] } = bordereau;
  const lien = `/bordereaux/${bordereau.id}`;
  const message = `Bordereau ${reference} transmis à la division ${division_nom} — ${dossiers.length} dossier(s).`;

  const ids = await notificationModel.getUserIdsByRole('SECRETAIRE');
  let envoyees = 0;
  for (const id of ids) {
    if (await notificationModel.create({
      user_id: id,
      dossier_id: null,
      action: 'BORDEREAU_EMIS',
      type: 'INFO',
      message,
      lien,
    })) envoyees++;
  }
  return envoyees;
}

/**
 * Notifie le secrétaire qu'un bordereau a été accusé réception par la division.
 */
export async function notifyBordereauConfirme(bordereau) {
  const { reference, division_nom } = bordereau;
  const lien = `/bordereaux/${bordereau.id}`;
  const message = `Bordereau ${reference} confirmé reçu par la division ${division_nom}.`;

  const ids = await notificationModel.getUserIdsByRole('SECRETAIRE');
  let envoyees = 0;
  for (const id of ids) {
    if (await notificationModel.create({
      user_id: id,
      dossier_id: null,
      action: 'BORDEREAU_CONFIRME',
      type: 'SUCCESS',
      message,
      lien,
    })) envoyees++;
  }
  return envoyees;
}

/**
 * Notifie un utilisateur qu'une tâche administrative est en attente.
 */
export async function notifyTacheAttente(userId, message, lien = '/dossiers') {
  return notificationModel.create({
    user_id: userId,
    dossier_id: null,
    action: 'TACHE_ATTENTE',
    type: 'TACHE',
    message,
    lien,
  });
}

/**
 * Notifie le secrétaire qu'un dossier est prêt pour archivage (clôturé).
 */
export async function notifyCloturePretArchivage(dossierId) {
  const [dossier] = await db.query('SELECT numero FROM dossiers WHERE id = ?', [dossierId]);
  const numero = dossier?.numero || `#${dossierId}`;
  const lien = `/dossiers/${dossierId}`;

  const ids = await notificationModel.getUserIdsByRole('SECRETAIRE');
  let envoyees = 0;
  for (const id of ids) {
    if (await notificationModel.create({
      user_id: id,
      dossier_id: dossierId,
      action: 'CLOTURE_PRET_ARCHIVAGE',
      type: 'INFO',
      message: `Le dossier ${numero} est clôturé et prêt pour archivage.`,
      lien,
    })) envoyees++;
  }
  return envoyees;
}
