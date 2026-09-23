import db from '../config/db.js';

async function generateNumeroCourrier(sens) {
  const year = new Date().getFullYear();
  const prefix = sens === 'ENTRANT' ? 'CE' : 'CS';
  const rows = await db.query(
    `SELECT COUNT(*) AS total FROM courriers WHERE YEAR(created_at) = ? AND sens = ?`,
    [year, sens]
  );
  const n = (rows[0].total || 0) + 1;
  return `${prefix}-${year}-${String(n).padStart(4, '0')}`;
}

export async function findCourriers(filters = {}) {
  let query = `
    SELECT c.*, t.libelle AS type_libelle, dv.nom AS division_nom
    FROM courriers c
    LEFT JOIN types_courriers t ON c.type_id = t.id
    LEFT JOIN divisions dv ON c.division_id = dv.id
    WHERE 1=1
  `;
  const params = [];
  if (filters.sens) {
    query += ' AND c.sens = ?';
    params.push(filters.sens);
  }
  if (filters.statut) {
    query += ' AND c.statut = ?';
    params.push(filters.statut);
  }
  query += ' ORDER BY c.created_at DESC';
  return db.query(query, params);
}

export async function findCourrierById(id) {
  const rows = await db.query(
    `SELECT c.*, t.libelle AS type_libelle FROM courriers c
     LEFT JOIN types_courriers t ON c.type_id = t.id WHERE c.id = ?`,
    [id]
  );
  return rows[0];
}

export async function createCourrier(data) {
  const { type_id, sens, expediteur, destinataire, objet, division_id, dossier_id, created_by } = data;
  const numero = await generateNumeroCourrier(sens);
  const result = await db.query(
    `INSERT INTO courriers (numero, type_id, sens, expediteur, destinataire, objet, division_id, dossier_id, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [numero, type_id, sens, expediteur, destinataire, objet, division_id || null, dossier_id || null, created_by]
  );
  return { id: result.insertId, numero };
}

export async function updateStatut(id, statut) {
  await db.query('UPDATE courriers SET statut = ? WHERE id = ?', [statut, id]);
}