import * as traceModel from '../models/tracabiliteModel.js';

/**
 * Règles métier de la traçabilité fine (cahier v2.0 §10).
 *
 * Le workflow global (statuts) reste piloté par workflowService ; ce service
 * enregistre en plus, dans les tables métier prévues par le cahier, QUI a
 * fait QUOI et QUAND :
 *
 *  - orienter/affecter  -> affectations (+ transferts si ré-affectation)
 *  - traiter            -> traitements (ouverture, puis fermeture à la sortie)
 *  - vérifier          -> verifications
 *  - valider / signer  -> validations
 */

/** Résout l'agent (agents.id) de l'utilisateur qui agit. */
async function agentOf(userId) {
  return traceModel.getAgentIdByUser(userId);
}

/**
 * Enregistre une affectation. Si le dossier avait déjà un agent responsable
 * différent, on trace aussi le transfert.
 */
export async function tracerAffectation(dossierId, { division_id, agent_id, motif, userId }) {
  const ancienAgentId = await traceModel.getAgentResponsableId(dossierId);
  await traceModel.insertAffectation({
    dossier_id: dossierId,
    division_id: division_id || null,
    agent_id: agent_id || null,
    motif: motif || null,
  });
  if (ancienAgentId && agent_id && ancienAgentId !== agent_id) {
    await traceModel.insertTransfert({
      dossier_id: dossierId,
      ancien_agent_id: ancienAgentId,
      nouveau_agent_id: agent_id,
      motif: motif || 'Réaffectation',
    });
  }
  return ancienAgentId;
}

/** Ouvre un traitement pour l'agent qui prend en charge. */
export async function tracerDebutTraitement(dossierId, userId, observation) {
  const agentId = await agentOf(userId);
  await traceModel.insertTraitement({
    dossier_id: dossierId,
    agent_id: agentId,
    observation: observation || null,
  });
}

/** Ferme le traitement en cours (soumission à vérification ou correction). */
export async function tracerFinTraitement(dossierId) {
  await traceModel.cloturerTraitement(dossierId);
}

/** Trace un contrôle : résultat + observation. */
export async function tracerVerification(dossierId, userId, { resultat, observation }) {
  const agentId = await agentOf(userId);
  await traceModel.insertVerification({
    dossier_id: dossierId,
    agent_id: agentId,
    resultat: resultat || null,
    observation: observation || null,
  });
}

/** Trace une décision de validation (valide_par référence users.id). */
export async function tracerValidation(dossierId, userId, { decision, commentaire }) {
  await traceModel.insertValidation({
    dossier_id: dossierId,
    valide_par: userId,
    decision: decision || null,
    commentaire: commentaire || null,
  });
}

/** Timeline unifiée d'un dossier. */
export async function getTimeline(dossierId) {
  return traceModel.getTimeline(dossierId);
}
