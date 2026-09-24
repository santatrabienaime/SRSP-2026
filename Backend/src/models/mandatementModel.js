import db from '../config/db.js';

/* ------------------------------------------------------------------ */
/* Mandatement (Chef de Division Secours)                             */
/* ------------------------------------------------------------------ */

export async function findMandatement(dossier_id) {
  const rows = await db.query(
    `SELECT m.*, ag.nom AS ordonnateur_nom, ag.prenom AS ordonnateur_prenom
     FROM mandatements m
     LEFT JOIN agents ag ON ag.id = m.ordonnateur_id
     WHERE m.dossier_id = ?`,
    [dossier_id]
  );
  const mandatement = rows[0];
  if (!mandatement) return null;

  const [beneficiaires, pieces] = await Promise.all([
    db.query(
      `SELECT * FROM mandatement_beneficiaires
       WHERE mandatement_id = ? ORDER BY id`,
      [mandatement.id]
    ),
    db.query(
      `SELECT mp.code, mp.libelle, mp.ordre, COALESCE(mpe.imprimee, 0) AS imprimee,
              mpe.date_impression
       FROM mandatement_pieces mp
       LEFT JOIN mandatement_pieces_etat mpe
         ON mpe.piece_code = mp.code AND mpe.mandatement_id = ?
       ORDER BY mp.ordre`,
      [mandatement.id]
    ),
  ]);

  return { ...mandatement, beneficiaires, pieces };
}

/** Crée ou met à jour le mandatement avec ses bénéficiaires. */
export async function saveMandatement({ dossier_id, montant_total, observation, beneficiaires }) {
  const [res] = await db.pool.execute(
    `INSERT INTO mandatements (dossier_id, montant_total, observation)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE
       montant_total = VALUES(montant_total),
       observation = VALUES(observation)`,
    [dossier_id, montant_total, observation || null]
  );
  // insertId n'est pas exploitable en ON DUPLICATE : on relit l'identifiant.
  const rows = await db.query('SELECT id, etat FROM mandatements WHERE dossier_id = ?', [dossier_id]);
  const mandatement = rows[0];

  // Les bénéficiaires sont remplacés à chaque enregistrement (liste cohérente).
  await db.query('DELETE FROM mandatement_beneficiaires WHERE mandatement_id = ?', [mandatement.id]);
  for (const b of beneficiaires) {
    await db.query(
      `INSERT INTO mandatement_beneficiaires
         (mandatement_id, nom, prenom, lien, quote_part, montant, matricule)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [mandatement.id, b.nom, b.prenom || null, b.lien || null,
       b.quote_part, b.montant, b.matricule || null]
    );
  }

  // Une entrée d'état est créée pour chaque pièce du mandatement.
  for (const p of piecesDeReference()) {
    await db.query(
      `INSERT IGNORE INTO mandatement_pieces_etat (mandatement_id, piece_code)
       VALUES (?, ?)`,
      [mandatement.id, p.code]
    );
  }

  return findMandatement(dossier_id);
}

let _pieces = null;
export function piecesDeReference() {
  return _pieces || [];
}
export async function chargerPiecesReference() {
  if (!_pieces) {
    _pieces = await db.query('SELECT code, libelle, ordre FROM mandatement_pieces ORDER BY ordre');
  }
  return _pieces;
}

export async function marquerPieceImprimee(dossier_id, piece_code, imprimee = true) {
  const m = await db.query('SELECT id FROM mandatements WHERE dossier_id = ?', [dossier_id]);
  if (!m[0]) return null;
  await db.query(
    `INSERT INTO mandatement_pieces_etat (mandatement_id, piece_code, imprimee, date_impression)
     VALUES (?, ?, ?, IF(?, NOW(), NULL))
     ON DUPLICATE KEY UPDATE
       imprimee = VALUES(imprimee),
       date_impression = VALUES(date_impression)`,
    [m[0].id, piece_code, imprimee ? 1 : 0, imprimee ? 1 : 0]
  );
  return findMandatement(dossier_id);
}

export async function changerEtatMandatement(dossier_id, etat, agentId) {
  const champs = { ORDONNANCE: 'ordonnancement_date = NOW(), ordonnateur_id = ?',
                   LIQUIDE: 'liquidation_date = NOW()' };
  if (!champs[etat]) return findMandatement(dossier_id);
  await db.query(
    `UPDATE mandatements SET etat = ?, ${champs[etat]} WHERE dossier_id = ?`,
    etat === 'ORDONNANCE' ? [etat, agentId || null, dossier_id] : [etat, dossier_id]
  );
  return findMandatement(dossier_id);
}

/* ------------------------------------------------------------------ */
/* Correspondances (Chef de Division Pensions)                         */
/* ------------------------------------------------------------------ */

export const TYPES_CORRESPONDANCE = {
  LETTRE_PRESCRIPTION: 'Lettre de prescription',
  DEMANDE_DOSSIERE_MERE: 'Demande de dossier mère',
  OPPOSITION_PENSION_ALIMENTAIRE: 'Opposition (pension alimentaire)',
  OPPOSITION_CESSION_VOLONTAIRE: 'Opposition (cession volontaire)',
  OPPOSITION_SAISIE_ARRET: 'Opposition (saisie arrêt)',
};

export async function findCorrespondances(dossier_id = null) {
  const params = [];
  let where = '';
  if (dossier_id) { where = ' WHERE c.dossier_id = ?'; params.push(dossier_id); }
  return db.query(
    `SELECT c.*, d.numero AS dossier_numero, u.username AS auteur
     FROM correspondances c
     LEFT JOIN dossiers d ON d.id = c.dossier_id
     LEFT JOIN users u ON u.id = c.created_by
     ${where}
     ORDER BY c.created_at DESC`,
    params
  );
}

export async function saveCorrespondance(data, userId) {
  const res = await db.query(
    `INSERT INTO correspondances
       (dossier_id, type, destinataire, objet, contenu, etat, date_envoi, created_by)
     VALUES (?, ?, ?, ?, ?, ?, IF(? = 'ENVOYEE', NOW(), NULL), ?)`,
    [data.dossier_id || null, data.type, data.destinataire, data.objet,
     data.contenu || null, data.etat, data.etat, userId]
  );
  const rows = await db.query('SELECT * FROM correspondances WHERE id = ?', [res.insertId]);
  return rows[0];
}
