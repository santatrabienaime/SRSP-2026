import * as model from '../models/depouillementModel.js';
import * as historiqueModel from '../models/historiqueModel.js';
import db from '../config/db.js';

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
  return { dossier_id: Number(dossierId), resume, pieces };
}

/**
 * Enregistre l'état d'une pièce.
 * journalise l'acte (dépouillement) et refuse de valider un dossier
 * dont toutes les pièces obligatoires ne sont pas présentes.
 */
export async function controlerPiece(dossierId, { piece, presente, observation }, userId) {
  const agentId = await agentIdOf(userId);
  const pieces = await model.savePiece({
    dossier_id: dossierId,
    piece,
    presente,
    observation,
    agent_id: agentId,
  });

  await historiqueModel.log({
    user_id: userId,
    action: 'DEPOUILLEMENT',
    dossier_id: dossierId,
    nouvelle_valeur: `${piece} : ${presente ? 'présente' : 'manquante'}`,
    details: observation || null,
  });

  const resume = await model.getResume(dossierId);
  return { dossier_id: Number(dossierId), resume, pieces };
}

/** Historique des contrôles. */
export async function getHistorique(dossierId) {
  return model.findByDossier(dossierId);
}
