import * as notificationModel from '../models/notificationModel.js';
import db from '../config/db.js';

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
