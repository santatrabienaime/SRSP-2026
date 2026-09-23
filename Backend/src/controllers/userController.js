import * as userService from '../services/userService.js';

export async function list(req, res, next) {
  try { res.json(await userService.getAll()); } catch (e) { next(e); }
}

export async function create(req, res, next) {
  try { res.status(201).json(await userService.create(req.body)); } catch (e) { next(e); }
}

export async function update(req, res, next) {
  try { res.json(await userService.update(req.params.id, req.body)); } catch (e) { next(e); }
}

export async function toggle(req, res, next) {
  try {
    const user = await userService.toggle(req.params.id);
    res.json({ message: 'Statut du compte modifié.', user });
  } catch (e) { next(e); }
}

export async function remove(req, res, next) {
  try {
    const outcome = await userService.remove(req.params.id);
    res.json(outcome);
  } catch (e) { next(e); }
}

export async function resetPassword(req, res, next) {
  try {
    await userService.resetPassword(req.params.id, req.body.password);
    res.json({ message: 'Mot de passe réinitialisé.' });
  } catch (e) { next(e); }
}