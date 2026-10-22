import db from '../config/db.js';
import * as signalementModel from '../models/signalementModel.js';
import * as dossierModel from '../models/dossierModel.js';
import * as historiqueModel from '../models/historiqueModel.js';
import * as notificationModel from '../models/notificationModel.js';
import { httpError } from '../utils/httpError.js';

/**
 * Remontée des dossiers bloqués.
 *
 * Le problème que ce module résout est un problème de **circulation de
 * l'information**, pas de statut : un dossier en attente de complément est
 * visible dans sa division, mais le chef de service n'en sait rien. Le
 * signalement est le canal par lequel la difficulté monte, avec son motif,
 * et redescend avec une décision.
 *
 * Trois règles structurent le module :
 *
 *   1. un signalement ne change pas le statut du dossier — il ne s'y
 *      substitue pas ; le workflow reste la seule autorité sur le dossier ;
 *   2. un même auteur ne peut pas ouvrir deux signalements ouverts sur le
 *      même dossier : le second serait un doublon de couloir ;
 *   3. la résolution est écrite et horodatée. « C'est réglé » sans mot ne
 *      vaut pas une trace.
 */

const TYPES = ['BLOCAGE', 'INTERLOCUTION', 'ARBITRAGE'];
const PRIORITES = ['NORMALE', 'HAUTE', 'CRITIQUE'];
const LIBELLES_TYPES = {
  BLOCAGE: 'Dossier bloqué',
  INTERLOCUTION: 'Interlocution entre services',
  ARBITRAGE: 'Arbitrage demandé',
};

/** Profil de l'auteur : rôle et division, lus en base. */
async function profil(userId) {
  const [ligne] = await db.query(
    `SELECT u.id, r.nom AS role_nom, a.division_id
     FROM users u
     JOIN roles r ON r.id = u.role_id
     LEFT JOIN agents a ON a.user_id = u.id
     WHERE u.id = ?
     LIMIT 1`,
    [userId]
  );
  return ligne || null;
}

/** Le chef de division ne voit que sa division ; les autres voient tout. */
function restreindre(profilUtilisateur, divisionDemandee) {
  if (profilUtilisateur?.role_nom?.startsWith('CHEF_DIVISION_')) {
    return profilUtilisateur.division_id || -1;
  }
  return divisionDemandee || null;
}

/**
 * Ouvre un signalement sur un dossier.
 *
 * Le dossier doit exister. Sa division est celle du dossier, jamais celle
 * annoncée par l'appelant : un signalement rattaché à la mauvaise division
 * n'arriverait pas au bon chef.
 */
export async function signaler(dossierId, data, userId) {
  const dossier = await dossierModel.findDossierById(dossierId);
  if (!dossier) throw httpError(404, 'Dossier introuvable.');

  const type = TYPES.includes(data.type) ? data.type : 'BLOCAGE';
  const priorite = PRIORITES.includes(data.priorite) ? data.priorite : 'NORMALE';
  const motif = String(data.motif || '').trim();
  if (motif.length < 10) {
    throw httpError(422, 'Le motif du signalement doit être explicite (10 caractères minimum).');
  }

  const deja = await signalementModel.findOuvertDUneMemePersonne(dossierId, userId);
  if (deja) {
    throw httpError(
      409,
      'Vous avez déjà un signalement ouvert sur ce dossier. Suivez-le au lieu d’en ouvrir un second.'
    );
  }

  const id = await signalementModel.create({
    dossier_id: dossierId,
    division_id: dossier.division_id,
    signale_par: userId,
    type,
    priorite,
    motif,
  });

  await historiqueModel.log({
    user_id: userId,
    action: 'SIGNALEMENT_OUVERTURE',
    dossier_id: dossierId,
    details: `Signalement ${LIBELLES_TYPES[type].toLowerCase()} (${priorite.toLowerCase()}) : ${motif}`,
  });

  /* Le chef de service est le destinataire naturel : c'est lui qui arbitre
     au-dessus des divisions (registre 115, 116). Le chef de la division
     concernée est informé dans le même mouvement — il doit savoir que sa
     difficulté est montée, et à qui elle a été confiée. */
  await notificationModel.notifyRole('CHEF_SERVICE', {
    dossier_id: dossierId,
    action: 'SIGNALEMENT_OUVERT',
    type: priorite === 'CRITIQUE' ? 'ALERTE' : 'INFO',
    message: `Signalement ${LIBELLES_TYPES[type].toLowerCase()} sur le dossier ${dossier.numero} `
      + `(${dossier.division_nom || 'division inconnue'}) : ${motif}`,
    lien: '/signalements',
  }, { exclure: userId });

  await notificationModel.notifyDivision(dossier.division_id, {
    dossier_id: dossierId,
    action: 'SIGNALEMENT_DIVISION',
    type: 'INFO',
    message: `Un signalement a été ouvert sur le dossier ${dossier.numero} : ${motif}`,
    lien: `/dossiers/${dossierId}`,
  });

  return signalementModel.findById(id);
}

