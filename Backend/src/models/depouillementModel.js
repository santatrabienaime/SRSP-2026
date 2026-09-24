import db from '../config/db.js';

/**
 * Dépouillement des pièces d'un dossier de secours.
 *
 * Le cahier des charges impose le contrôle de 6 pièces obligatoires.
 * On renvoie toujours la checklist complète : pièces présentes/absentes,
 * avec la dernière observation de l'agent.
 */

/** Pièces à contrôler pour un dossier donné, avec leur état. */
export async function getChecklist(dossier_id) {
  const rows = await db.query(
    `SELECT tp.code, tp.libelle, tp.obligatoire,
            d.id AS depouillement_id, d.presente, d.observation, d.date_controle,
            ag.nom AS agent_nom, ag.prenom AS agent_prenom
     FROM types_pieces tp
     LEFT JOIN depouillements d
       ON d.dossier_id = ? AND d.piece = tp.code
     LEFT JOIN agents ag ON ag.id = d.agent_id
     WHERE tp.obligatoire = 1
     ORDER BY tp.id`,
    [dossier_id]
  );

  return rows.map((r) => ({
    code: r.code,
    libelle: r.libelle,
    obligatoire: !!r.obligatoire,
    presente: !!r.presente,
    observation: r.observation,
    date_controle: r.date_controle,
    agent: r.agent_nom ? `${r.agent_prenom || ''} ${r.agent_nom}`.trim() : null,
    id: r.depouillement_id,
  }));
}

/** Enregistre (ou met à jour) l'état d'une pièce. */
export async function savePiece({ dossier_id, piece, presente, observation, agent_id }) {
  const rows = await db.query(
    'SELECT id FROM types_pieces WHERE code = ?',
    [piece]
  );
  if (!rows[0]) {
    const err = new Error(`Pièce inconnue : ${piece}`);
    err.status = 400;
    throw err;
  }

  // INSERT ... ON DUPLICATE : un seul enregistrement par (dossier, pièce).
  await db.query(
    `INSERT INTO depouillements (dossier_id, piece, presente, observation, agent_id)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       presente = VALUES(presente),
       observation = VALUES(observation),
       agent_id = VALUES(agent_id),
       date_controle = NOW()`,
    [dossier_id, piece, presente ? 1 : 0, observation || null, agent_id || null]
  );

  return getChecklist(dossier_id);
}

/** Historique complet des contrôles d'un dossier. */
export async function findByDossier(dossier_id) {
  return db.query(
    `SELECT d.*, tp.libelle, ag.nom AS agent_nom, ag.prenom AS agent_prenom
     FROM depouillements d
     JOIN types_pieces tp ON tp.code = d.piece
     LEFT JOIN agents ag ON ag.id = d.agent_id
     WHERE d.dossier_id = ?
     ORDER BY d.date_controle DESC`,
    [dossier_id]
  );
}

/** Résumé : nombre de pièces présentes / attendues, et pièces manquantes. */
export async function getResume(dossier_id) {
  const checklist = await getChecklist(dossier_id);
  const total = checklist.length;
  const presentes = checklist.filter((c) => c.presente).length;
  return {
    total,
    presentes,
    manquantes: total - presentes,
    complet: total > 0 && presentes === total,
    pieces_manquantes: checklist.filter((c) => !c.presente).map((c) => c.libelle),
  };
}
