import * as messageService from '../services/messageService.js';

/**
 * Contrôleur des messages internes entre utilisateurs.
 * Chaque action métier génère un message destiné au destinataire concerné.
 */

/**
 * Liste des messages de l'utilisateur connecté (non lus en priorité).
 */
export async function getMessages(req, res, next) {
  try {
    const messages = await messageService.list(req.user.id);
    res.json(messages);
  } catch (e) {
    next(e);
  }
}

/**
 * Compter les messages non lus de l'utilisateur connecté.
 */
export async function countUnread(req, res, next) {
  try {
    const count = await messageService.countUnread(req.user.id);
    res.json({ count });
  } catch (e) {
    next(e);
  }
}

/**
 * Marquer un message comme lu.
 */
export async function markAsRead(req, res, next) {
  try {
    const message = await messageService.markAsRead(req.params.id, req.user.id);
    res.json(message);
  } catch (e) {
    next(e);
  }
}

/**
 * Marquer tous les messages de l'utilisateur comme lus.
 */
export async function markAllAsRead(req, res, next) {
  try {
    await messageService.markAllAsRead(req.user.id);
    res.json({ message: 'Tous les messages marqués comme lus' });
  } catch (e) {
    next(e);
  }
}

/**
 * Supprimer un message.
 */
export async function deleteMessage(req, res, next) {
  try {
    await messageService.deleteMessage(req.params.id, req.user.id);
    res.json({ message: 'Message supprimé' });
  } catch (e) {
    next(e);
  }
}

/**
 * Envoyer un message (utilisé par le système interne après chaque action métier).
 */
export async function sendMessage(req, res, next) {
  try {
    const message = await messageService.sendMessage(req.body, req.user.id);
    res.status(201).json(message);
  } catch (e) {
    next(e);
  }
}
