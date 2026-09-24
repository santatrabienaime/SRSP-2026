import * as dossierModel from '../models/dossierModel.js';
import { createArchive } from '../models/archiveModel.js';
import * as historiqueModel from '../models/historiqueModel.js';
import * as notificationModel from '../models/notificationModel.js';
import * as workflowService from './workflowService.js';
import * as tracabiliteService from './tracabiliteService.js';
import { STATUTS, STATUTS_PROTEGES } from '../utils/constants.js';
import { httpError } from '../utils/httpError.js';

const { ENREGISTRE, ORIENTE, AFFECTE, EN_TRAITEMENT, SOUMIS_A_VERIFICATION,
        CORRECTION_DEMANDEE, VALIDE, SIGNE, CLOTURE, ARCHIVE } = STATUTS;

export async function getAllDossiers(filters) {
  return dossierModel.findDossiers(filters);
}

export async function getDossierById(id) {
  return dossierModel.findDossierById(id);
}

export async function createDossier(data, userId) {
  const dossier = await dossierModel.createDossier({ ...data, created_by: userId });
  await historiqueModel.log({
    user_id: userId,
    action: 'CREATION_DOSSIER',
    dossier_id: dossier.id,
    details: `Création du dossier ${dossier.numero}`,
  });

  // Réception → enregistrement automatique à la création
  try {
    await workflowService.transition(dossier.id, ENREGISTRE, userId, 'Enregistrement lors de la réception.');
  } catch (e) {
    // Le passage RECU → ENREGISTRE est toujours autorisé ; silence par sécurité.
  }

  await historiqueModel.log({
    user_id: userId,
    action: 'ENREGISTREMENT',
    dossier_id: dossier.id,
    details: `Dossier ${dossier.numero} enregistré.`,
  });

  await notificationModel.notifyRole('SECRETAIRE', {
    type: 'INFO',
    message: `Nouveau dossier ${dossier.numero} enregistré.`,
    lien: `/dossiers/${dossier.id}`,
  });
  return dossier;
}

export async function updateDossier(id, data, userId) {
  const currentStatut = await workflowService.getCurrentStatus(id);
  if (STATUTS_PROTEGES.includes(currentStatut)) {
    throw httpError(409, 'Ce dossier est clôturé ou archivé : modification interdite.');
  }
  const dossier = await dossierModel.updateDossier(id, data);
  await historiqueModel.log({
    user_id: userId,
    action: 'MODIFICATION_DOSSIER',
    dossier_id: id,
    details: `Modification du dossier ${dossier.numero}`,
  });
  return dossier;
}

/** Orientation vers une division (ENREGISTRE → ORIENTE). */
export async function orienter(id, { division_id }, userId) {
  const current = await workflowService.getCurrentStatus(id);
  if (current !== ENREGISTRE && current !== ORIENTE) {
    throw httpError(409, `Orientation impossible depuis le statut ${current}.`);
  }
  await dossierModel.setDivision(id, division_id);
  if (current === ENREGISTRE) {
    await workflowService.transition(id, ORIENTE, userId, `Orientation vers la division ${division_id}.`);
  }
  await historiqueModel.log({
    user_id: userId,
    action: 'ORIENTATION',
    dossier_id: id,
    details: `Dossier orienté vers la division ${division_id}.`,
  });
}

/** Affectation à un agent (ORIENTE → AFFECTE). */
export async function affecter(id, { division_id, agent_id, motif }, userId) {
  const current = await workflowService.getCurrentStatus(id);
  if (![ENREGISTRE, ORIENTE, AFFECTE, CORRECTION_DEMANDEE].includes(current)) {
    throw httpError(409, `Affectation impossible depuis le statut ${current}.`);
  }
  if (division_id) await dossierModel.setDivision(id, division_id);
  await dossierModel.setAgentResponsable(id, agent_id);
  if (current !== AFFECTE) {
    if (current === ENREGISTRE) {
      await workflowService.transition(id, ORIENTE, userId, `Orientation vers la division ${division_id || ''}.`);
    }
    await workflowService.transition(id, AFFECTE, userId, `Affectation à l'agent ${agent_id}.`);
  }
  // Traçabilité fine : affectation (+ transfert si le dossier change d'agent)
  await tracabiliteService.tracerAffectation(id, {
    division_id, agent_id, motif, userId,
  });
  await historiqueModel.log({
    user_id: userId,
    action: 'AFFECTATION',
    dossier_id: id,
    nouvelle_valeur: `Agent ID ${agent_id}`,
  });
}

