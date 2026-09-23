import * as historiqueService from '../services/historiqueService.js';

export async function list(req, res, next) {
  try { res.json(await historiqueService.getHistorique(req.query)); } catch (e) { next(e); }
}