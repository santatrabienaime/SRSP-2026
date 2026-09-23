import * as roleModel from '../models/roleModel.js';

export async function list(req, res, next) {
  try {
    res.json(await roleModel.findAll());
  } catch (e) { next(e); }
}

export async function getOne(req, res, next) {
  try {
    const role = await roleModel.findById(req.params.id);
    if (!role) return res.status(404).json({ message: 'Rôle introuvable.' });
    const permissions = await roleModel.getPermissions(role.id);
    res.json({ ...role, permissions });
  } catch (e) { next(e); }
}

export async function create(req, res, next) {
  try {
    const role = await roleModel.create(req.body);
    if (req.body.permission_ids) {
      await roleModel.setPermissions(role.id, req.body.permission_ids);
    }
    res.status(201).json(role);
  } catch (e) { next(e); }
}

export async function update(req, res, next) {
  try {
    const role = await roleModel.update(req.params.id, req.body);
    if (req.body.permission_ids) {
      await roleModel.setPermissions(role.id, req.body.permission_ids);
    }
    res.json(role);
  } catch (e) { next(e); }
}

export async function remove(req, res, next) {
  try {
    await roleModel.remove(req.params.id);
    res.status(204).send();
  } catch (e) { next(e); }
}

export async function setPermissions(req, res, next) {
  try {
    await roleModel.setPermissions(req.params.id, req.body.permission_ids || []);
    res.json({ message: 'Permissions mises à jour.' });
  } catch (e) { next(e); }
}