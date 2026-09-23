import * as courrierService from '../services/courrierService.js';

export async function list(req, res, next) {
  try { res.json(await courrierService.getCourriers(req.query)); } catch (e) { next(e); }
}

export async function getOne(req, res, next) {
  try { res.json(await courrierService.getCourrierById(req.params.id)); } catch (e) { next(e); }
}

export async function create(req, res, next) {
  try { res.status(201).json(await courrierService.createCourrier(req.body, req.user.id)); } catch (e) { next(e); }
}

export async function updateStatut(req, res, next) {
  try {
    await courrierService.updateStatut(req.params.id, req.body.statut);
    res.json({ message: 'Statut mis à jour.' });
  } catch (e) { next(e); }
}