/** Liste filtrée, restreinte au périmètre de l'utilisateur. */
export async function lister(filtres, userId) {
  const monProfil = await profil(userId);
  const divisionId = restreindre(monProfil, filtres.division_id);
  return signalementModel.findAll({
    statut: filtres.statut || undefined,
    type: filtres.type || undefined,
    priorite: filtres.priorite || undefined,
    divisionId,
    dossierId: filtres.dossier_id || undefined,
    limit: filtres.limit,
  });
}

/** Signalements d'un dossier, visibles avec le dossier lui-même. */
export async function listerParDossier(dossierId) {
  return signalementModel.findByDossier(dossierId);
}

export async function detail(id) {
  const signalement = await signalementModel.findById(id);
  if (!signalement) throw httpError(404, 'Signalement introuvable.');
  return signalement;
}

/**
 * Prend en charge un signalement ouvert.
 *
 * On ne « prend » pas un signalement déjà pris : le second écraserait le
 * premier responsable, et la trace de qui l'a traité serait fausse.
 */
export async function prendreEnCharge(id, userId) {
  const signalement = await detail(id);
  if (signalement.statut !== 'OUVERT') {
    throw httpError(409, `Ce signalement est déjà ${signalement.statut.toLowerCase()}.`);
  }

  await signalementModel.prendreEnCharge(id, userId);

  await historiqueModel.log({
    user_id: userId,
    action: 'SIGNALEMENT_PRISE_EN_CHARGE',
    dossier_id: signalement.dossier_id,
    details: `Prise en charge du signalement n° ${id} (dossier ${signalement.dossier_numero}).`,
  });

  await notificationModel.notifyUser(signalement.signale_par, {
    dossier_id: signalement.dossier_id,
    action: 'SIGNALEMENT_PRIS',
    type: 'INFO',
    message: `Votre signalement sur le dossier ${signalement.dossier_numero} est pris en charge.`,
    lien: `/dossiers/${signalement.dossier_id}`,
  });

  return detail(id);
}

/**
 * Referme un signalement : résolu, ou rejeté avec son motif.
 *
 * Un rejet n'est pas un abandon : il porte lui aussi une résolution écrite.
 * C'est ce qui distingue une décision d'un oubli.
 */
export async function resoudre(id, { statut, resolution }, userId) {
  const cible = statut === 'REJETE' ? 'REJETE' : 'RESOLU';
  const texte = String(resolution || '').trim();
  if (texte.length < 10) {
    throw httpError(422, 'La résolution doit être explicite (10 caractères minimum).');
  }

  const signalement = await detail(id);
  if (!['OUVERT', 'EN_COURS'].includes(signalement.statut)) {
    throw httpError(409, 'Ce signalement est déjà refermé.');
  }

  await signalementModel.resoudre(id, { userId, statut: cible, resolution: texte });

  await historiqueModel.log({
    user_id: userId,
    action: cible === 'RESOLU' ? 'SIGNALEMENT_RESOLU' : 'SIGNALEMENT_REJETE',
    dossier_id: signalement.dossier_id,
    details: `Signalement n° ${id} ${cible === 'RESOLU' ? 'résolu' : 'rejeté'} : ${texte}`,
  });

  await notificationModel.notifyUser(signalement.signale_par, {
    dossier_id: signalement.dossier_id,
    action: cible === 'RESOLU' ? 'SIGNALEMENT_RESOLU' : 'SIGNALEMENT_REJETE',
    type: cible === 'RESOLU' ? 'SUCCES' : 'INFO',
    message: `Signalement sur le dossier ${signalement.dossier_numero} `
      + `${cible === 'RESOLU' ? 'résolu' : 'rejeté'} : ${texte}`,
    lien: `/dossiers/${signalement.dossier_id}`,
  });

  return detail(id);
}

/** Compteurs pour le tableau de bord : signalements non refermés. */
export async function compterOuverts(userId) {
  const monProfil = await profil(userId);
  const divisionId = monProfil?.role_nom?.startsWith('CHEF_DIVISION_')
    ? monProfil.division_id
    : null;
  return signalementModel.compterOuverts(divisionId);
}
