import * as notificationService from '../services/notificationService.js';

export async function list(req, res, next) {
  try { res.json(await notificationService.getNotifications(req.user.id)); } catch (e) { next(e); }
}

export async function markRead(req, res, next) {
  try {
    await notificationService.markAsRead(req.params.id, req.user.id);
    res.json({ message: 'Notification lue.' });
  } catch (e) { next(e); }
}

export async function markAllRead(req, res, next) {
  try {
    await notificationService.markAllAsRead(req.user.id);
    res.json({ message: 'Toutes les notifications sont lues.' });
  } catch (e) { next(e); }
}