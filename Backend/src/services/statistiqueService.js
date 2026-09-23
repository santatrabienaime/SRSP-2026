import db from '../config/db.js';

export async function getStatistiques({ date_debut, date_fin } = {}) {
  let where = 'WHERE 1=1';
  const params = [];
  if (date_debut) { where += ' AND d.date_reception >= ?'; params.push(date_debut); }
  if (date_fin) { where += ' AND d.date_reception <= ?'; params.push(date_fin); }

  const [total] = await db.query(`SELECT COUNT(*) AS total FROM dossiers d ${where}`, params);
  const [valides] = await db.query(
    `SELECT COUNT(*) AS total FROM dossiers d JOIN statuts_dossiers s ON d.statut_id = s.id
     ${where} AND s.code = 'VALIDE'`,
    params
  );
  const [rejetes] = await db.query(
    `SELECT COUNT(*) AS total FROM dossiers d JOIN statuts_dossiers s ON d.statut_id = s.id
     ${where} AND s.code = 'CORRECTION_DEMANDEE'`,
    params
  );
  const tauxValidation = total.total > 0 ? (valides.total / total.total) * 100 : 0;
  const tauxRejet = total.total > 0 ? (rejetes.total / total.total) * 100 : 0;

  return {
    total: total.total,
    valides: valides.total,
    rejetes: rejetes.total,
    tauxValidation: Math.round(tauxValidation * 100) / 100,
    tauxRejet: Math.round(tauxRejet * 100) / 100,
  };
}