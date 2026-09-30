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
