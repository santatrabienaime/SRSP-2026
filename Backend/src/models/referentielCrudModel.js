import db from '../config/db.js';

// --- Types de dossiers ---

export async function listTypesDossiers() {
  return db.query('SELECT id, code, libelle, description, actif FROM types_dossiers ORDER BY id');
}

export async function createTypeDossier(data) {
  const { code, libelle, description } = data;
  const result = await db.query(
    'INSERT INTO types_dossiers (code, libelle, description) VALUES (?, ?, ?)',
    [code, libelle, description || null]
  );
  return { id: result.insertId, code, libelle };
}

export async function deleteTypeDossier(id) {
  await db.query('DELETE FROM types_dossiers WHERE id = ?', [id]);
}

// --- Types de pieces ---

export async function listTypesPieces() {
  return db.query('SELECT * FROM types_pieces ORDER BY ordre, id');
}

export async function createTypePiece(data) {
  const { code, libelle, obligatoire, phase, ordre, division_code } = data;
  const result = await db.query(
    'INSERT INTO types_pieces (code, libelle, obligatoire, phase, ordre, division_code) VALUES (?, ?, ?, ?, ?, ?)',
    [code, libelle, obligatoire ?? 1, phase || 'ARCHIVAGE', ordre || 0, division_code || null]
  );
  return { id: result.insertId, code, libelle };
}

export async function deleteTypePiece(id) {
  await db.query('DELETE FROM types_pieces WHERE id = ?', [id]);
}

// --- Types de courriers ---

export async function listTypesCourriers() {
  return db.query('SELECT id, libelle FROM types_courriers ORDER BY libelle');
}

export async function createTypeCourrier(data) {
  const { libelle } = data;
  const result = await db.query(
    'INSERT INTO types_courriers (libelle) VALUES (?)',
    [libelle]
  );
  return { id: result.insertId, libelle };
}

export async function deleteTypeCourrier(id) {
  await db.query('DELETE FROM types_courriers WHERE id = ?', [id]);
}
