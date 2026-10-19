import * as personnelService from '../services/personnelService.js';

/**
 * Écran « Personnel » : la fiche d'une personne et son compte de connexion.
 *
 * Les deux étaient écrits par deux contrôleurs distincts ; ils passent
 * désormais par le même service, qui vérifie les règles une seule fois.
 */

export async function list(req, res, next) {
  try { res.json(await personnelService.list()); } catch (e) { next(e); }
}

export async function getOne(req, res, next) {
  try { res.json(await personnelService.getOne(req.params.id)); } catch (e) { next(e); }
}

export async function create(req, res, next) {
  try { res.status(201).json(await personnelService.create(req.body)); } catch (e) { next(e); }
}

export async function update(req, res, next) {
  try { res.json(await personnelService.update(req.params.id, req.body)); } catch (e) { next(e); }
}

export async function toggle(req, res, next) {
  try { res.json(await personnelService.toggleFiche(req.params.id)); } catch (e) { next(e); }
}

export async function resetPassword(req, res, next) {
  try {
    res.json(await personnelService.resetPassword(req.params.id, req.body.password));
  } catch (e) { next(e); }
}

export async function remove(req, res, next) {
  try { res.json(await personnelService.remove(req.params.id)); } catch (e) { next(e); }
}
