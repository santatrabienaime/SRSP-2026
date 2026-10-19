import db from '../config/db.js';

/**
 * Indicateurs de pilotage du service entier.
 *
 * Aucun filtre de périmètre ici : c'est la différence assumée avec le tableau
 * de bord, qui suit les dossiers de l'utilisateur (agent / division / global).
 * L'écran Statistiques est donc la vue d'ensemble du service.
 */
export async function getStatistiques({ date_debut, date_fin } = {}) {
  let where = 'WHERE 1=1';
  /* Mêmes filtres de période, mais destinés au ON d'une jointure externe :
     une division ou un statut sans dossier doit rester affiché à zéro dans
     les répartitions, ce qu'un filtre placé dans le WHERE supprimerait. */
  let plage = '';
  const params = [];
  if (date_debut) {
    where += ' AND d.date_reception >= ?';
    plage += ' AND d.date_reception >= ?';
    params.push(date_debut);
  }
  if (date_fin) {
    where += ' AND d.date_reception <= ?';
    plage += ' AND d.date_reception <= ?';
    params.push(date_fin);
  }

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
  /* Dossiers en cours de traitement et dossiers encore en attente de prise en
     charge. Ces deux familles reprennent les mêmes regroupements que le triage
     de la liste des dossiers, afin que les chiffres des deux écrans concordent. */
  const [enCours] = await db.query(
    `SELECT COUNT(*) AS total FROM dossiers d JOIN statuts_dossiers s ON d.statut_id = s.id
     ${where} AND s.code IN ('ORIENTE', 'AFFECTE', 'EN_TRAITEMENT', 'SOUMIS_A_VERIFICATION', 'CORRECTION_DEMANDEE')`,
    params
  );
  const [enAttente] = await db.query(
    `SELECT COUNT(*) AS total FROM dossiers d JOIN statuts_dossiers s ON d.statut_id = s.id
     ${where} AND s.code IN ('RECU', 'ENREGISTRE')`,
    params
  );

  const tauxValidation = total.total > 0 ? (valides.total / total.total) * 100 : 0;
  const tauxRejet = total.total > 0 ? (rejetes.total / total.total) * 100 : 0;

  /* Répartitions du service entier. Le tableau de bord expose les mêmes
     répartitions mais restreintes au périmètre de l'utilisateur ; l'écran
     Statistiques a les siennes, cohérentes avec les totaux ci-dessus. */
  const parStatut = await db.query(
    `SELECT s.code, s.libelle, COUNT(d.id) AS total
     FROM statuts_dossiers s
     LEFT JOIN dossiers d ON d.statut_id = s.id${plage}
     GROUP BY s.id, s.code, s.libelle
     ORDER BY s.ordre`,
    params
  );
  const parDivision = await db.query(
    `SELECT dv.nom AS division, COUNT(d.id) AS total
     FROM divisions dv
     LEFT JOIN dossiers d ON d.division_id = dv.id${plage}
     GROUP BY dv.id, dv.nom
     ORDER BY dv.nom`,
    params
  );

  return {
    total: total.total,
    valides: valides.total,
    rejetes: rejetes.total,
    enCours: enCours.total,
    enAttente: enAttente.total,
    tauxValidation: Math.round(tauxValidation * 100) / 100,
    tauxRejet: Math.round(tauxRejet * 100) / 100,
    parStatut,
    parDivision,
  };
}