import db from '../config/db.js';

/**
 * Archives : consultation, recherche, tri, restauration.
 *
 * La table `archives` est la source de référence : elle porte la date
 * d'archivage horodatée, l'agent ayant archivé, le motif, et l'indicateur de
 * restauration. Le champ `dossiers.date_archivage` n'est qu'une date, sans
 * auteur ni motif : s'en servir ferait perdre l'information de qui a archivé.
 *
 * Un dossier archivé n'est plus modifiable. La colonne `restaure` permet de
 * garder la trace d'une restauration : le dossier redevient clôturé, mais
 * l'archive reste dans l'historique avec la mention correspondante.
 */

/**
 * Enregistre l'archivage d'un dossier. Utilisé par le service dossier.
 *
 * Si le dossier avait été restauré puis réarchivé, sa ligne d'archive
 * précédente est réutilisée plutôt que dupliquée : sinon chaque aller-retour
 * laissait une ligne de plus, et les dossiers archivés comptés deux fois.
 */
export async function createArchive({ dossier_id, archive_par, motif }) {
  const [precedente] = await db.query(
    'SELECT id FROM archives WHERE dossier_id = ? ORDER BY id DESC LIMIT 1',
    [dossier_id]
  );
  if (precedente) {
    await db.query(
      'UPDATE archives SET date_archivage = CURRENT_TIMESTAMP, archive_par = ?, motif = ?, restaure = FALSE WHERE id = ?',
      [archive_par || null, motif || null, precedente.id]
    );
    return { id: precedente.id };
  }
  const result = await db.query(
    'INSERT INTO archives (dossier_id, archive_par, motif) VALUES (?, ?, ?)',
    [dossier_id, archive_par || null, motif || null]
  );
  return { id: result.insertId };
}

/** Tris acceptés. La colonne est choisie par liste blanche, jamais concaténée. */
export const TRIS = {
  'archivage_desc': 'a.date_archivage DESC, d.numero DESC',
  'archivage_asc': 'a.date_archivage ASC, d.numero ASC',
  'numero_asc': 'd.numero ASC',
  'numero_desc': 'd.numero DESC',
  'demandeur_asc': 'd.demandeur ASC, d.numero ASC',
  'type_asc': 't.libelle ASC, d.numero ASC',
  'division_asc': 'dv.nom ASC, d.numero ASC',
  'agent_asc': 'ag.nom IS NULL, ag.nom ASC, d.numero ASC',
};

export const LIBELLES_TRIS = {
  'archivage_desc': "Date d'archivage (récent → ancien)",
  'archivage_asc': "Date d'archivage (ancien → récent)",
  'numero_asc': 'Numéro de dossier (A → Z)',
  'numero_desc': 'Numéro de dossier (Z → A)',
  'demandeur_asc': 'Nom du demandeur (A → Z)',
  'type_asc': 'Type de dossier',
  'division_asc': 'Division',
  'agent_asc': 'Agent responsable',
};

/** Colonnes de restitution communes à la liste et à l'export. */
const SELECT_COLONNES = `
  d.id, d.numero, d.objet, d.demandeur, d.matricule,
  /* a.id est distinct de d.id : sans lui, une action portant sur la ligne
     d'archive (restauration) viserait l'archive de ce numéro de dossier —
     souvent inexistante, donc silencieusement sans effet. */
  a.id AS archive_id,
  d.date_reception, d.date_cloture, d.observation,
  t.id AS type_id, t.code AS type_code, t.libelle AS type_libelle,
  dv.id AS division_id, dv.code AS division_code, dv.nom AS division_nom,
  p.libelle AS priorite_libelle,
  ag.id AS agent_id, ag.nom AS agent_nom, ag.prenom AS agent_prenom,
  a.date_archivage, a.motif AS motif_archivage, a.restaure,
  au.username AS archive_par
`;

/**
 * Construit le WHERE commun à la liste, à l'export et aux statistiques.
 * `filtres` vient du contrôleur : aucune valeur n'est concaténée dans le SQL.
 */
