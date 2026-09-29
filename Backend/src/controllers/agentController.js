import * as agentModel from '../models/agentModel.js';

export async function list(req, res, next) {
  try { res.json(await agentModel.findAll(req.query)); } catch (e) { next(e); }
}

export async function getOne(req, res, next) {
  try {
    const agent = await agentModel.findById(req.params.id);
    if (!agent) return res.status(404).json({ message: 'Agent introuvable.' });
    res.json(agent);
  } catch (e) { next(e); }
}

export async function create(req, res, next) {
  try { res.status(201).json(await agentModel.create(req.body)); } catch (e) { next(e); }
}

export async function update(req, res, next) {
  try { await agentModel.update(req.params.id, req.body); res.json({ message: 'Mis à jour.' }); } catch (e) { next(e); }
}