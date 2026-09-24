import db from '../config/db.js';
import { filterFor } from './scopeService.js';

/**
 * Agrégats du tableau de bord, restreints au périmètre de l'utilisateur.
 * Le périmètre est fourni par scopeService (agent, division, ou global).
 */

const CODES = [
  'RECU', 'ENREGISTRE', 'ORIENTE', 'AFFECTE', 'EN_TRAITEMENT',
  'SOUMIS_A_VERIFICATION', 'CORRECTION_DEMANDEE', 'VALIDE', 'SIGNE',
  'CLOTURE', 'ARCHIVE',
];

export async function getSummary(scope) {
  const f = await filterFor(scope);

  const [total] = await db.query(
    `SELECT COUNT(*) AS total FROM dossiers d WHERE 1=1${f.where}`,
    f.params
  );

  const stats = { total: total.total };

  // Un seul aller-retour pour tous les statuts.
  const rows = await db.query(
    `SELECT s.code, COUNT(d.id) AS total
     FROM statuts_dossiers s
     LEFT JOIN dossiers d ON d.statut_id = s.id
     WHERE 1=1${f.where}
     GROUP BY s.id, s.code`,
    f.params
  );
  const parCode = Object.fromEntries(rows.map((r) => [r.code, r.total]));
  for (const code of CODES) stats[code] = parCode[code] || 0;

  // Dossiers en retard : en attente depuis plus de 30 jours, non clôturés.
  const [retard] = await db.query(
    `SELECT COUNT(*) AS total FROM dossiers d
     JOIN statuts_dossiers s ON d.statut_id = s.id
     WHERE s.code NOT IN ('CLOTURE', 'ARCHIVE')
       AND d.date_reception < DATE_SUB(CURDATE(), INTERVAL 30 DAY)${f.where}`,
    f.params
  );
  stats.enRetard = retard.total;

  return stats;
}

export async function getByDivision(scope) {
  const f = await filterFor(scope);
  return db.query(
    `SELECT dv.nom AS division, COUNT(d.id) AS total
     FROM divisions dv
     LEFT JOIN dossiers d ON d.division_id = dv.id
     WHERE 1=1${f.where}
     GROUP BY dv.id, dv.nom
     ORDER BY dv.nom`,
    f.params
  );
}

export async function getByStatus(scope) {
  const f = await filterFor(scope);
  return db.query(
    `SELECT s.code, s.libelle AS statut, COUNT(d.id) AS total
     FROM statuts_dossiers s
     LEFT JOIN dossiers d ON d.statut_id = s.id
     WHERE 1=1${f.where}
     GROUP BY s.id, s.code, s.libelle
     ORDER BY s.ordre`,
    f.params
  );
}

export async function getEvolution(scope) {
  const f = await filterFor(scope);
  return db.query(
    `SELECT DATE_FORMAT(d.date_reception, '%Y-%m') AS mois, COUNT(*) AS total
     FROM dossiers d
     WHERE 1=1${f.where}
     GROUP BY mois
     ORDER BY mois ASC
     LIMIT 12`,
    f.params
  );
}

/**
 * Files d'attente par rôle (écrans décrits dans le cahier des charges).
 * Les libellés sont construits pour être affichés tels quels.
 */
export async function getFilesAttente(scope) {
  const f = await filterFor(scope);

  const files = {
    // Secrétariat : à orienter
    aOrienter: ['ENREGISTRE', 'ORIENTE'],
    // Chef de division : à affecter
    aAffecter: ['ENREGISTRE', 'ORIENTE'],
    // Agent : à prendre en charge
    aTraiter: ['AFFECTE'],
    // Agent : en cours
    enCours: ['EN_TRAITEMENT'],
    // Agent / chef : retours à corriger
    aCorriger: ['CORRECTION_DEMANDEE'],
    // Chef de division : contrôle
    aVerifier: ['SOUMIS_A_VERIFICATION'],
    // Chef de service : validation
    aValider: ['SOUMIS_A_VERIFICATION'],
    // Chef de service : signature
    aSigner: ['VALIDE'],
    // Clôture
    aCloturer: ['SIGNE'],
    // Archivage
    aArchiver: ['CLOTURE'],
    // Terminés
    termines: ['SIGNE', 'CLOTURE', 'ARCHIVE'],
  };

  const cles = Object.keys(files);
  const valeurs = files;

  const lignes = [];
  for (const cle of cles) {
    const codes = valeurs[cle];
    if (!codes.length) { lignes.push([cle, 0]); continue; }
    const placeholders = codes.map(() => '?').join(',');
    const [r] = await db.query(
      `SELECT COUNT(*) AS total FROM dossiers d
       JOIN statuts_dossiers s ON d.statut_id = s.id
       WHERE s.code IN (${placeholders})${f.where}`,
      [...codes, ...f.params]
    );
    lignes.push([cle, r.total]);
  }

  return Object.fromEntries(lignes);
}
