import * as notificationModel from '../models/notificationModel.js';

export async function getNotifications(userId) {
  return notificationModel.findByUser(userId);
}

export async function markAsRead(id, userId) {
  return notificationModel.markAsRead(id, userId);
}

export async function markAllAsRead(userId) {
  return notificationModel.markAllAsRead(userId);
}

export async function create({ user_id, type, message, lien }) {
  return notificationModel.create({ user_id, type, message, lien });
}