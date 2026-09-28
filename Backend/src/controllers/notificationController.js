import * as notificationService from '../services/notificationService.js';

export async function list(req, res, next) {
  try { res.json(await notificationService.getNotifications(req.user.id)); } catch (e) { next(e); }
}

export async function markRead(req, res, next) {
  try {
    const marquee = await notificationService.markAsRead(req.params.id, req.user.id);
    /* 404 et non 200 : la notification n'existe pas CHEZ CET UTILISATEUR. Le
       modèle filtre déjà sur user_id, donc aucune donnée n'est modifiée — mais
       un 200 laisserait croire que la notification d'autrui a été marquée. */
    if (!marquee) {
      return res.status(404).json({ message: 'Notification introuvable.' });
    }
    res.json({ message: 'Notification lue.' });
  } catch (e) { next(e); }
}

export async function markAllRead(req, res, next) {
  try {
    await notificationService.markAllAsRead(req.user.id);
    res.json({ message: 'Toutes les notifications sont lues.' });
  } catch (e) { next(e); }
}