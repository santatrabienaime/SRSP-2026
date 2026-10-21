import * as service from '../services/immatriculationService.js';

/** Liste des immatriculations. */
export async function lister(req, res, next) {
  try {
    res.json(await service.lister({
      statut: req.query.statut || undefined,
      division_id: req.query.division_id || undefined,
      search: req.query.search || undefined,
    }));
  } catch (error) { next(error); }
}

/** Une immatriculation et son historique. */
export async function detail(req, res, next) {
  try {
    res.json(await service.detail(req.params.id));
  } catch (error) { next(error); }
}

/** Enregistre une demande d'immatriculation. */
export async function creer(req, res, next) {
  try {
    res.status(201).json(await service.creer(req.body || {}, req.user.id));
  } catch (error) { next(error); }
}

/** Modifie une immatriculation. */
export async function modifier(req, res, next) {
  try {
    res.json(await service.modifier(req.params.id, req.body || {}, req.user.id));
  } catch (error) { next(error); }
}

/** Enregistre l'insertion en paie d'un nouvel arrivant. */
export async function enregistrerInsertion(req, res, next) {
  try {
    res.status(201).json(await service.enregistrerInsertion(
      req.params.id, req.body || {}, req.user.id
    ));
  } catch (error) { next(error); }
}

/** Met à jour l'insertion en paie. */
export async function modifierInsertion(req, res, next) {
  try {
    res.json(await service.modifierInsertion(
      req.params.id, req.params.insertionId, req.body || {}, req.user.id
    ));
  } catch (error) { next(error); }
}

/** Enregistre une demande de changement de mode de paiement. */
export async function enregistrerChangement(req, res, next) {
  try {
    res.status(201).json(await service.enregistrerChangementPaiement(
      req.params.id, req.body || {}, req.user.id
    ));
  } catch (error) { next(error); }
}

/** Met à jour une demande de changement de mode de paiement. */
export async function modifierChangement(req, res, next) {
  try {
    res.json(await service.modifierChangementPaiement(
      req.params.id, req.params.paiementId, req.body || {}, req.user.id
    ));
  } catch (error) { next(error); }
}

/** Volumes par type de demande, période et division. */
export async function volumes(req, res, next) {
  try {
    res.json(await service.volumes({
      dateDebut: req.query.date_debut || undefined,
      dateFin: req.query.date_fin || undefined,
      division_id: req.query.division_id || undefined,
    }));
  } catch (error) { next(error); }
}
