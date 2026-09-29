import db from '../config/db.js';

export async function findAll() {
  return db.query(
    `SELECT r.id, r.nom, r.description, COUNT(u.id) AS nb_users
     FROM roles r
     LEFT JOIN users u ON u.role_id = r.id
     GROUP BY r.id, r.nom, r.description
     ORDER BY r.nom`
  );
}

export async function findById(id) {
  const rows = await db.query('SELECT * FROM roles WHERE id = ?', [id]);
  return rows[0];
}

export async function create({ nom, description }) {
  const result = await db.query(
    'INSERT INTO roles (nom, description) VALUES (?, ?)',
    [nom, description || null]
  );
  return { id: result.insertId, nom, description };
}

export async function update(id, { nom, description }) {
  await db.query(
    'UPDATE roles SET nom = ?, description = ? WHERE id = ?',
    [nom, description || null, id]
  );
  return findById(id);
}

export async function remove(id) {
  await db.query('DELETE FROM roles WHERE id = ?', [id]);
}

export async function getPermissions(roleId) {
  return db.query(
    `SELECT p.id, p.nom, p.description
     FROM permissions p
     JOIN role_permissions rp ON p.id = rp.permission_id
     WHERE rp.role_id = ?
     ORDER BY p.nom`,
    [roleId]
  );
}

export async function setPermissions(roleId, permissionIds) {
  await db.query('DELETE FROM role_permissions WHERE role_id = ?', [roleId]);
  if (permissionIds.length > 0) {
    const values = permissionIds.map((pid) => [roleId, pid]);
    const placeholders = values.map(() => '(?, ?)').join(', ');
    const flat = values.flat();
    await db.query(
      `INSERT INTO role_permissions (role_id, permission_id) VALUES ${placeholders}`,
      flat
    );
  }
}