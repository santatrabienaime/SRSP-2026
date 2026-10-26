import db from '../config/db.js';
import { ETATS_PIECE, ETATS_PIECE_LIST, ETATS_PIECE_VALIDES } from '../utils/constants.js';

/**
 * Dépouillement des pièces d'un dossier.
 *
 * Les pièces requises ne sont plus globales : elles sont configurées par type
 * de dossier et, le cas échéant, par sous-type (type d'acte). Un dossier VISA
 * n'a donc pas à cocher les pièces du Secours, et inversement.
 *
 * Une pièce connaît six états : présente, absente (code historique
 * `MANQUANTE`), rejetée, illisible, à corriger, et non applicable.
 * « Présente » satisfait une pièce obligatoire ; « non applicable » la
 * satisfait aussi, parce que la pièce n'avait pas à être fournie — la traiter
 * comme absente bloquerait un dossier à tort. Les autres états restent
 * visibles et motivés : confondre une pièce absente ou rejetée avec une pièce
 * reçue reviendrait à valider un dossier incomplet.
 */

function normaliserEtat(etat, presente) {
  if (etat && ETATS_PIECE_LIST.includes(etat)) return etat;
  return presente ? ETATS_PIECE.PRESENTE : ETATS_PIECE.MANQUANTE;
}

/** Pièces applicables à un dossier, avec leur état. */
export async function getChecklist(dossier_id, phase = null) {
  const rows = await db.query(
    `SELECT tp.code, tp.libelle, tp.obligatoire, tp.phase, tp.ordre,
            tp.type_dossier_id, tp.sous_type_id,
            d.id AS depouillement_id, d.presente, d.etat, d.observation, d.motif,
            d.date_controle,
            ag.nom AS agent_nom, ag.prenom AS agent_prenom
     FROM dossiers dos
     JOIN types_pieces tp
       ON tp.actif = 1
      AND (tp.type_dossier_id IS NULL OR tp.type_dossier_id = dos.type_id)
      AND (tp.sous_type_id IS NULL OR tp.sous_type_id = dos.sous_type_id)
     LEFT JOIN depouillements d
       ON d.dossier_id = dos.id AND d.piece = tp.code
     LEFT JOIN agents ag ON ag.id = d.agent_id
     WHERE dos.id = ? ${phase ? 'AND tp.phase = ?' : ''}
     ORDER BY tp.phase, tp.ordre, tp.libelle`,
    phase ? [dossier_id, phase] : [dossier_id]
  );

  return rows.map((r) => {
    const etat = normaliserEtat(r.etat, !!r.presente);
    return {
      code: r.code,
      libelle: r.libelle,
      phase: r.phase,
      ordre: r.ordre,
      obligatoire: !!r.obligatoire,
      presente: ETATS_PIECE_VALIDES.includes(etat),
      etat,
      observation: r.observation,
      motif: r.motif,
      date_controle: r.date_controle,
      agent: r.agent_nom ? `${r.agent_prenom || ''} ${r.agent_nom}`.trim() : null,
      id: r.depouillement_id,
    };
  });
}

/** Vérifie qu'une pièce est bien applicable au dossier. */
async function pieceApplicable(dossier_id, piece) {
  const rows = await db.query(
    `SELECT tp.id
     FROM dossiers dos
     JOIN types_pieces tp
       ON tp.code = ?
      AND tp.actif = 1
      AND (tp.type_dossier_id IS NULL OR tp.type_dossier_id = dos.type_id)
      AND (tp.sous_type_id IS NULL OR tp.sous_type_id = dos.sous_type_id)
     WHERE dos.id = ?
     LIMIT 1`,
    [piece, dossier_id]
  );
  return Boolean(rows[0]);
}

/** Enregistre (ou met à jour) l'état d'une pièce. */
export async function savePiece({
  dossier_id, piece, presente, etat, observation, motif, agent_id,
}) {
  if (!(await pieceApplicable(dossier_id, piece))) {
    const err = new Error(`Pièce non applicable à ce dossier : ${piece}`);
    err.status = 400;
    throw err;
  }

  const etatFinal = normaliserEtat(etat, presente === undefined ? true : !!presente);

  // INSERT ... ON CONFLICT : un seul enregistrement par (dossier, pièce).
  await db.query(
    `INSERT INTO depouillements (dossier_id, piece, presente, etat, observation, motif, agent_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT (dossier_id, piece) DO UPDATE SET
       presente = EXCLUDED.presente,
       etat = EXCLUDED.etat,
       observation = EXCLUDED.observation,
       motif = EXCLUDED.motif,
       agent_id = EXCLUDED.agent_id,
       date_controle = NOW()`,
    [
      dossier_id,
      piece,
      ETATS_PIECE_VALIDES.includes(etatFinal) ? 1 : 0,
      etatFinal,
      observation || null,
      motif || null,
      agent_id || null,
    ]
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

/** Résumé : nombre de pièces obligatoires présentes / attendues, et manquantes.
 *  Le résumé global couvre les deux phases (dépouillement + archivage). */
export async function getResume(dossier_id) {
  const checklist = await getChecklist(dossier_id);
  const obligatoires = checklist.filter((c) => c.obligatoire);
  const total = obligatoires.length;
  const presentes = obligatoires.filter((c) => ETATS_PIECE_VALIDES.includes(c.etat)).length;
  return {
    total,
    presentes,
    manquantes: total - presentes,
    complet: total > 0 && presentes === total,
    pieces_manquantes: obligatoires
      .filter((c) => !ETATS_PIECE_VALIDES.includes(c.etat))
      .map((c) => c.libelle),
    pieces_a_traiter: obligatoires
      .filter((c) => !ETATS_PIECE_VALIDES.includes(c.etat))
      .map((c) => ({ code: c.code, libelle: c.libelle, etat: c.etat })),
    par_phase: {
      DEPOUILLEMENT: resumePhase(obligatoires, 'DEPOUILLEMENT'),
      ARCHIVAGE: resumePhase(obligatoires, 'ARCHIVAGE'),
    },
  };
}

function resumePhase(checklist, phase) {
  const items = checklist.filter((c) => c.phase === phase);
  const presentes = items.filter((c) => ETATS_PIECE_VALIDES.includes(c.etat)).length;
  return {
    total: items.length,
    presentes,
    manquantes: items.length - presentes,
    complet: items.length > 0 && presentes === items.length,
    pieces_manquantes: items
      .filter((c) => !ETATS_PIECE_VALIDES.includes(c.etat))
      .map((c) => c.libelle),
  };
}

/** Pièces obligatoires non satisfaites pour une phase donnée. */
export async function piecesObligatoiresNonSatisfaites(dossier_id, phase) {
  const checklist = await getChecklist(dossier_id, phase);
  return checklist.filter(
    (c) => c.obligatoire && !ETATS_PIECE_VALIDES.includes(c.etat)
  );
}
