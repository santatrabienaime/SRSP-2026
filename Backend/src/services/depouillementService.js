import * as model from '../models/depouillementModel.js';
import * as historiqueModel from '../models/historiqueModel.js';
import * as notificationService from './notificationService.js';
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
 * Journalise l'acte (dépouillement) et notifie le secrétaire si incomplet/pièces reçues.
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

  // Après changement d'état d'une pièce, vérifier l'état d'incomplétude
  const resume = await model.getResume(dossierId);

  if (!presente) {
    // Pièce marquée manquante : vérifier si le dossier devient incomplet
    const manquantesObligatoires = resume.pieces
      .filter((p) => p.obligatoire === 1 && p.presente === 0)
      .map((p) => p.libelle);
    if (manquantesObligatoires.length > 0) {
      await notificationService.notifyDossierIncomplet(dossierId, manquantesObligatoires);
    }
  } else {
    // Pièce marquée présente : vérifier si c'était la dernière manquante
    const manquantesObligatoires = resume.pieces
      .filter((p) => p.obligatoire === 1 && p.presente === 0)
      .map((p) => p.libelle);
    if (manquantesObligatoires.length === 0) {
      // Plus aucune pièce obligatoire manquante : toutes reçues
      await notificationService.notifyPiecesRecues(dossierId, [piece]);
    } else {
      // Pièces reçues mais il en reste : notifier la réception de cette pièce
      await notificationService.notifyPiecesRecues(dossierId, [piece]);
    }
  }

  return { dossier_id: Number(dossierId), resume, pieces };
}

/** Historique des contrôles. */
export async function getHistorique(dossierId) {
  return model.findByDossier(dossierId);
}