/** Prise en charge / traitement (AFFECTE ou CORRECTION_DEMANDEE → EN_TRAITEMENT). */
export async function traiter(id, { observation } = {}, userId) {
  const current = await workflowService.getCurrentStatus(id);
  if (current === EN_TRAITEMENT) {
    await historiqueModel.log({
      user_id: userId, action: 'TRAITEMENT', dossier_id: id, details: observation,
    });
    return;
  }
  if (![AFFECTE, CORRECTION_DEMANDEE].includes(current)) {
    throw httpError(409, `Traitement impossible depuis le statut ${current}.`);
  }
  await workflowService.transition(id, EN_TRAITEMENT, userId, observation);
  // Traçabilité fine : ouverture d'un traitement par l'agent qui prend en charge
  await tracabiliteService.tracerDebutTraitement(id, userId, observation);
}

/** Soumission à vérification ou demande de correction. */
export async function verifier(id, { resultat, observation }, userId) {
  const current = await workflowService.getCurrentStatus(id);
  if (resultat === 'OK') {
    if (current !== EN_TRAITEMENT) {
      throw httpError(409, `Soumission à vérification impossible depuis le statut ${current}.`);
    }
    await workflowService.transition(id, SOUMIS_A_VERIFICATION, userId, observation || 'Soumis à vérification.');
  } else {
    if (![EN_TRAITEMENT, SOUMIS_A_VERIFICATION].includes(current)) {
      throw httpError(409, `Demande de correction impossible depuis le statut ${current}.`);
    }
    await workflowService.transition(id, CORRECTION_DEMANDEE, userId, observation);
  }
  // Traçabilité fine : fermeture du traitement + trace du contrôle
  await tracabiliteService.tracerFinTraitement(id);
  await tracabiliteService.tracerVerification(id, userId, { resultat, observation });
  await historiqueModel.log({
    user_id: userId,
    action: 'VERIFICATION',
    dossier_id: id,
    details: observation,
  });
}

/** Décision de validation (SOUMIS_A_VERIFICATION → VALIDE | CORRECTION_DEMANDEE). */
export async function valider(id, { decision, commentaire }, userId) {
  const current = await workflowService.getCurrentStatus(id);
  if (current !== SOUMIS_A_VERIFICATION) {
    throw httpError(409, `Validation impossible depuis le statut ${current}.`);
  }
  if (decision === 'VALIDE') {
    await workflowService.transition(id, VALIDE, userId, commentaire);
  } else {
    await workflowService.transition(id, CORRECTION_DEMANDEE, userId, commentaire);
  }
  // Traçabilité fine : décision de validation
  await tracabiliteService.tracerValidation(id, userId, { decision, commentaire });
  await historiqueModel.log({
    user_id: userId,
    action: 'VALIDATION',
    dossier_id: id,
    nouvelle_valeur: decision,
    details: commentaire,
  });
}

/** Signature (VALIDE → SIGNE). */
export async function signer(id, { reference, observation }, userId) {
  const current = await workflowService.getCurrentStatus(id);
  if (current !== VALIDE) {
    throw httpError(409, `Signature impossible : le dossier doit être validé (statut actuel : ${current}).`);
  }
  await workflowService.transition(id, SIGNE, userId, observation);
  // Traçabilité fine : signature (décision validée par l'autorité signataire)
  await tracabiliteService.tracerValidation(id, userId, {
    decision: 'SIGNE', commentaire: reference || observation || null,
  });
  await historiqueModel.log({
    user_id: userId,
    action: 'SIGNATURE',
    dossier_id: id,
    details: `Référence de signature : ${reference || 'N/A'}${observation ? ` - ${observation}` : ''}`,
  });
}

export async function cloturer(id, userId) {
  const current = await workflowService.getCurrentStatus(id);
  if (current !== SIGNE) {
    throw httpError(409, `Clôture impossible : le dossier doit être signé (statut actuel : ${current}).`);
  }
  await workflowService.transition(id, CLOTURE, userId, 'Clôture du dossier.');
  await dossierModel.cloturer(id);
  await historiqueModel.log({ user_id: userId, action: 'CLOTURE', dossier_id: id });
}

export async function archiver(id, userId) {
  const current = await workflowService.getCurrentStatus(id);
  if (current !== CLOTURE) {
    throw httpError(409, `Archivage impossible : le dossier doit être clôturé (statut actuel : ${current}).`);
  }
  await workflowService.transition(id, ARCHIVE, userId, 'Archivage du dossier.');
  await dossierModel.archiver(id);
  await historiqueModel.log({ user_id: userId, action: 'ARCHIVAGE', dossier_id: id });
  await createArchive({ dossier_id: id, archive_par: userId, motif: 'Archivage automatique' });
}

export async function getStatutDossier(id) {
  return workflowService.getCurrentStatus(id);
}

export async function getTransitionsAutorisees(id) {
  const current = await workflowService.getCurrentStatus(id);
  return workflowService.getAllowedTransitions(current);
}

/** Timeline de traçabilité fine du dossier (affectations, traitements, etc.). */
export async function getTracabilite(id) {
  return tracabiliteService.getTimeline(id);
}