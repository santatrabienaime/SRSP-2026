import * as statistiqueService from '../services/statistiqueService.js';

export async function getStats(req, res, next) {
  try { res.json(await statistiqueService.getStatistiques(req.query)); } catch (e) { next(e); }
}