function conditions(filtres = {}) {
  const where = ['a.restaure = FALSE'];
  const params = [];

  if (filtres.q) {
    /* Recherche large : couvre le numéro, le demandeur, le CIN, l'objet et le
       mot-clé. On normalise les espaces pour que « Rakoto  Jean » et
       « Rakoto Jean » donnent le même résultat. */
    const q = String(filtres.q).trim().replace(/\s+/g, ' ');
    if (q) {
      where.push(`(
        d.numero LIKE ? OR d.demandeur LIKE ? OR d.matricule LIKE ?
        OR d.objet LIKE ? OR d.observation LIKE ? OR a.motif LIKE ?
        OR ag.nom LIKE ? OR ag.prenom LIKE ?
      )`);
      const motif = `%${q}%`;
      params.push(motif, motif, motif, motif, motif, motif, motif, motif);
    }
  }

  if (filtres.type_id) { where.push('t.id = ?'); params.push(Number(filtres.type_id)); }
  if (filtres.type_code) { where.push('t.code = ?'); params.push(String(filtres.type_code)); }
  if (filtres.division_id) { where.push('dv.id = ?'); params.push(Number(filtres.division_id)); }
  if (filtres.annee) {
    // L'année porte sur l'ARCHIVAGE, pas sur la création : c'est ce que
    // cherche l'utilisateur d'une archive.
    where.push('YEAR(a.date_archivage) = ?');
    params.push(Number(filtres.annee));
  }
  if (filtres.date_debut) { where.push('a.date_archivage >= ?'); params.push(filtres.date_debut); }
  if (filtres.date_fin) {
    // Borne haute incluse jusqu'au soir : sinon un dossier archivé le 30 à
    // 10:00 serait exclu par un `date_fin` à 30/09/00:00.
    where.push('a.date_archivage < DATE_ADD(?, INTERVAL 1 DAY)');
    params.push(filtres.date_fin);
  }
  if (filtres.agent_id) { where.push('ag.id = ?'); params.push(Number(filtres.agent_id)); }
  if (filtres.demandeur) {
    where.push('d.demandeur LIKE ?');
    params.push(`%${filtres.demandeur}%`);
  }
  if (filtres.matricule) {
    /* Le CIN est saisi avec ou sans espaces. On compare sur la version
       compactée des deux côtés, sinon « 101 234 567 890 » ne trouverait pas un
       dossier enregistré « 101234567890 ». */
    where.push('REPLACE(REPLACE(IFNULL(d.matricule, \'\'), \' \', \'\'), \'-\', \'\') LIKE ?');
    params.push(`%${String(filtres.matricule).replace(/[\s-]/g, '')}%`);
  }

  return { where, params };
}

const FROM = `
  FROM archives a
  JOIN dossiers d ON d.id = a.dossier_id
  JOIN types_dossiers t ON t.id = d.type_id
  JOIN divisions dv ON dv.id = d.division_id
  JOIN priorites p ON p.id = d.priorite_id
  LEFT JOIN agents ag ON ag.id = d.agent_responsable_id
  LEFT JOIN users au ON au.id = a.archive_par
`;

/**
 * Liste paginée des archives.
 * `filtres.division_id` est forcefullyOverridden par le périmètre : c'est le
 * service qui l'impose, jamais le client.
 */
