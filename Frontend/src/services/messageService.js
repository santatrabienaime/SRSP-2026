import apiClient from './apiClient.js';

/**
 * Service de messages internes entre utilisateurs de la plateforme SRSP.
 *
 * Chaque action métier (créer, affecter, traiter, vérifier, valider, signer,
 * commenter, etc.) génère un message destiné au destinataire concerné.
 * Les messages sont stockés côté serveur et consultables depuis l'icône
 * de messagerie dans la barre de navigation.
 */

export const messageService = {
  /** Liste des messages de l'utilisateur connecté (non lus en priorité). */
  list: (params = {}) =>
    apiClient.get('/messages', { params }).then((r) => r.data),

  /** Marquer un message comme lu. */
  markAsRead: (id) =>
    apiClient.post(`/messages/${id}/lu`).then((r) => r.data),

  /** Marquer tous les messages comme lus. */
  markAllAsRead: () =>
    apiClient.post('/messages/lu/tout').then((r) => r.data),

  /** Compter les messages non lus. */
  countUnread: () =>
    apiClient.get('/messages/non-lus/count').then((r) => r.data || 0),

  /** Envoyer un message à un utilisateur (utilisé après chaque action métier). */
  send: (data) =>
    apiClient.post('/messages', data).then((r) => r.data),

  /** Supprimer un message. */
  delete: (id) =>
    apiClient.delete(`/messages/${id}`).then((r) => r.data),
};

/**
 * Aide à envoyer un message après une action métier sur un dossier.
 *
 * @param {Object} data
 * @param {string} data.destinataireId - ID de l'agent destinataire
 * @param {string} data.dossierId - ID du dossier concerné
 * @param {string} data.action - Type d'action (CREATION, AFFECTATION, TRAITEMENT, VERIFICATION, VALIDATION, SIGNATURE, COMMENTAIRE, etc.)
 * @param {string} data.message - Texte du message
 * @param {string} data.type - Type de message (INFO, ALERTE, URGENT)
 */
export const envoyerMessageAction = async (data) => {
  try {
    await messageService.send({
      ...data,
      type: data.type || 'INFO',
    });
  } catch (err) {
    // L'envoi de message ne doit jamais bloquer l'action métier
    console.warn('Échec de l\'envoi du message:', err.message);
  }
};

export default messageService;