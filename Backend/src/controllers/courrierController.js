import * as courrierService from '../services/courrierService.js';

export async function list(req, res, next) {
  try { res.json(await courrierService.getCourriers(req.query)); } catch (e) { next(e); }
}

export async function getOne(req, res, next) {
  try {
    const courrier = await courrierService.getCourrierById(req.params.id);
    if (!courrier) return res.status(404).json({ message: 'Courrier introuvable.' });
    res.json(courrier);
  } catch (e) { next(e); }
}

export async function create(req, res, next) {
  try {
    const courrier = await courrierService.createCourrier(req.body, req.user.id);
    res.status(201).json(courrier);
  } catch (e) { next(e); }
}

export async function updateStatut(req, res, next) {
  try {
    await courrierService.updateStatut(req.params.id, req.body.statut);
    res.json({ message: 'Statut mis à jour.' });
  } catch (e) { next(e); }
}

export async function remove(req, res, next) {
  try {
    await courrierService.deleteCourrier(req.params.id, req.user.id);
    res.status(204).send();
  } catch (e) { next(e); }
}