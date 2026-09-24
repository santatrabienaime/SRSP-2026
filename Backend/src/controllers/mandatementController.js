import * as service from '../services/mandatementService.js';
import * as model from '../models/mandatementModel.js';

/* --- Mandatement --- */

export async function getMandatement(req, res, next) {
  try { res.json(await service.getMandatement(req.params.id) || null); } catch (e) { next(e); }
}

export async function saveMandatement(req, res, next) {
  try {
    res.json(await service.enregistrerMandatement(req.params.id, req.body || {}, req.user.id));
  } catch (e) { next(e); }
}

export async function printPiece(req, res, next) {
  try {
    res.json(await service.marquerPiece(req.params.id, req.body?.piece, req.user.id));
  } catch (e) { next(e); }
}

export async function ordonnancer(req, res, next) {
  try { res.json(await service.ordonnancer(req.params.id, req.user.id)); } catch (e) { next(e); }
}

export async function liquider(req, res, next) {
  try { res.json(await service.liquider(req.params.id, req.user.id)); } catch (e) { next(e); }
}

export async function listPieces(req, res, next) {
  try {
    res.json(await model.chargerPiecesReference());
  } catch (e) { next(e); }
}

/* --- Correspondances --- */

export async function getCorrespondances(req, res, next) {
  try {
    res.json(await service.getCorrespondances(req.query.dossier_id || null));
  } catch (e) { next(e); }
}

export async function createCorrespondance(req, res, next) {
  try {
    res.status(201).json(await service.creerCorrespondance(req.body || {}, req.user.id));
  } catch (e) { next(e); }
}
