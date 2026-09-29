import * as M from '../models/secoursModel.js';
import * as mandatementModel from '../models/mandatementModel.js';
import { accesDossier } from '../services/scopeService.js';
import { httpError } from '../utils/httpError.js';

/**
 * Division Secours : visa du CF, état d'émargement, cachet, références du
 * logiciel secours, signature de l'ordonnateur.
 *
 * Les routes sont en `/dossiers/:id/...` comme toutes les autres routes du
 * mandatement, et non en `/mandatements/:id/...`. Le dossier est déjà le point
 * d'entrée partout ailleurs : introduire un second identifiant obligerait
 * l'agent à translator un numéro en l'autre à chaque écran, et créerait deux
 * façons d'adresser la même chose.
 *
 * Le périmètre est vérifié avant chaque écriture : un agent ne doit pas
 * atteindre un mandatement d'une autre division en devinant son identifiant.
 */

/** Vérifie l'accès au dossier, ou refuse. */
async function exigerAcces(userId, dossierId) {
  const autorise = await accesDossier(userId, dossierId);
  if (!autorise) {
    throw httpError(403, "Vous n'avez pas accès à ce dossier.");
  }
}

/** Accès au dossier, puis mandatement associé. */
async function mandatementAccessible(userId, dossierId) {
  await exigerAcces(userId, dossierId);
  const mandat = await mandatementModel.findMandatement(dossierId);
  if (!mandat) {
    throw httpError(404, 'Ce dossier ne comporte pas encore de mandatement.');
  }
  return mandat;
}

/* --- 1.1 Réception du dossier du contrôle financier --- */

export async function enregistrerVisa(req, res, next) {
  try {
    const dossierId = Number(req.params.id);
    await exigerAcces(req.user.id, dossierId);
    res.status(201).json(await M.enregistrerVisa(dossierId, req.body, req.user.id));
  } catch (e) { next(e); }
}

export async function getVisa(req, res, next) {
  try {
    await exigerAcces(req.user.id, Number(req.params.id));
    res.json(await M.findVisa(Number(req.params.id)));
  } catch (e) { next(e); }
}

/**
 * Le dossier est-il réceptionnable ?
 *
 * Exige le visa du CF ET les quatre pièces du PGA. Le visa est vérifié à part
 * car c'est le document lui-même qui est visé, non une pièce jointe.
 */
export async function etatReception(req, res, next) {
  try {
    const dossierId = Number(req.params.id);
    await exigerAcces(req.user.id, dossierId);
    res.json(await M.etatReception(dossierId));
  } catch (e) { next(e); }
}

/* --- 1.6 Références du logiciel secours et état d'émargement --- */

export async function referencesLogiciel(req, res, next) {
  try {
    const mandat = await mandatementAccessible(req.user.id, Number(req.params.id));
    res.json(await M.calculerReferences(mandat.id));
  } catch (e) { next(e); }
}

export async function marquerReference(req, res, next) {
  try {
    const mandat = await mandatementAccessible(req.user.id, Number(req.params.id));
    res.json(await M.marquerReferenceReportee(mandat.id, req.params.code, req.user.id));
  } catch (e) { next(e); }
}

export async function genererEmargement(req, res, next) {
  try {
    const mandat = await mandatementAccessible(req.user.id, Number(req.params.id));
    res.json(await M.genererEtatEmargement(mandat.id, req.user.id));
  } catch (e) { next(e); }
}

export async function getEmargement(req, res, next) {
  try {
    const mandat = await mandatementAccessible(req.user.id, Number(req.params.id));
    res.json(await M.findEtatEmargement(mandat.id));
  } catch (e) { next(e); }
}

export async function signerEmargement(req, res, next) {
  try {
    const mandat = await mandatementAccessible(req.user.id, Number(req.params.id));
    res.json(await M.signerEmargement(mandat.id, Number(req.params.beneficiaire), req.body));
  } catch (e) { next(e); }
}

/* --- 1.7 Signature des pièces par l'ordonnateur --- */

export async function enregistrerSignature(req, res, next) {
  try {
    const mandat = await mandatementAccessible(req.user.id, Number(req.params.id));
    res.status(201).json(
      await M.enregistrerSignatureOrdonnateur(mandat.id, req.body, req.user.id)
    );
  } catch (e) { next(e); }
}

export async function getSignature(req, res, next) {
  try {
    const mandat = await mandatementAccessible(req.user.id, Number(req.params.id));
    res.json(await M.findSignature(mandat.id));
  } catch (e) { next(e); }
}

export async function archiverCopie(req, res, next) {
  try {
    const mandat = await mandatementAccessible(req.user.id, Number(req.params.id));
    res.json(await M.archiverCopieSignee(mandat.id));
  } catch (e) { next(e); }
}

/* --- 2.4 Cachet, titre et date de l'ordonnateur --- */

export async function apposerCachet(req, res, next) {
  try {
    const mandat = await mandatementAccessible(req.user.id, Number(req.params.id));
    res.json(await M.apposerCachet(mandat.id, req.body, req.user.id));
  } catch (e) { next(e); }
}

export async function getCachet(req, res, next) {
  try {
    const mandat = await mandatementAccessible(req.user.id, Number(req.params.id));
    res.json(await M.findCachet(mandat.id));
  } catch (e) { next(e); }
}

/**
 * Vue d'ensemble des cinq étapes, comme un agent les vit.
 *
 * Il ne se demande pas « le cachet est-il posé ? » : il regarde où en est le
 * mandat. Les cinq étapes sont donc renvoyées ensemble, chacune consultable
 * seule par ailleurs.
 */
export async function etatComplet(req, res, next) {
  try {
    const mandat = await mandatementAccessible(req.user.id, Number(req.params.id));
    res.json(await M.etatMandatement(mandat.id));
  } catch (e) { next(e); }
}
