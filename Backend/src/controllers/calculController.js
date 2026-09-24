import * as service from '../services/calculService.js';

/* --- Liquidation de pension (Liquidateur) --- */

export async function getLiquidation(req, res, next) {
  try {
    res.json(await service.getLiquidation(req.params.id) || null);
  } catch (error) { next(error); }
}

export async function saveLiquidation(req, res, next) {
  try {
    res.json(await service.calculerLiquidation(req.params.id, req.body || {}, req.user.id));
  } catch (error) { next(error); }
}

/* --- Décompte d'avance (Vérificateur Solde) --- */

export async function getDecompte(req, res, next) {
  try {
    res.json(await service.getDecompte(req.params.id) || null);
  } catch (error) { next(error); }
}

export async function saveDecompte(req, res, next) {
  try {
    res.json(await service.calculerAvance(req.params.id, req.body || {}, req.user.id));
  } catch (error) { next(error); }
}

/* --- Contrôle de décompte (Chef de Division Solde) --- */

export async function getControles(req, res, next) {
  try {
    res.json(await service.getControles(req.params.id));
  } catch (error) { next(error); }
}

export async function saveControle(req, res, next) {
  try {
    res.json(await service.controlerDecompte(req.params.id, req.body || {}, req.user.id));
  } catch (error) { next(error); }
}
