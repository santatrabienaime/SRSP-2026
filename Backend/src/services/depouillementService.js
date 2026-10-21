import * as model from '../models/depouillementModel.js';
import * as historiqueModel from '../models/historiqueModel.js';
import * as notificationService from './notificationService.js';
import db from '../config/db.js';
import { ETATS_PIECE, ETATS_PIECE_LABELS, ETATS_PIECE_VALIDES, ETATS_PIECE_A_MOTIVER } from '../utils/constants.js';
import { httpError } from '../utils/httpError.js';

/** Résout l'agent (agents.id) lié à l'utilisateur qui agit. */
async function agentIdOf(userId) {
  const rows = await db.query('SELECT id FROM agents WHERE user_id = ? LIMIT 1', [userId]);
  return rows[0]?.id || null;
}

/** Checklist complète + résumé d'un dossier. */
export async function getChecklist(dossierId) {
  const [pieces, resume] = await Promise.all([
    model.getChecklist(dossierId),
    model.getResume(dossierId),
  ]);
  return {
    dossier_id: Number(dossierId),
    resume,
    depouillement: pieces.filter((p) => p.phase === 'DEPOUILLEMENT'),
    archivage: pieces.filter((p) => p.phase === 'ARCHIVAGE'),
    pieces,
  };
}

/**
 * Enregistre l'état d'une pièce.
 *
 * Une pièce qui n'est pas « présente » doit être motivée : « illisible » ou
 * « à corriger » sans explication ne permet pas à l'agent de savoir quoi
 * rapporter. Le motif est conservé et affiché dans la fiche.
 */
export async function controlerPiece(
  dossierId,
  { piece, presente, etat, observation, motif },
  userId
) {
  const etatFinal = etat
    || (presente ? ETATS_PIECE.PRESENTE : ETATS_PIECE.MANQUANTE);

  if (!Object.values(ETATS_PIECE).includes(etatFinal)) {
    throw httpError(422, 'État de pièce invalide.');
  }
  if (ETATS_PIECE_A_MOTIVER.includes(etatFinal) && !String(motif || observation || '').trim()) {
    throw httpError(
      422,
      `Une pièce « ${ETATS_PIECE_LABELS[etatFinal]} » doit être motivée.`
    );
  }

  const agentId = await agentIdOf(userId);
  const pieces = await model.savePiece({
    dossier_id: dossierId,
    piece,
    presente: ETATS_PIECE_VALIDES.includes(etatFinal),
    etat: etatFinal,
    observation,
    motif,
    agent_id: agentId,
  });

  await historiqueModel.log({
    user_id: userId,
    action: 'DEPOUUILLEMENT',
    dossier_id: dossierId,
    nouvelle_valeur: `${piece} : ${ETATS_PIECE_LABELS[etatFinal]}`,
    details: motif || observation || null,
  });

  // Après changement d'état d'une pièce, vérifier l'état d'incomplétude.
  const resume = await model.getResume(dossierId);

  if (!ETATS_PIECE_VALIDES.includes(etatFinal)) {
    const manquantesObligatoires = resume.pieces_a_traiter.map((p) => p.libelle);
    if (manquantesObligatoires.length > 0) {
      await notificationService.notifyDossierIncomplet(dossierId, manquantesObligatoires);
    }
  } else {
    // Une pièce reçue est signalée au secrétariat, qu'il en reste ou non :
    // c'est le retour attendu par la personne qui a déposé le complément.
    await notificationService.notifyPiecesRecues(dossierId, [piece]);
  }

  return { dossier_id: Number(dossierId), resume, pieces };
}

/** Historique des contrôles. */
export async function getHistorique(dossierId) {
  return model.findByDossier(dossierId);
}
