import db from '../config/db.js';

/**
 * Trace durable des suppressions de dossiers.
 *
 * Le journal d'un dossier vit dans `historique_actions`, lié à `dossiers` par
 * une clé étrangère `ON DELETE CASCADE`. Une suppression physique effaçait
 * donc le journal — et la trace de la suppression elle-même.
 *
 * Cette table, sans clé étrangère vers `dossiers`, garde ce qui doit
 * rester lisible après la suppression : l'identité du dossier, son motif, son
 * auteur, la date, et l'instantané du journal.
 */

/** Enregistre la suppression et l'instantané du journal. */
export async function createSuppression(dossier, { motif, userId, username, historique }) {
  const result = await db.query(
    `INSERT INTO suppressions_dossiers
       (dossier_id, numero, reference_visa, type_code, objet, demandeur, matricule,
        division_nom, statut_code, agent_nom, date_reception, motif,
        supprime_par, supprime_par_nom, historique_json, nb_actions_historique)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      dossier.id,
      dossier.numero,
      dossier.reference_visa || null,
      dossier.type_code || null,
      dossier.objet || null,
      dossier.demandeur || null,
      dossier.matricule || null,
      dossier.division_nom || null,
      dossier.statut_code || null,
      dossier.agent_nom || null,
      dossier.date_reception || null,
      motif,
      userId || null,
      username || null,
      historique ? JSON.stringify(historique) : null,
      Array.isArray(historique) ? historique.length : 0,
    ]
  );
  return { id: result.insertId };
}

/** Journal d'un dossier, figé avant sa suppression. */
export async function historiqueDuDossier(dossierId) {
  return db.query(
    `SELECT h.date_action, h.action, h.details, h.ancienne_valeur, h.nouvelle_valeur,
            u.username AS auteur
     FROM historique_actions h
     LEFT JOIN users u ON u.id = h.user_id
     WHERE h.dossier_id = ?
     ORDER BY h.date_action ASC, h.id ASC`,
    [dossierId]
  );
}

/** Liste des suppressions, de la plus récente à la plus ancienne. */
export async function listSuppressions({ limite = 200 } = {}) {
  return db.query(
    `SELECT s.*, u.username AS auteur
     FROM suppressions_dossiers s
     LEFT JOIN users u ON u.id = s.supprime_par
     ORDER BY s.date_suppression DESC, s.id DESC
     LIMIT ?`,
    [Number(limite) || 200]
  );
}

/** Une suppression précise, avec son journal figé. */
export async function findSuppression(id) {
  const rows = await db.query(
    'SELECT * FROM suppressions_dossiers WHERE id = ?',
    [id]
  );
  if (!rows[0]) return null;
  const dossier = rows[0];
  let historique = null;
  if (dossier.historique_json) {
    try {
      historique = JSON.parse(dossier.historique_json);
    } catch {
      historique = null;
    }
  }
  return { ...dossier, historique };
}
