import db from '../config/db.js';

/**
 * Service de messages internes entre utilisateurs de la plateforme SRSP.
 * Chaque action métier génère un message destiné au destinataire concerné.
 */

/**
 * Liste des messages de l'utilisateur connecté (non lus en priorité).
 */
export async function list(userId) {
  const rows = await db.query(
    `SELECT m.id, m.destinataire_id, m.expediteur_id, m.dossier_id,
            m.action, m.message, m.type, m.lu, m.date_creation,
            u.username as expediteur_nom, d.numero as dossier_numero
     FROM messages m
     LEFT JOIN users u ON u.id = m.expediteur_id
     LEFT JOIN dossiers d ON d.id = m.dossier_id
     WHERE m.destinataire_id = ?
     ORDER BY m.lu ASC, m.date_creation DESC`,
    [userId]
  );
  return rows;
}

/**
 * Compter les messages non lus de l'utilisateur connecté.
 */
export async function countUnread(userId) {
  const rows = await db.query(
    `SELECT COUNT(*) as count FROM messages WHERE destinataire_id = ? AND lu = 0`,
    [userId]
  );
  return rows[0]?.count || 0;
}

/**
 * Marquer un message comme lu.
 */
export async function markAsRead(messageId, userId) {
  const result = await db.query(
    `UPDATE messages SET lu = 1 WHERE id = ? AND destinataire_id = ?`,
    [messageId, userId]
  );
  if (result.affectedRows === 0) {
    throw new Error('Message introuvable');
  }
  return { id: messageId, lu: true };
}

/**
 * Marquer tous les messages de l'utilisateur comme lus.
 */
export async function markAllAsRead(userId) {
  await db.query(
    `UPDATE messages SET lu = 1 WHERE destinataire_id = ? AND lu = 0`,
    [userId]
  );
}

/**
 * Supprimer un message.
 */
export async function deleteMessage(messageId, userId) {
  await db.query(
    `DELETE FROM messages WHERE id = ? AND destinataire_id = ?`,
    [messageId, userId]
  );
}

/**
 * Envoyer un message (utilisé par le système interne après chaque action métier).
 */
export async function sendMessage(data, expediteurId) {
  const { dossier_id, action, message, destinataire_id, type = 'INFO' } = data;

  if (!destinataire_id) {
    throw new Error('Destinataire requis');
  }

  const result = await db.query(
    `INSERT INTO messages (dossier_id, expediteur_id, destinataire_id, action, message, type, lu, date_creation)
     VALUES (?, ?, ?, ?, ?, ?, 0, NOW())`,
    [dossier_id || null, expediteurId, destinataire_id, action, message, type]
  );

  return {
    id: result.insertId,
    dossier_id: dossier_id || null,
    expediteur_id: expediteurId,
    destinataire_id,
    action,
    message,
    type,
    lu: 0,
    date_creation: new Date()
  };
}

/**
 * Envoyer un message après une action métier sur un dossier.
 */
export async function envoyerMessageAction(data) {
  return sendMessage(data, data.expediteur_id || 1);
}
