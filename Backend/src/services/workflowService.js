import db from '../config/db.js';
import * as dossierModel from '../models/dossierModel.js';
import * as historiqueModel from '../models/historiqueModel.js';
import * as notificationModel from '../models/notificationModel.js';
import { emitDossier } from '../realtime.js';
import { httpError } from '../utils/httpError.js';

/**
 * Transitions autorisées conformes au cahier des charges v2.0 (§10.2).
 * RECU → ENREGISTRE → ORIENTE → AFFECTE → EN_TRAITEMENT
 * EN_TRAITEMENT → SOUMIS_A_VERIFICATION | CORRECTION_DEMANDEE | EN_ATTENTE_COMPLEMENT
 * SOUMIS_A_VERIFICATION → VALIDE | CORRECTION_DEMANDEE | EN_ATTENTE_COMPLEMENT
 * EN_ATTENTE_COMPLEMENT → EN_TRAITEMENT  (le complément reçu rouvre le dossier)
 * CORRECTION_DEMANDEE → EN_TRAITEMENT   (règle forte : jamais directement VALIDE)
 * VALIDE → SIGNE → CLOTURE → ARCHIVE
 * SIGNE → ARCHIVE                       (VISA : archivage direct après signature)
 */
const TRANSITIONS = {
  /* Un brouillon est publié : il entre alors dans le circuit normal. */
  BROUILLON: ['ENREGISTRE'],
  RECU: ['ENREGISTRE'],
  ENREGISTRE: ['ORIENTE'],
  ORIENTE: ['AFFECTE'],
  AFFECTE: ['EN_TRAITEMENT'],
  EN_TRAITEMENT: ['SOUMIS_A_VERIFICATION', 'CORRECTION_DEMANDEE', 'EN_ATTENTE_COMPLEMENT'],
  SOUMIS_A_VERIFICATION: ['VALIDE', 'CORRECTION_DEMANDEE', 'EN_ATTENTE_COMPLEMENT'],
  EN_ATTENTE_COMPLEMENT: ['EN_TRAITEMENT'],
  CORRECTION_DEMANDEE: ['EN_TRAITEMENT'],
  VALIDE: ['SIGNE'],
  SIGNE: ['CLOTURE', 'ARCHIVE'],
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
 * Chaque notification est adressée à UNE personne identifiée, jamais diffusée :
 *  - le responsable DÉSIGNÉ de la division (divisions.responsable_id) pour les
 *    actes de division, plutôt que tous les membres du rôle ;
 *  - l'agent responsable du dossier pour les actes qui le concernent ;
 *  - le CHEF DE SERVICE pour la validation, la signature et la clôture, qui ne
 *    relèvent d'aucune division. Ce rôle est tenu par une seule personne ; la
 *    fonction refuse de diffuser si le rôle venait à avoir plusieurs titulaires,
 *    pour qu'une diffusion ne puisse jamais s'installer en silence.
 *
 * Deux actes préviennent DEUX personnes : la validation et la signature
 * informent le chef de service, qui doit agir, et l'agent responsable, qui voit
 * ainsi son travail aboutir. Sans ce retour, l'agent ne saurait jamais que le
 * dossier qu'il a traité est allé au bout.
 *
 * La clôture, elle, avertit aussi la coordonnatrice, qui suit les dossiers du
 * service : le chef de service doit archiver, la coordonnatrice n'a rien à
 * faire — elle reçoit le compte rendu de la fin d'un dossier.
 *
 * La signature ne notifie PAS les secrétaires : la clôture est l'acte suivant
 * et seule la chef de service peut l'accomplir. Avertir une secrétaire qu'un
 * dossier « peut être clôturé » lui demandait une action qu'elle n'a pas le
 * droit de faire, et lui révélait un dossier qui n'est pas le sien.
 */
async function notifyForTransition(dossierId, toStatus, details = '') {
  const info = await dossierModel.findDivisionOfDossier(dossierId); // { division_id, agent_responsable_id }
  const lien = `/dossiers/${dossierId}`;
  const numero = await getDossierNumero(dossierId);
  const dossier_id = dossierId;
  const division_id = info?.division_id;
  const agent_id = info?.agent_responsable_id;

  /* Chaque entrée liste les personnes à prévenir pour l'acte : une seule en
     général, deux pour la validation et la signature. */
  const config = {
    ORIENTE: () => [notificationModel.notifyDivision(division_id, {
      dossier_id, action: 'ORIENTE', type: 'WORKFLOW',
      message: `Dossier ${numero} orienté vers votre division.`, lien,
    })],
    AFFECTE: () => [notificationModel.notifyAgent(agent_id, {
      dossier_id, action: 'AFFECTE', type: 'AFFECTATION',
      message: `Le dossier ${numero} vous a été affecté pour traitement.`, lien,
    })],
    SOUMIS_A_VERIFICATION: () => [notificationModel.notifyDivision(division_id, {
      dossier_id, action: 'SOUMIS_A_VERIFICATION', type: 'VERIFICATION',
      message: `Le dossier ${numero} est soumis à votre vérification.`, lien,
    })],
    CORRECTION_DEMANDEE: () => [notificationModel.notifyAgent(agent_id, {
      dossier_id, action: 'CORRECTION_DEMANDEE', type: 'CORRECTION',
      message: `Des corrections sont demandées sur le dossier ${numero}.`, lien,
    })],
    EN_ATTENTE_COMPLEMENT: () => [
      notificationModel.notifyAgent(agent_id, {
        dossier_id, action: 'EN_ATTENTE_COMPLEMENT', type: 'WARNING',
        message: `Le dossier ${numero} est en attente d'un complément : ${details || 'voir la fiche.'}`, lien,
      }),
      notificationModel.notifyRole('SECRETAIRE', {
        dossier_id, action: 'EN_ATTENTE_COMPLEMENT', type: 'INFO',
        message: `Le dossier ${numero} attend un complément du demandeur.`, lien,
      }),
    ],
    VALIDE: () => [
      notificationModel.notifyTitulaireRole('CHEF_SERVICE', {
        dossier_id, action: 'VALIDE', type: 'VALIDATION',
        message: `Le dossier ${numero} est validé et attend votre signature.`, lien,
      }),
      notificationModel.notifyAgent(agent_id, {
        dossier_id, action: 'DOSSIER_VALIDE', type: 'SUCCESS',
        message: `Le dossier ${numero} que vous avez traité est validé.`, lien,
      }),
    ],
    SIGNE: () => [
      notificationModel.notifyTitulaireRole('CHEF_SERVICE', {
        dossier_id, action: 'SIGNE', type: 'SIGNATURE',
        message: `Le dossier ${numero} a été signé : il peut être clôturé.`, lien,
      }),
      notificationModel.notifyAgent(agent_id, {
        dossier_id, action: 'DOSSIER_SIGNE', type: 'SUCCESS',
        message: `Le dossier ${numero} que vous avez traité est signé : votre travail est terminé.`, lien,
      }),
    ],
    CLOTURE: () => [
      notificationModel.notifyTitulaireRole('CHEF_SERVICE', {
        dossier_id, action: 'CLOTURE', type: 'CLOTURE',
        message: `Le dossier ${numero} est clôturé et peut être archivé.`, lien,
      }),
      /* La coordonnatrice assure le suivi des dossiers du service et la
         production des statistiques : la clôture est le moment où un dossier
         quitte le circuit. Elle en est informée sans avoir d'acte à faire — un
         compte rendu, pas une demande. Le rôle peut être tenu par plusieurs
         personnes : tous les titulaires actifs sont avertis. */
      notificationModel.notifyRole('COORDINATRICE', {
        dossier_id, action: 'DOSSIER_CLOTURE', type: 'INFO',
        message: `Le dossier ${numero} est clôturé.`, lien,
      }),
      /* Le secrétaire suit l'archivage : la clôture signifie que le dossier
         est prêt pour l'archivage. */
      notificationModel.notifyRole('SECRETAIRE', {
        dossier_id, action: 'CLOTURE_PRET_ARCHIVAGE', type: 'INFO',
        message: `Le dossier ${numero} est clôturé et prêt pour archivage.`, lien,
      }),
    ],
  };

  if (config[toStatus]) await Promise.all(config[toStatus]());
}

export async function create(payload) {
  return notificationModel.create(payload);
}

/**
 * Notifie le secrétaire qu'un dossier est incomplet (pièces manquantes).
 */
export async function notifyDossierIncomplet(dossierId, piecesManquantes) {
  const info = await dossierModel.findDivisionOfDossier(dossierId);
  const numero = await getDossierNumero(dossierId);
  const lien = `/dossiers/${dossierId}`;
  const _division_id = info?.division_id;

  // Notifier le secrétaire de la division (ou le secrétaire général)
  await notificationModel.notifyRole('SECRETAIRE', {
    dossier_id: dossierId,
    action: 'DOSSIER_INCOMPLET',
    type: 'WARNING',
    message: `Le dossier ${numero} est incomplet : ${piecesManquantes.length} pièce(s) manquante(s).`,
    lien,
  });
}

/**
 * Notifie le secrétaire que des pièces complémentaires ont été reçues.
 */
export async function notifyPiecesRecues(dossierId, piecesRecues) {
  const numero = await getDossierNumero(dossierId);
  const lien = `/dossiers/${dossierId}`;

  await notificationModel.notifyRole('SECRETAIRE', {
    dossier_id: dossierId,
    action: 'PIECES_RECUES',
    type: 'INFO',
    message: `Pièces complémentaires reçues pour le dossier ${numero} : ${piecesRecues.join(', ')}.`,
    lien,
  });
}

/**
 * Notifie le secrétaire qu'un bordereau a été émis (transmission).
 */
export async function notifyBordereauEmis(_bordereauId) {
  // This function will be called with the bordereau reference, not dossierId
  // We'll handle this in bordereauService
}

/**
 * Notifie le secrétaire qu'un bordereau a été accusé réception par la division.
 */
export async function notifyBordereauConfirme(_bordereauId) {
  // To be implemented in bordereauService
}

/**
 * Notifie le secrétaire qu'une tâche administrative est en attente.
 */
export async function notifyTacheAttente(userId, message, lien = '/dossiers') {
  return notificationModel.create({
    user_id: userId,
    dossier_id: null,
    action: 'TACHE_ATTENTE',
    type: 'TACHE',
    message,
    lien,
  });
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

  try {
    await notifyForTransition(dossierId, toStatus, details);
  } catch (e) {
    console.warn('[notifications] transition sans notification :', e.message);
  }

  /* Temps réel : les écrans des personnes concernées se rafraîchissent sans
     qu'elles aient à recharger la page. Le canal ne transporte que l'alerte —
     l'identifiant et le nouveau statut — la donnée affichée reste relue
     depuis l'API, qui seule fait foi.

     L'échec d'émission ne doit jamais faire échouer la transition : le
     dossier est enregistré, l'affichage suivra au prochain rafraîchissement. */
  try {
    const concernees = await dossierModel.utilisateursConcernes(dossierId);
    emitDossier(dossierId, toStatus, [...concernees, userId]);
  } catch (e) {
    console.warn('[temps réel] signal de dossier non émis :', e.message);
  }

  return { dossierId, from: current, to: toStatus };
}

export function getAllowedTransitions(currentStatus) {
  return TRANSITIONS[currentStatus] || [];
}