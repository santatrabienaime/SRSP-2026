import * as model from '../models/administratifModel.js';
import { verifierCoherencePaiement } from '../validators/administratifValidators.js';
import { httpError } from '../utils/httpError.js';

/**
 * Gestion administrative : immatriculation, Augure, mode de paiement.
 *
 * Le contrôleur ne fait que valider et répondre. Les règles qui Protegent la
 * coherence des données — unicité du numéro, une seule insertion par personne,
 * une seule demande de paiement en attente — sont dans le modèle, parce
 * qu'elles doivent tenir même si quelqu'un appelle l'API directement.
 */

export async function tableauDeBord(req, res, next) {
  try { res.json(await model.tableauDeBord()); } catch (e) { next(e); }
}

/* Immatriculation */

export async function listerImmatriculations(req, res, next) {
  try { res.json(await model.listerImmatriculations(req.query)); } catch (e) { next(e); }
}

export async function immatriculation(req, res, next) {
  try {
    const ligne = await model.immatriculationParId(req.params.id);
    if (!ligne) return res.status(404).json({ message: 'Immatriculation introuvable.' });
    res.json(ligne);
  } catch (e) { next(e); }
}

export async function verifierCIN(req, res, next) {
  try { res.json(await model.cinDejaImmatricule(req.query.cin)); } catch (e) { next(e); }
}

export async function creerImmatriculation(req, res, next) {
  try {
    const cree = await model.creerImmatriculation(req.body, req.user.id);
    res.status(201).json(cree);
  } catch (e) { next(e); }
}

export async function majImmatriculation(req, res, next) {
  try {
    const maj = await model.majImmatriculation(req.params.id, req.body, req.user.id);
    if (!maj) return res.status(404).json({ message: 'Immatriculation introuvable.' });
    res.json(maj);
  } catch (e) { next(e); }
}

/* Insertion Augure */

export async function listerAugure(req, res, next) {
  try { res.json(await model.listerAugure(req.query)); } catch (e) { next(e); }
}

export async function creerAugure(req, res, next) {
  try {
    // Le modèle refuse la double insertion et renvoie 409 : le frontend doit
    // pouvoir distinguer « déjà fait » d'une erreur serveur.
    const immatriculation = await model.immatriculationParId(req.body.immatriculation_id);
    if (!immatriculation) {
      throw httpError(404, 'Immatriculation introuvable : choisissez une personne déjà immatriculée.');
    }
    res.status(201).json(await model.creerInsertionAugure(req.body, req.user.id));
  } catch (e) { next(e); }
}

export async function majAugure(req, res, next) {
  try {
    const maj = await model.majInsertionAugure(req.params.id, req.body, req.user.id);
    if (!maj) return res.status(404).json({ message: 'Insertion Augure introuvable.' });
    res.json(maj);
  } catch (e) { next(e); }
}

/* Mode de paiement */

export async function listerPaiements(req, res, next) {
  try { res.json(await model.listerPaiements(req.query)); } catch (e) { next(e); }
}

export async function creerPaiement(req, res, next) {
  try {
    const incoherence = verifierCoherencePaiement(req.body);
    if (incoherence) throw httpError(422, incoherence);
    const immatriculation = await model.immatriculationParId(req.body.immatriculation_id);
    if (!immatriculation) throw httpError(404, 'Immatriculation introuvable.');
    res.status(201).json(await model.creerModePaiement(req.body, req.user.id));
  } catch (e) { next(e); }
}

export async function traiterPaiement(req, res, next) {
  try {
    const { statut, observations } = req.body || {};
    if (!['APPROUVE', 'REJETE'].includes(statut)) {
      throw httpError(422, 'Le statut doit être APPROUVE ou REJETE.');
    }
    const resultat = await model.traiterModePaiement(req.params.id, statut, req.user.id, observations);
    if (!resultat) return res.status(404).json({ message: 'Demande introuvable.' });
    res.json(resultat);
  } catch (e) { next(e); }
}
