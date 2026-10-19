import * as agentModel from '../models/agentModel.js';
import * as personnelService from '../services/personnelService.js';

/**
 * Fiches du personnel.
 *
 * Les lectures restent ici : les listes de choix (responsable d'une division,
 * agent d'un dossier, filtre du journal) ont besoin des fiches seules, sans
 * leur compte de connexion.
 *
 * Les écritures, elles, passent par `personnelService` : une fiche et un compte
 * décrivent la même personne, et deux chemins d'écriture finiraient par ne plus
 * appliquer les mêmes règles — c'est précisément ce qui a produit des comptes
 * portant deux fiches.
 */

export async function list(req, res, next) {
  try { res.json(await agentModel.findAll(req.query)); } catch (e) { next(e); }
}

export async function getOne(req, res, next) {
  try {
    const agent = await agentModel.findById(req.params.id);
    if (!agent) return res.status(404).json({ message: 'Agent introuvable.' });
    res.json(agent);
  } catch (e) { next(e); }
}

export async function create(req, res, next) {
  try { res.status(201).json(await personnelService.create(req.body)); } catch (e) { next(e); }
}

export async function update(req, res, next) {
  try { res.json(await personnelService.update(req.params.id, req.body)); } catch (e) { next(e); }
}

export async function remove(req, res, next) {
  try {
    const resultat = await personnelService.remove(req.params.id);
    res.json(resultat);
  } catch (e) { next(e); }
}