export async function rechercher(filtres = {}, { limit = 20, offset = 0 } = {}) {
  const { where, params } = conditions(filtres);
  const tri = TRIS[filtres.tri] || TRIS.archivage_desc;

  const lignes = await db.query(
    `SELECT ${SELECT_COLONNES} ${FROM}
     WHERE ${where.join(' AND ')}
     ORDER BY ${tri}
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );

  const [total] = await db.query(
    `SELECT COUNT(*) AS total ${FROM} WHERE ${where.join(' AND ')}`,
    params
  );

  return { lignes, total: total?.total ?? 0 };
}

/** Toutes les lignes correspondant aux filtres (export, sans pagination). */
export async function tousLesDossiers(filtres = {}, { max = 5000 } = {}) {
  const { where, params } = conditions(filtres);
  const tri = TRIS[filtres.tri] || TRIS.archivage_desc;
  return db.query(
    `SELECT ${SELECT_COLONNES} ${FROM}
     WHERE ${where.join(' AND ')}
     ORDER BY ${tri}
     LIMIT ?`,
    [...params, Number(max)]
  );
}

/** Une archive par son dossier. */
export async function parDossierId(dossierId) {
  const rows = await db.query(
    `SELECT ${SELECT_COLONNES} ${FROM} WHERE a.dossier_id = ? AND a.restaure = FALSE LIMIT 1`,
    [dossierId]
  );
  return rows[0] || null;
}

/** Une archive par son identifiant. */
export async function findById(id) {
  const rows = await db.query('SELECT * FROM archives WHERE id = ?', [id]);
  return rows[0];
}

/**
 * Enregistre une restauration et sa trace.
 * Le motif est écrit dès l'insertion : une restauration doit pouvoir être
 * auditée, et NULLifier puis compléter une trace n'apporterait rien.
 */
export async function marquerRestauration(archiveId, dossierId, userId, motif) {
  await db.query('UPDATE archives SET restaure = TRUE WHERE id = ?', [archiveId]);
  await db.query(
    'INSERT INTO historique_actions (user_id, action, dossier_id, details) VALUES (?, ?, ?, ?)',
    [
      userId,
      'RESTAURATION_ARCHIVE',
      dossierId,
      `Dossier restauré depuis les archives — motif : ${motif}`,
    ]
  );
}

/**
 * Statistiques d'archives : total, répartition par division et par année,
 * et durée moyenne entre réception et archivage.
 */
export async function statistiques(filtres = {}) {
  const { where, params } = conditions(filtres);

  const parDivision = await db.query(
    `SELECT dv.nom AS division, COUNT(*) AS total ${FROM}
     WHERE ${where.join(' AND ')}
     GROUP BY dv.id, dv.nom ORDER BY total DESC`,
    params
  );

  const parAnnee = await db.query(
    `SELECT YEAR(a.date_archivage) AS annee, COUNT(*) AS total ${FROM}
     WHERE ${where.join(' AND ')}
     GROUP BY annee ORDER BY annee DESC`,
    params
  );

  const [global] = await db.query(
    `SELECT COUNT(*) AS total,
            AVG(DATEDIFF(a.date_archivage, d.date_reception)) AS duree_moyenne
     ${FROM} WHERE ${where.join(' AND ')}`,
    params
  );

  return {
    total: global?.total ?? 0,
    duree_moyenne: global?.duree_moyenne === null ? null : Math.round(global?.duree_moyenne ?? 0),
    par_division: parDivision,
    par_annee: parAnnee,
  };
}

/**
 * Archives arrivant à expiration de conservation.
 *
 * Les durées viennent du document : Visa 10 ans, Solde 30 ans, Pension
 * 50 ans (conservation permanente, donc jamais purgé), Secours 30 ans.
 * Elles sont regroupées par type et par année pour ne pas ramener des
 * milliers de lignes.
 */
const DURES_CONSERVATION = { VISA: 10, SOLDE: 30, PENSION: 50, SECOURS: 30 };

export async function alertesConservation(filtres = {}, { joursAvant = 90 } = {}) {
  const { where, params } = conditions(filtres);
  const parType = await db.query(
    `SELECT t.code AS type_code, t.libelle AS type_libelle, COUNT(*) AS total ${FROM}
     WHERE ${where.join(' AND ')}
     GROUP BY t.id, t.code, t.libelle`,
    params
  );

  const alertes = [];
  for (const ligne of parType) {
    const duree = DURES_CONSERVATION[ligne.type_code];
    if (!duree) continue;
    // Pension : conservation permanente, on n'alerte jamais.
    if (duree >= 50) continue;

    const [bilan] = await db.query(
      `SELECT MIN(a.date_archivage) AS plus_ancien, COUNT(*) AS total ${FROM}
       WHERE ${where.join(' AND ')} AND t.code = ?`,
      [...params, ligne.type_code]
    );
    if (!bilan?.plus_ancien) continue;

    const expiration = new Date(bilan.plus_ancien);
    expiration.setFullYear(expiration.getFullYear() + duree);
    const jours = Math.ceil((expiration - new Date()) / 86400000);
    if (jours <= joursAvant) {
      alertes.push({
        type_code: ligne.type_code,
        type_libelle: ligne.type_libelle,
        duree_ans: duree,
        dossiers: bilan.total,
        date_expiration: expiration.toISOString().slice(0, 10),
        jours_restants: jours,
        // Une échéance dépassée se purge, elle ne se reporte pas.
        expire: jours < 0,
      });
    }
  }
  return alertes.sort((a, b) => a.jours_restants - b.jours_restants);
}

export { DURES_CONSERVATION };
