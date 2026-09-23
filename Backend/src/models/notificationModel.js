import db from '../config/db.js';

export async function findByUser(userId) {
  return db.query(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 100',
    [userId]
  );
}

export async function create({ user_id, type, message, lien }) {
  await db.query(
    'INSERT INTO notifications (user_id, type, message, lien) VALUES (?, ?, ?, ?)',
    [user_id, type, message, lien || null]
  );
}

export async function markAsRead(id, userId) {
  await db.query('UPDATE notifications SET lu = TRUE WHERE id = ? AND user_id = ?', [id, userId]);
}

export async function markAllAsRead(userId) {
  await db.query('UPDATE notifications SET lu = TRUE WHERE user_id = ?', [userId]);
}

export async function notifyRole(roleNom, { type, message, lien }) {
  const users = await db.query(
    'SELECT u.id FROM users u JOIN roles r ON u.role_id = r.id WHERE r.nom = ? AND u.actif = TRUE',
    [roleNom]
  );
  for (const u of users) {
    await create({ user_id: u.id, type, message, lien });
  }
}

/** Notifie l'utilisateur lié à un agent (si existant). */
export async function notifyAgent(agentId, { type, message, lien }) {
  if (!agentId) return;
  const rows = await db.query('SELECT user_id FROM agents WHERE id = ?', [agentId]);
  if (rows[0]?.user_id) {
    await create({ user_id: rows[0].user_id, type, message, lien });
  }
}