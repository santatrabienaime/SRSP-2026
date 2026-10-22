import * as service from '../services/signalementService.js';

/** Liste des signalements, restreinte au périmètre de l'utilisateur. */
export async function lister(req, res, next) {
  try {
    res.json(await service.lister({
      statut: req.query.statut || undefined,
      type: req.query.type || undefined,
      priorite: req.query.priorite || undefined,
      division_id: req.query.division_id || undefined,
      dossier_id: req.query.dossier_id || undefined,
      limit: req.query.limit || undefined,
    }, req.user.id));
  } catch (error) { next(error); }
}

/** Un signalement et son état. */
export async function detail(req, res, next) {
  try {
    res.json(await service.detail(req.params.id));
  } catch (error) { next(error); }
}

/** Signalements d'un dossier. */
export async function listerParDossier(req, res, next) {
  try {
    res.json(await service.listerParDossier(req.params.id));
  } catch (error) { next(error); }
}

/** Ouvre un signalement sur un dossier. */
export async function signaler(req, res, next) {
  try {
    res.status(201).json(await service.signaler(req.params.id, req.body || {}, req.user.id));
  } catch (error) { next(error); }
}

/** Prend en charge un signalement. */
export async function prendreEnCharge(req, res, next) {
  try {
    res.json(await service.prendreEnCharge(req.params.id, req.user.id));
  } catch (error) { next(error); }
}

/** Résout ou rejette un signalement. */
export async function resoudre(req, res, next) {
  try {
    res.json(await service.resoudre(req.params.id, req.body || {}, req.user.id));
  } catch (error) { next(error); }
}

/** Compteur des signalements non refermés. */
export async function compter(req, res, next) {
  try {
    res.json({ ouverts: await service.compterOuverts(req.user.id) });
  } catch (error) { next(error); }
}
