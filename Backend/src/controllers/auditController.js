import * as historiqueModel from '../models/historiqueModel.js';

/** Journal d'audit : historique global filtrable (user, dossier, action). */
export async function list(req, res, next) {
  try {
    const entries = await historiqueModel.findAll({
      user_id: req.query.user_id,
      dossier_id: req.query.dossier_id,
      action: req.query.action,
    });
    res.json(entries);
  } catch (error) { next(error); }
}