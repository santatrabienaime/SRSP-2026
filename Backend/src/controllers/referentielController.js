import * as M from '../models/referentielModel.js';

export async function lister(req, res, next) {
  try {
    res.json(await M.lister({
      etat: req.query.etat,
      nature: req.query.nature,
      poste_code: req.query.poste,
      section: req.query.section,
      manquantes: req.query.manquantes,
    }));
  } catch (e) { next(e); }
}

export async function bilan(req, res, next) {
  try { res.json(await M.bilan()); } catch (e) { next(e); }
}

export async function postes(req, res, next) {
  try { res.json(await M.listerPostes()); } catch (e) { next(e); }
}

export async function service(req, res, next) {
  try { res.json(await M.infosService()); } catch (e) { next(e); }
}
