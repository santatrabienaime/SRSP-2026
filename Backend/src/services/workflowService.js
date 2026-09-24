import db from '../config/db.js';
import * as dossierModel from '../models/dossierModel.js';
import * as historiqueModel from '../models/historiqueModel.js';
import * as notificationModel from '../models/notificationModel.js';
import { DIVISION_CHEF_ROLE } from '../utils/constants.js';
import { httpError } from '../utils/httpError.js';

/**
 * Transitions autorisées conformes au cahier des charges v2.0 (§10.2).
 * RECU → ENREGISTRE → ORIENTE → AFFECTE → EN_TRAITEMENT
 * EN_TRAITEMENT → SOUMIS_A_VERIFICATION
 * SOUMIS_A_VERIFICATION → VALIDE | CORRECTION_DEMANDEE
 * CORRECTION_DEMANDEE → EN_TRAITEMENT   (règle forte : jamais directement VALIDE)
 * VALIDE → SIGNE → CLOTURE → ARCHIVE
 */
const TRANSITIONS = {
  RECU: ['ENREGISTRE'],
  ENREGISTRE: ['ORIENTE'],
  ORIENTE: ['AFFECTE'],
  AFFECTE: ['EN_TRAITEMENT'],
  EN_TRAITEMENT: ['SOUMIS_A_VERIFICATION', 'CORRECTION_DEMANDEE'],
  SOUMIS_A_VERIFICATION: ['VALIDE', 'CORRECTION_DEMANDEE'],
  CORRECTION_DEMANDEE: ['EN_TRAITEMENT'],
  VALIDE: ['SIGNE'],
  SIGNE: ['CLOTURE'],
  CLOTURE: ['ARCHIVE'],
  ARCHIVE: [],
};

export function canTransition(fromStatus, toStatus) {
  return TRANSITIONS[fromStatus]?.includes(toStatus) || false;
}

export async function getCurrentStatus(dossierId) {
  const rows = await db.query(
    `SELECT s.code FROM dossiers d
     JOIN statuts_dossiers s ON d.statut_id = s.id
     WHERE d.id = ?`,
    [dossierId]
  );
  return rows[0]?.code;
}

/**
 * Notifie les acteurs concernés après un changement de statut.
 *
 * Chaque notification est adressee a une personne identifiee :
 *  - le responsable DESIGNE de la division (divisions.responsable_id) pour les
 *    actes de division, plutot que tous les membres du role ;
 *  - l'agent responsable du dossier pour les actes qui le concernent ;
 *  - le titulaire du role (Chef de Service / Secretaire) pour la validation,
 *    la signature et la cloture, qui ne relevent d'aucune division.
 */
async function notifyForTransition(dossierId, toStatus) {
  const info = await dossierModel.findDivisionOfDossier(dossierId); // { division_id, agent_responsable_id }
  const lien = `/dossiers/${dossierId}`;
  const numero = await getDossierNumero(dossierId);
  const dossier_id = dossierId;
  const division_id = info?.division_id;

  const config = {
    ORIENTE: () => notificationModel.notifyDivision(division_id, {
      dossier_id, action: 'ORIENTE', type: 'WORKFLOW',
      message: `Dossier ${numero} orienté vers votre division.`, lien,
    }),
    AFFECTE: () => notificationModel.notifyAgent(info?.agent_responsable_id, {
      dossier_id, action: 'AFFECTE', type: 'AFFECTATION',
      message: `Le dossier ${numero} vous a été affecté pour traitement.`, lien,
    }),
    SOUMIS_A_VERIFICATION: () => notificationModel.notifyDivision(division_id, {
      dossier_id, action: 'SOUMIS_A_VERIFICATION', type: 'VERIFICATION',
      message: `Le dossier ${numero} est soumis à votre vérification.`, lien,
    }),
    CORRECTION_DEMANDEE: () => notificationModel.notifyAgent(info?.agent_responsable_id, {
      dossier_id, action: 'CORRECTION_DEMANDEE', type: 'CORRECTION',
      message: `Des corrections sont demandées sur le dossier ${numero}.`, lien,
    }),
    VALIDE: () => notificationModel.notifyRole('CHEF_SERVICE', {
      dossier_id, action: 'VALIDE', type: 'VALIDATION',
      message: `Le dossier ${numero} est validé et attend votre signature.`, lien,
    }),
    SIGNE: () => notificationModel.notifyRole('SECRETAIRE', {
      dossier_id, action: 'SIGNE', type: 'SIGNATURE',
      message: `Le dossier ${numero} a été signé et peut être clôturé.`, lien,
    }),
    CLOTURE: () => notificationModel.notifyRole('CHEF_SERVICE', {
      dossier_id, action: 'CLOTURE', type: 'CLOTURE',
      message: `Le dossier ${numero} est clôturé et peut être archivé.`, lien,
    }),
  };

  if (config[toStatus]) await config[toStatus]();
}

async function getDossierNumero(dossierId) {
  const rows = await db.query('SELECT numero FROM dossiers WHERE id = ?', [dossierId]);
  return rows[0]?.numero || `#${dossierId}`;
}

export async function transition(dossierId, toStatus, userId, details = '') {
  const current = await getCurrentStatus(dossierId);
  if (!current) throw httpError(404, 'Dossier introuvable.');
  if (!canTransition(current, toStatus)) {
    throw httpError(409,
      `Transition invalide : ${current} → ${toStatus}. Transitions autorisées : ${TRANSITIONS[current].join(', ') || 'aucune'}`
    );
  }

  await dossierModel.updateStatut(dossierId, toStatus);
  await historiqueModel.log({
    user_id: userId,
    action: 'CHANGEMENT_STATUT',
    dossier_id: dossierId,
    ancienne_valeur: current,
    nouvelle_valeur: toStatus,
    details,
  });

  await notifyForTransition(dossierId, toStatus);

  return { dossierId, from: current, to: toStatus };
}

export function getAllowedTransitions(currentStatus) {
  return TRANSITIONS[currentStatus] || [];
}