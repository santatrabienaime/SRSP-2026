import db from '../config/db.js';

export async function log({ user_id, action, dossier_id, ancienne_valeur, nouvelle_valeur, details, ip_address }) {
  await db.query(
    `INSERT INTO historique_actions (user_id, action, dossier_id, ancienne_valeur, nouvelle_valeur, details, ip_address)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [user_id, action, dossier_id || null, ancienne_valeur || null, nouvelle_valeur || null,
     details || null, ip_address || null]
  );
}

export async function findAll(filters = {}) {
  let query = `
    SELECT h.*, u.username, d.numero AS dossier_numero
    FROM historique_actions h
    LEFT JOIN users u ON h.user_id = u.id
    LEFT JOIN dossiers d ON h.dossier_id = d.id
    WHERE 1=1
  `;
  const params = [];
  if (filters.user_id) { query += ' AND h.user_id = ?'; params.push(filters.user_id); }
  if (filters.dossier_id) { query += ' AND h.dossier_id = ?'; params.push(filters.dossier_id); }
  if (filters.action) { query += ' AND h.action = ?'; params.push(filters.action); }
  query += ' ORDER BY h.date_action DESC LIMIT 500';
  return db.query(query, params);
}