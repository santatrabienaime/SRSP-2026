import * as M from '../models/referentielModel.js';
import * as referentielService from '../services/referentielService.js';

/**
 * Données de référence pour les formulaires.
 *
 * Cette fonction existait avant le référentiel des 325 fonctionnalités, et
 * six écrans en dépendent. Elle avait été écrasée : à son retour, `/referentiel`
 * renvoyait les informations du service au lieu des listes de référence, et
 * chaque formulaire affichait des listes vides sans message d'erreur.
 */
export async function getReferentiel(req, res, next) {
  try {
    res.json(await referentielService.getReferentiel());
  } catch (error) { next(error); }
}




export async function service(req, res, next) {
  try { res.json(await M.infosService()); } catch (e) { next(e); }
}
