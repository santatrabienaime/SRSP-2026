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
    /* Le champ est EXIGÉ. Avec `|| []`, un appel qui l'omettait — un client
       mal formé, un script, un formulaire envoyé à moitié — effaçait toutes les
       permissions du rôle et répondait 200 « mises à jour ». L'administrateur
       perdait ainsi ses 51 permissions, y compris la gestion des rôles, sans
       le moindre message d'erreur.

       Distinguer les deux cas est indispensable : une liste VIDE est une
       intention (« retire toutes les permissions »), un champ ABSENT est une
       requête mal formée. Les traiter pareil revenait à considerer une absence
       de donnée comme une intention. */
    const { permission_ids: ids } = req.body ?? {};
    if (!Array.isArray(ids)) {
      return res.status(400).json({
        message: 'Le champ permission_ids doit être un tableau de permissions.',
      });
    }
    await roleModel.setPermissions(req.params.id, ids);
    res.json({ message: 'Permissions mises à jour.' });
  } catch (e) { next(e); }
}