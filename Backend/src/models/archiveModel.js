import db from '../config/db.js';

export async function createArchive({ dossier_id, archive_par, motif }) {
  const result = await db.query(
    'INSERT INTO archives (dossier_id, archive_par, motif) VALUES (?, ?, ?)',
    [dossier_id, archive_par || null, motif || null]
  );
  return { id: result.insertId };
}

export async function findArchives(filters = {}) {
  let query = `
    SELECT ar.*, d.numero, d.objet, d.demandeur, d.date_reception,
           s.libelle AS statut_libelle, u.username AS archive_par_nom,
           dv.nom AS division_nom
    FROM archives ar
    JOIN dossiers d ON ar.dossier_id = d.id
    JOIN statuts_dossiers s ON d.statut_id = s.id
    LEFT JOIN divisions dv ON d.division_id = dv.id
    LEFT JOIN users u ON ar.archive_par = u.id
    WHERE 1=1
  `;
  const params = [];
  if (filters.dossier_id) {
    query += ' AND ar.dossier_id = ?';
    params.push(filters.dossier_id);
  }
  if (filters.date_debut) {
    query += ' AND ar.date_archivage >= ?';
    params.push(filters.date_debut);
  }
  if (filters.date_fin) {
    query += ' AND ar.date_archivage <= ?';
    params.push(filters.date_fin);
  }
  query += ' ORDER BY ar.date_archivage DESC LIMIT 500';
  return db.query(query, params);
}

export async function findById(id) {
  const rows = await db.query('SELECT * FROM archives WHERE id = ?', [id]);
  return rows[0];
}

export async function restoreArchive(id) {
  await db.query('UPDATE archives SET restaure = TRUE WHERE id = ?', [id]);
}