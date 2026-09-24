import db from '../config/db.js';

/**
 * Tracabilite fine du workflow (cahier des charges v2.0 §10).
 *
 * Ces tables existent déjà en base et décrivent chaque acte métier :
 *  - affectations  : qui a affecté le dossier, à quelle division, pour quel motif
 *  - traitements   : ouverture/fermeture d'un traitement par un agent
 *  - verifications : contrôle effectué et son résultat
 *  - validations   : décision de validation (valide_par = users.id)
 *  - transferts    : réaffectation d'un agent à un autre
 *
 * Ce module ne fait QUE du mapping d'écriture/lecture ; les règles métier
 * (quand ouvrir/fermer un traitement, quelle décision) restent dans
 * dossierService / workflowService.
 */

/* ------------------------------------------------------------------ */
/* Écritures                                                          */
/* ------------------------------------------------------------------ */

export async function insertAffectation({ dossier_id, division_id, agent_id, motif }) {
  await db.query(
    `INSERT INTO affectations (dossier_id, division_id, agent_id, motif)
     VALUES (?, ?, ?, ?)`,
    [dossier_id, division_id || null, agent_id || null, motif || null]
  );
}

export async function insertTransfert({ dossier_id, ancien_agent_id, nouveau_agent_id, motif }) {
  await db.query(
    `INSERT INTO transferts (dossier_id, ancien_agent_id, nouveau_agent_id, motif)
     VALUES (?, ?, ?, ?)`,
    [dossier_id, ancien_agent_id || null, nouveau_agent_id || null, motif || null]
  );
}

export async function insertTraitement({ dossier_id, agent_id, observation }) {
  await db.query(
    `INSERT INTO traitements (dossier_id, agent_id, observation)
     VALUES (?, ?, ?)`,
    [dossier_id, agent_id || null, observation || null]
  );
}

export async function cloturerTraitement(dossier_id) {
  await db.query(
    `UPDATE traitements
     SET date_fin = NOW()
     WHERE dossier_id = ? AND date_fin IS NULL
     ORDER BY id DESC
     LIMIT 1`,
    [dossier_id]
  );
}

export async function insertVerification({ dossier_id, agent_id, resultat, observation }) {
  await db.query(
    `INSERT INTO verifications (dossier_id, agent_id, resultat, observation)
     VALUES (?, ?, ?, ?)`,
    [dossier_id, agent_id || null, resultat || null, observation || null]
  );
}

export async function insertValidation({ dossier_id, valide_par, decision, commentaire }) {
  await db.query(
    `INSERT INTO validations (dossier_id, valide_par, decision, commentaire)
     VALUES (?, ?, ?, ?)`,
    [dossier_id, valide_par || null, decision || null, commentaire || null]
  );
}

/* ------------------------------------------------------------------ */
/* Résolutions user <-> agent                                         */
/* ------------------------------------------------------------------ */

/** Résout l'agent (agents.id) lié à un utilisateur (users.id). */
export async function getAgentIdByUser(user_id) {
  const rows = await db.query('SELECT id FROM agents WHERE user_id = ? LIMIT 1', [user_id]);
  return rows[0]?.id || null;
}

/** Agent actuellement responsable du dossier (agents.id). */
export async function getAgentResponsableId(dossier_id) {
  const rows = await db.query(
    `SELECT agent_responsable_id FROM dossiers WHERE id = ?`,
    [dossier_id]
  );
  return rows[0]?.agent_responsable_id || null;
}

/* ------------------------------------------------------------------ */
/* Lecture : timeline unifiée d'un dossier                            */
/* ------------------------------------------------------------------ */

/** Nom complet d'un agent à partir des colonnes agent_nom / agent_prenom. */
const agentName = (row) => `${row.agent_prenom || ''} ${row.agent_nom || ''}`.trim();

/**
 * Retourne tous les actes de traçabilité d'un dossier, triés par date,
 * chaque acte normalisé : { type, date, acteur, detail }.
 */
export async function getTimeline(dossier_id) {
  const [affectations, transferts, traitements, verifications, validations] = await Promise.all([
    db.query(
      `SELECT a.*, ag.nom AS agent_nom, ag.prenom AS agent_prenom, d.nom AS division_nom
       FROM affectations a
       LEFT JOIN agents ag ON ag.id = a.agent_id
       LEFT JOIN divisions d ON d.id = a.division_id
       WHERE a.dossier_id = ?
       ORDER BY a.date_affectation ASC`,
      [dossier_id]
    ),
    db.query(
      `SELECT t.*, anc.nom AS ancien_nom, anc.prenom AS ancien_prenom,
              nouv.nom AS nouveau_nom, nouv.prenom AS nouveau_prenom
       FROM transferts t
       LEFT JOIN agents anc ON anc.id = t.ancien_agent_id
       LEFT JOIN agents nouv ON nouv.id = t.nouveau_agent_id
       WHERE t.dossier_id = ?
       ORDER BY t.date_transfert ASC`,
      [dossier_id]
    ),
    db.query(
      `SELECT tr.*, ag.nom AS agent_nom, ag.prenom AS agent_prenom
       FROM traitements tr
       LEFT JOIN agents ag ON ag.id = tr.agent_id
       WHERE tr.dossier_id = ?
       ORDER BY tr.date_debut ASC`,
      [dossier_id]
    ),
    db.query(
      `SELECT v.*, ag.nom AS agent_nom, ag.prenom AS agent_prenom
       FROM verifications v
       LEFT JOIN agents ag ON ag.id = v.agent_id
       WHERE v.dossier_id = ?
       ORDER BY v.date_verification ASC`,
      [dossier_id]
    ),
    db.query(
      `SELECT va.*, u.username AS valideur_username
       FROM validations va
       LEFT JOIN users u ON u.id = va.valide_par
       WHERE va.dossier_id = ?
       ORDER BY va.date_validation ASC`,
      [dossier_id]
    ),
  ]);

  const acts = [];

  for (const a of affectations) {
    acts.push({
      type: 'AFFECTATION',
      date: a.date_affectation,
      acteur: agentName(a),
      detail: [
        a.division_nom ? `Division : ${a.division_nom}` : null,
        a.motif,
      ].filter(Boolean).join(' — '),
    });
  }

  for (const t of transferts) {
    acts.push({
      type: 'TRANSFERT',
      date: t.date_transfert,
      acteur: '',
      detail: [
        t.ancien_nom ? `De ${t.ancien_prenom || ''} ${t.ancien_nom}`.trim() : null,
        t.nouveau_nom ? `vers ${t.nouveau_prenom || ''} ${t.nouveau_nom}`.trim() : null,
        t.motif,
      ].filter(Boolean).join(' '),
    });
  }

  for (const tr of traitements) {
    acts.push({
      type: 'TRAITEMENT',
      date: tr.date_debut,
      acteur: agentName(tr),
      detail: [
        tr.date_fin ? `Clôturé le ${new Date(tr.date_fin).toLocaleString('fr-FR')}` : 'En cours',
        tr.observation,
      ].filter(Boolean).join(' — '),
    });
  }

  for (const v of verifications) {
    acts.push({
      type: 'VERIFICATION',
      date: v.date_verification,
      acteur: agentName(v),
      detail: [v.resultat, v.observation].filter(Boolean).join(' — '),
    });
  }

  for (const va of validations) {
    acts.push({
      type: 'VALIDATION',
      date: va.date_validation,
      acteur: va.valideur_username || '',
      detail: [va.decision, va.commentaire].filter(Boolean).join(' — '),
    });
  }

  acts.sort((a, b) => new Date(a.date) - new Date(b.date));
  return acts;
}
