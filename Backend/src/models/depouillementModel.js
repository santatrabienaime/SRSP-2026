import db from '../config/db.js';

/**
 * Dépouillement des pièces d'un dossier de secours.
 *
 * Le cahier des charges impose le contrôle de 6 pièces obligatoires.
 * On renvoie toujours la checklist complète : pièces présentes/absentes,
 * avec la dernière observation de l'agent.
 */

/** Pièces à contrôler pour un dossier donné, avec leur état.
 *  `phase` = 'DEPOUILLEMENT' (pièces reçues du contrôle financier)
 *          ou 'ARCHIVAGE'   (pièces du dossier de décès). */
export async function getChecklist(dossier_id, phase = null) {
  const rows = await db.query(
    `SELECT tp.code, tp.libelle, tp.obligatoire, tp.phase, tp.ordre,
            d.id AS depouillement_id, d.presente, d.observation, d.date_controle,
            ag.nom AS agent_nom, ag.prenom AS agent_prenom
     FROM types_pieces tp
     LEFT JOIN depouillements d
       ON d.dossier_id = ? AND d.piece = tp.code
     LEFT JOIN agents ag ON ag.id = d.agent_id
     WHERE tp.obligatoire = 1 ${phase ? 'AND tp.phase = ?' : ''}
     ORDER BY tp.phase, tp.ordre`,
    phase ? [dossier_id, phase] : [dossier_id]
  );

  return rows.map((r) => ({
    code: r.code,
    libelle: r.libelle,
    phase: r.phase,
    ordre: r.ordre,
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

/** Résumé : nombre de pièces présentes / attendues, et pièces manquantes.
 *  Le résumé global couvre les deux phases (dépouillement + archivage). */
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
    par_phase: {
      DEPOUILLEMENT: resumePhase(checklist, 'DEPOUILLEMENT'),
      ARCHIVAGE: resumePhase(checklist, 'ARCHIVAGE'),
    },
  };
}

function resumePhase(checklist, phase) {
  const items = checklist.filter((c) => c.phase === phase);
  const presentes = items.filter((c) => c.presente).length;
  return {
    total: items.length,
    presentes,
    manquantes: items.length - presentes,
    complet: items.length > 0 && presentes === items.length,
    pieces_manquantes: items.filter((c) => !c.presente).map((c) => c.libelle),
  };
}
