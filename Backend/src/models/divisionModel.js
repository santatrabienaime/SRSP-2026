import db from '../config/db.js';

export async function findAll() {
  return db.query(
    `SELECT d.*, td.code AS type_dossier_code, td.libelle AS type_dossier_libelle,
            a.nom AS responsable_nom, a.prenom AS responsable_prenom
     FROM divisions d
     LEFT JOIN types_dossiers td ON td.id = d.type_dossier_id
     LEFT JOIN agents a ON d.responsable_id = a.id
     ORDER BY d.nom`
  );
}

export async function findById(id) {
  const rows = await db.query('SELECT * FROM divisions WHERE id = ?', [id]);
  return rows[0];
}

export async function create(data) {
  /* `type_dossier_id` est obligatoire en base (NOT NULL + clé étrangère) :
     une division traite un et un seul type de dossier. L'omettre faisait
     échouer l'insertion sur la contrainte de clé étrangère. */
  const { code, nom, type_dossier_id } = data;
  const result = await db.query(
    'INSERT INTO divisions (code, nom, type_dossier_id) VALUES (?, ?, ?)',
    [code, nom, type_dossier_id]
  );
  return { id: result.insertId, code, nom, type_dossier_id };
}

export async function update(id, data) {
  const { code, nom, responsable_id, actif, type_dossier_id } = data;
  await db.query(
    `UPDATE divisions
     SET code = ?, nom = ?, responsable_id = ?, actif = ?,
         type_dossier_id = COALESCE(?, type_dossier_id)
     WHERE id = ?`,
    [code, nom, responsable_id || null, actif, type_dossier_id || null, id]
  );
}

export async function remove(id) {
  await db.query('DELETE FROM divisions WHERE id = ?', [id]);
}