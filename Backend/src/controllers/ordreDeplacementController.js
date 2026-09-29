import * as M from '../models/ordreDeplacementModel.js';
import { verifierCoherenceOrdre } from '../validators/ordreDeplacementValidators.js';
import { accesDossier } from '../services/scopeService.js';

export async function types(req, res, next) {
  try { res.json(await M.listerTypes()); } catch (e) { next(e); }
}

export async function lister(req, res, next) {
  try {
    const filtres = {};
    if (req.query.dossier_id) filtres.dossier_id = Number(req.query.dossier_id);
    if (req.query.agent_id) filtres.agent_id = Number(req.query.agent_id);
    if (req.query.type_id) filtres.type_id = Number(req.query.type_id);
    if (req.query.statut) filtres.statut = req.query.statut;
    if (req.query.a_signer === '1') filtres.a_signer = true;
    res.json(await M.lister(filtres));
  } catch (e) { next(e); }
}

export async function creer(req, res, next) {
  try {
    const incoherence = verifierCoherenceOrdre(req.body);
    if (incoherence) {
      return res.status(422).json({ message: incoherence });
    }
    /* L'ordre est verse au dossier d'un agent : verifier l'acces au dossier
       evite qu'un Chef BAAF rattache une piece a un dossier d'une autre division
       en devinant son identifiant. */
    const autorise = await accesDossier(req.user.id, req.body.dossier_id);
    if (!autorise) {
      return res.status(403).json({ message: "Vous n'avez pas accès à ce dossier." });
    }
    const resultat = await M.creer(req.body, req.user.id);
    res.status(201).json(resultat);
  } catch (e) { next(e); }
}

export async function detail(req, res, next) {
  try {
    const ordre = await M.findById(Number(req.params.id));
    if (!ordre) return res.status(404).json({ message: 'Ordre introuvable.' });
    const autorise = await accesDossier(req.user.id, ordre.dossier_id);
    if (!autorise) {
      return res.status(403).json({ message: "Vous n'avez pas accès à ce dossier." });
    }
    res.json(ordre);
  } catch (e) { next(e); }
}

export async function transitionner(req, res, next) {
  try {
    const ordre = await M.findById(Number(req.params.id));
    if (!ordre) return res.status(404).json({ message: 'Ordre introuvable.' });
    const autorise = await accesDossier(req.user.id, ordre.dossier_id);
    if (!autorise) {
      return res.status(403).json({ message: "Vous n'avez pas accès à ce dossier." });
    }
    res.json(await M.transitionner(
      Number(req.params.id), req.body.statut, req.user.id, req.body
    ));
  } catch (e) { next(e); }
}

/**
 * Annulation d'un ordre etabli.
 *
 * Le serveur refuse d'annuler un ordre signe : une piece officielle engagee ne
 * disparait pas. Le statut final 'REJETEE' est conserve plutot que la ligne
 * supprimee, pour que l'historique reste complet.
 */
export async function annuler(req, res, next) {
  try {
    const ordre = await M.findById(Number(req.params.id));
    if (!ordre) return res.status(404).json({ message: 'Ordre introuvable.' });
    const autorise = await accesDossier(req.user.id, ordre.dossier_id);
    if (!autorise) {
      return res.status(403).json({ message: "Vous n'avez pas accès à ce dossier." });
    }
    res.json(await M.annuler(Number(req.params.id), req.user.id, req.body.motif));
  } catch (e) { next(e); }
}

export async function tableauDeBord(req, res, next) {
  try { res.json(await M.tableauDeBord()); } catch (e) { next(e); }
}
