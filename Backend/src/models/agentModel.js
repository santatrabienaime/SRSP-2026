import db from '../config/db.js';

export async function findAll(filters = {}) {
  let query = `
    SELECT a.*, f.libelle AS fonction_libelle, d.nom AS division_nom
    FROM agents a
    LEFT JOIN fonctions f ON a.fonction_id = f.id
    LEFT JOIN divisions d ON a.division_id = d.id
    WHERE 1=1
  `;
  const params = [];
  if (filters.division_id) {
    query += ' AND a.division_id = ?';
    params.push(filters.division_id);
  }
  query += ' ORDER BY a.nom, a.prenom';
  return db.query(query, params);
}

export async function findById(id) {
  const rows = await db.query('SELECT * FROM agents WHERE id = ?', [id]);
  return rows[0];
}

export async function create(data) {
  const { user_id, nom, prenom, matricule, fonction_id, division_id, email, telephone } = data;
  const result = await db.query(
    `INSERT INTO agents (user_id, nom, prenom, matricule, fonction_id, division_id, email, telephone)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [user_id || null, nom, prenom, matricule, fonction_id, division_id, email, telephone]
  );
  return { id: result.insertId };
}

export async function update(id, data) {
  const { nom, prenom, matricule, fonction_id, division_id, email, telephone, actif } = data;
  await db.query(
    `UPDATE agents SET nom = ?, prenom = ?, matricule = ?, fonction_id = ?,
     division_id = ?, email = ?, telephone = ?, actif = ? WHERE id = ?`,
    [nom, prenom, matricule, fonction_id, division_id, email, telephone, actif, id]
  );
}