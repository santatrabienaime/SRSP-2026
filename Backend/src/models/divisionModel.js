import db from '../config/db.js';

export async function findAll() {
  return db.query(
    `SELECT d.*, a.nom AS responsable_nom, a.prenom AS responsable_prenom
     FROM divisions d
     LEFT JOIN agents a ON d.responsable_id = a.id
     ORDER BY d.nom`
  );
}

export async function findById(id) {
  const rows = await db.query('SELECT * FROM divisions WHERE id = ?', [id]);
  return rows[0];
}

export async function create(data) {
  const { code, nom } = data;
  const result = await db.query('INSERT INTO divisions (code, nom) VALUES (?, ?)', [code, nom]);
  return { id: result.insertId, code, nom };
}

export async function update(id, data) {
  const { code, nom, responsable_id, actif } = data;
  await db.query(
    'UPDATE divisions SET code = ?, nom = ?, responsable_id = ?, actif = ? WHERE id = ?',
    [code, nom, responsable_id || null, actif, id]
  );
}