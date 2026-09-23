import db from '../config/db.js';

const COUNT_BY_CODE = (code) => `
  SELECT COUNT(*) AS total FROM dossiers d
  JOIN statuts_dossiers s ON d.statut_id = s.id WHERE s.code = '${code}'`;

export async function getSummary() {
  const [total] = await db.query('SELECT COUNT(*) AS total FROM dossiers');
  const stats = {};
  stats.total = total.total;

  const codes = [
    'RECU', 'ENREGISTRE', 'ORIENTE', 'AFFECTE', 'EN_TRAITEMENT',
    'SOUMIS_A_VERIFICATION', 'CORRECTION_DEMANDEE', 'VALIDE', 'SIGNE', 'CLOTURE', 'ARCHIVE',
  ];
  for (const code of codes) {
    const [r] = await db.query(COUNT_BY_CODE(code));
    stats[code] = r.total;
  }

  // Dossiers en retard : en attente depuis plus de 30 jours sans être clôturé/archivé
  const [enRetard] = await db.query(`
    SELECT COUNT(*) AS total FROM dossiers d
    JOIN statuts_dossiers s ON d.statut_id = s.id
    WHERE s.code NOT IN ('CLOTURE', 'ARCHIVE')
      AND d.date_reception < DATE_SUB(CURDATE(), INTERVAL 30 DAY)`);

  return { ...stats, enRetard: enRetard.total };
}

export async function getByDivision() {
  return db.query(
    `SELECT dv.nom AS division, COUNT(d.id) AS total
     FROM divisions dv
     LEFT JOIN dossiers d ON d.division_id = dv.id
     GROUP BY dv.id, dv.nom
     ORDER BY dv.nom`
  );
}

export async function getByStatus() {
  return db.query(
    `SELECT s.code, s.libelle AS statut, COUNT(d.id) AS total
     FROM statuts_dossiers s
     LEFT JOIN dossiers d ON d.statut_id = s.id
     GROUP BY s.id, s.code, s.libelle
     ORDER BY s.ordre`
  );
}

export async function getEvolution() {
  return db.query(
    `SELECT DATE_FORMAT(date_reception, '%Y-%m') AS mois, COUNT(*) AS total
     FROM dossiers
     GROUP BY mois
     ORDER BY mois ASC
     LIMIT 12`
  );
}