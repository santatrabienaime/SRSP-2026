import db from '../config/db.js';

/**
 * Routage automatique des dossiers (spécification « Routage automatique »).
 *
 * Un type de dossier determine sa division : la relation est portée par
 * divisions.type_dossier_id, donc elle est une donnée et non une correspondance
 * écrite en dur. L'utilisateur n'a plus à choisir la division.
 */

/** Division correspondant à un type de dossier. */
export async function divisionPourType(typeId) {
  if (!typeId) return null;
  const rows = await db.query(
    `SELECT d.id, d.code, d.nom, t.code AS type_code
     FROM divisions d
     JOIN types_dossiers t ON t.id = d.type_dossier_id
     WHERE t.id = ? AND d.actif = 1
     LIMIT 1`,
    [typeId]
  );
  return rows[0] || null;
}

/** Libellé de division à partir d'un code. */
export async function divisionParCode(code) {
  if (!code) return null;
  const rows = await db.query(
    'SELECT id, code, nom FROM divisions WHERE code = ? LIMIT 1',
    [code]
  );
  return rows[0] || null;
}

export default divisionPourType;
