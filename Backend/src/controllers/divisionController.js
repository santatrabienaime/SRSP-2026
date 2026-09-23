import * as divisionModel from '../models/divisionModel.js';

export async function list(req, res, next) {
  try { res.json(await divisionModel.findAll()); } catch (e) { next(e); }
}

export async function create(req, res, next) {
  try { res.status(201).json(await divisionModel.create(req.body)); } catch (e) { next(e); }
}

export async function update(req, res, next) {
  try { await divisionModel.update(req.params.id, req.body); res.json({ message: 'Mis à jour.' }); } catch (e) { next(e); }
}