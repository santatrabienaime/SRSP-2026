import db from '../config/db.js';

/**
 * Génère un numéro de dossier au format : {TYPE}-{ANNEE}-{6CARACTERES}
 * Exemple : VISA-2025-000001
 * @param {number|null} typeId - Identifiant du type de dossier
 */
export async function generateDossierNumber(typeId) {
  const year = new Date().getFullYear();

  let prefix = 'DOS';
  if (typeId) {
    const rows = await db.query('SELECT code FROM types_dossiers WHERE id = ?', [typeId]);
    if (rows[0]?.code) prefix = rows[0].code;
  }

  const countRows = await db.query(
    `SELECT COUNT(*) AS total FROM dossiers
     WHERE YEAR(date_reception) = ? AND type_id = ?`,
    [year, typeId || null]
  );
  const n = (countRows[0]?.total || 0) + 1;

  return `${prefix}-${year}-${String(n).padStart(6, '0')}`;
}