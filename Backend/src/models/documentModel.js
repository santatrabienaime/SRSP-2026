import db from '../config/db.js';

export async function findDocuments(filters = {}) {
  let query = `
    SELECT doc.*, d.numero AS dossier_numero, u.username AS upload_par_nom,
           t.libelle AS type_libelle
    FROM documents doc
    LEFT JOIN dossiers d ON doc.dossier_id = d.id
    LEFT JOIN users u ON doc.upload_par = u.id
    LEFT JOIN types_documents t ON doc.type_id = t.id
    WHERE 1=1
  `;
  const params = [];
  if (filters.dossier_id) {
    query += ' AND doc.dossier_id = ?';
    params.push(filters.dossier_id);
  }
  if (filters.courrier_id) {
    query += ' AND doc.courrier_id = ?';
    params.push(filters.courrier_id);
  }
  query += ' ORDER BY doc.created_at DESC';
  return db.query(query, params);
}

export async function findDocumentById(id) {
  const rows = await db.query('SELECT * FROM documents WHERE id = ?', [id]);
  return rows[0];
}

export async function createDocument(data) {
  const { dossier_id, courrier_id, type_id, nom_fichier, chemin_stockage, taille, upload_par } = data;
  const result = await db.query(
    `INSERT INTO documents (dossier_id, courrier_id, type_id, nom_fichier, chemin_stockage, taille, upload_par)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [dossier_id || null, courrier_id || null, type_id || null, nom_fichier, chemin_stockage, taille, upload_par]
  );
  return { id: result.insertId };
}

export async function validerDocument(id, valide) {
  await db.query('UPDATE documents SET valide = ? WHERE id = ?', [valide, id]);
}

export async function deleteDocument(id) {
  await db.query('DELETE FROM documents WHERE id = ?', [id]);
}