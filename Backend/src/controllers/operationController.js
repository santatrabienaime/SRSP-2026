import * as operationService from '../services/operationService.js';

/** Lecture des données d'opération d'un dossier. */
export async function lire(req, res, next) {
  try {
    res.json(await operationService.lire(req.params.id));
  } catch (error) { next(error); }
}

/** Saisie des données d'opération. */
export async function saisir(req, res, next) {
  try {
    res.json(await operationService.saisir(req.params.id, req.body || {}, req.user.id));
  } catch (error) { next(error); }
}

/** Contrôle de l'opération par le chef de division. */
export async function controler(req, res, next) {
  try {
    res.json(await operationService.controler(req.params.id, req.body || {}, req.user.id));
  } catch (error) { next(error); }
}

/** Validation d'un montant ou d'un décompte. */
export async function validerMontant(req, res, next) {
  try {
    res.json(await operationService.validerMontant(req.params.id, req.body || {}, req.user.id));
  } catch (error) { next(error); }
}
