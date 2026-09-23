import * as permissionModel from '../models/permissionModel.js';

export async function list(req, res, next) {
  try { res.json(await permissionModel.findAll()); } catch (e) { next(e); }
}

export async function getOne(req, res, next) {
  try {
    const p = await permissionModel.findById(req.params.id);
    if (!p) return res.status(404).json({ message: 'Permission introuvable.' });
    res.json(p);
  } catch (e) { next(e); }
}

export async function create(req, res, next) {
  try { res.status(201).json(await permissionModel.create(req.body)); } catch (e) { next(e); }
}

export async function update(req, res, next) {
  try { res.json(await permissionModel.update(req.params.id, req.body)); } catch (e) { next(e); }
}

export async function remove(req, res, next) {
  try { await permissionModel.remove(req.params.id); res.status(204).send(); } catch (e) { next(e); }
}

export async function myPermissions(req, res, next) {
  try {
    const rows = await permissionModel.getUserPermissions(req.user.id);
    res.json(rows.map((r) => r.nom));
  } catch (e) { next(e); }
}