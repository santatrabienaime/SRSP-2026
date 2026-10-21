import * as service from '../services/mandatementService.js';

/* --- Mandatement --- */

export async function getMandatement(req, res, next) {
  try { res.json(await service.getMandatement(req.params.id) || null); } catch (e) { next(e); }
}

export async function saveMandatement(req, res, next) {
  try {
    const resultat = await service.enregistrerMandatement(req.params.id, req.body || {}, req.user.id);
    res.json(resultat);
  } catch (e) { next(e); }
}

export async function printPiece(req, res, next) {
  try {
    const resultat = await service.marquerPiece(req.params.id, req.body?.piece, req.user.id);
    res.json(resultat);
  } catch (e) { next(e); }
}

export async function ordonnancer(req, res, next) {
  try {
    const resultat = await service.ordonnancer(req.params.id, req.user.id);
    res.json(resultat);
  } catch (e) { next(e); }
}

export async function liquider(req, res, next) {
  try {
    const resultat = await service.liquider(req.params.id, req.user.id);
    res.json(resultat);
  } catch (e) { next(e); }
}
