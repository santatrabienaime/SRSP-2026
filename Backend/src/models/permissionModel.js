import db from '../config/db.js';

export async function findAll() {
  return db.query('SELECT * FROM permissions ORDER BY nom');
}

export async function findById(id) {
  const rows = await db.query('SELECT * FROM permissions WHERE id = ?', [id]);
  return rows[0];
}

export async function create({ nom, description }) {
  const result = await db.query(
    'INSERT INTO permissions (nom, description) VALUES (?, ?)',
    [nom, description || null]
  );
  return { id: result.insertId, nom, description };
}

export async function update(id, { nom, description }) {
  await db.query(
    'UPDATE permissions SET nom = ?, description = ? WHERE id = ?',
    [nom, description || null, id]
  );
  return findById(id);
}

export async function remove(id) {
  await db.query('DELETE FROM permissions WHERE id = ?', [id]);
}

export async function getUserPermissions(userId) {
  return db.query(
    `SELECT p.nom
     FROM permissions p
     JOIN role_permissions rp ON p.id = rp.permission_id
     JOIN users u ON u.role_id = rp.role_id
     WHERE u.id = ?`,
    [userId]
  );
}