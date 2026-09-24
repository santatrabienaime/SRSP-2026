import * as notificationModel from '../models/notificationModel.js';

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

export async function markAllRead(userId) {
  return notificationModel.markAllAsRead(userId);
}

export async function create(payload) {
  return notificationModel.create(payload);
}
