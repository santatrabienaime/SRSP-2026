import * as referentielService from '../services/referentielService.js';

export async function getReferentiel(req, res, next) {
  try {
    res.json(await referentielService.getReferentiel());
  } catch (error) {
    next(error);
  }
}