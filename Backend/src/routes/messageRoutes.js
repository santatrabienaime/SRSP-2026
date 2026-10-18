import express from 'express';
import * as ctrl from '../controllers/messageController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

/**
 * Routes des messages internes entre utilisateurs.
 * Chaque action métier génère un message destiné au destinataire concerné.
 */

/**
 * Liste des messages de l'utilisateur connecté.
 */
router.get('/', ctrl.getMessages);

/**
 * Compter les messages non lus.
 */
router.get('/non-lus/count', ctrl.countUnread);

/**
 * Marquer un message comme lu.
 */
router.post('/:id/lu', ctrl.markAsRead);

/**
 * Marquer tous les messages comme lus.
 */
router.post('/lu/tout', ctrl.markAllAsRead);

/**
 * Envoyer un message (système interne).
 */
router.post('/', ctrl.sendMessage);

/**
 * Supprimer un message.
 */
router.delete('/:id', ctrl.deleteMessage);

export default router;
