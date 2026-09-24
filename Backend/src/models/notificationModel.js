import db from '../config/db.js';

/**
 * Notifications personnelles.
 *
 * Principe : une notification est adressée à une personne identifiée, jamais
 * diffusée à un rôle entier. L'utilisateur ne voit que les siennes, et un acte
 * de workflow ne peut produire qu'une seule notification par destinataire
 * (contrainte d'unicité user_id + dossier_id + action).
 */

export async function findByUser(userId, { limit = 50 } = {}) {
  return db.query(
    `SELECT n.*, d.numero AS dossier_numero
     FROM notifications n
     LEFT JOIN dossiers d ON d.id = n.dossier_id
     WHERE n.user_id = ?
     ORDER BY n.lu ASC, n.created_at DESC
     LIMIT ?`,
    [userId, limit]
  );
}

export async function countUnread(userId) {
  const rows = await db.query(
    'SELECT COUNT(*) AS total FROM notifications WHERE user_id = ? AND lu = FALSE',
    [userId]
  );
  return rows[0]?.total || 0;
}

/**
 * Crée une notification pour UN utilisateur.
 * Le INSERT ignore silencieusement un doublon (user_id, dossier_id, action) :
 * un acte déjà notifié ne réapparaît pas.
 */
export async function create({ user_id, type, action, message, lien, dossier_id }) {
  if (!user_id) return false;
  const [res] = await db.pool.execute(
    `INSERT IGNORE INTO notifications (user_id, dossier_id, type, action, message, lien)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [user_id, dossier_id || null, type || null, action || null, message, lien || null]
  );
  return res.affectedRows > 0;
}

export async function markAsRead(id, userId) {
  await db.query('UPDATE notifications SET lu = TRUE WHERE id = ? AND user_id = ?', [id, userId]);
}

export async function markAllAsRead(userId) {
  await db.query('UPDATE notifications SET lu = TRUE WHERE user_id = ? AND lu = FALSE', [userId]);
}

/** Identifiant utilisateur du responsable désigné d'une division. */
export async function getChefDivisionUserId(divisionId) {
  if (!divisionId) return null;
  const rows = await db.query(
    `SELECT u.id
     FROM divisions dv
     JOIN agents a ON a.id = dv.responsable_id
     JOIN users u ON u.id = a.user_id AND u.actif = TRUE
     WHERE dv.id = ?
     LIMIT 1`,
    [divisionId]
  );
  return rows[0]?.id || null;
}

/** Identifiant utilisateur lié à un agent. */
export async function getUserIdByAgent(agentId) {
  if (!agentId) return null;
  const rows = await db.query(
    'SELECT user_id FROM agents WHERE id = ? LIMIT 1',
    [agentId]
  );
  return rows[0]?.user_id || null;
}

/** Utilisateurs actifs d'un rôle (repli, quand aucun responsable nommé). */
export async function getUserIdsByRole(roleNom) {
  const rows = await db.query(
    `SELECT u.id
     FROM users u JOIN roles r ON u.role_id = r.id
     WHERE r.nom = ? AND u.actif = TRUE`,
    [roleNom]
  );
  return rows.map((r) => r.id);
}

/** Notifie la personne désignée comme responsable de la division. */
export async function notifyDivision(divisionId, payload) {
  const userId = await getChefDivisionUserId(divisionId);
  if (!userId) return false;
  return create({ ...payload, user_id: userId });
}

/** Notifie l'agent responsable du dossier. */
export async function notifyAgent(agentId, payload) {
  const userId = await getUserIdByAgent(agentId);
  if (!userId) return false;
  return create({ ...payload, user_id: userId });
}

/** Notifie un utilisateur précis. */
export async function notifyUser(userId, payload) {
  return create({ ...payload, user_id: userId });
}

/**
 * Notifie les titulaires d'un rôle. Utilisé uniquement quand l'acte ne relève
 * pas d'une division identifiée (validation, signature, clôture) : la liste
 * obtenue est celle des personnes réellement concernées, et non une diffusion
 * aveugle à tous les membres du rôle.
 */
export async function notifyRole(roleNom, payload) {
  const ids = await getUserIdsByRole(roleNom);
  let envoyees = 0;
  for (const id of ids) {
    if (await create({ ...payload, user_id: id })) envoyees += 1;
  }
  return envoyees;
}
