import * as bordereauService from '../services/bordereauService.js';
import { httpError } from '../utils/httpError.js';

export async function list(req, res, next) {
  try {
    const { page = 1, limit = 25, division_id, statut, search } = req.query;
    const result = await bordereauService.listBordereaux({
      page: Number(page),
      limit: Number(limit),
      division_id: division_id ? Number(division_id) : undefined,
      statut,
      search,
    });
    res.json(result);
  } catch (e) { next(e); }
}

export async function getOne(req, res, next) {
  try {
    const b = await bordereauService.getBordereau(Number(req.params.id));
    res.json(b);
  } catch (e) { next(e); }
}

export async function create(req, res, next) {
  try {
    const { division_id, observation, dossiers } = req.body;
    if (!division_id) throw httpError(422, 'Division destinataire obligatoire');

    const b = await bordereauService.createBordereau({
      division_id: Number(division_id),
      agent_id: req.user?.agent_id || null,
      observation,
      dossiers: dossiers || [],
    });
    res.status(201).json(b);
  } catch (e) { next(e); }
}

export async function update(req, res, next) {
  try {
    const b = await bordereauService.updateBordereau(Number(req.params.id), req.body);
    res.json(b);
  } catch (e) { next(e); }
}

export async function addDossiers(req, res, next) {
  try {
    const { dossiers } = req.body;
    if (!Array.isArray(dossiers) || !dossiers.length) {
      throw httpError(422, 'Liste de dossiers requise');
    }
    const b = await bordereauService.addDossiersToBordereau(Number(req.params.id), dossiers);
    res.json(b);
  } catch (e) { next(e); }
}

export async function removeDossier(req, res, next) {
  try {
    const { dossierId } = req.params;
    const b = await bordereauService.removeDossierFromBordereau(Number(req.params.id), Number(dossierId));
    res.json(b);
  } catch (e) { next(e); }
}

export async function emit(req, res, next) {
  try {
    const b = await bordereauService.emitBordereau(Number(req.params.id), req.user?.agent_id || null);
    res.json(b);
  } catch (e) { next(e); }
}

export async function acknowledge(req, res, next) {
  try {
    const b = await bordereauService.acknowledgeBordereau(Number(req.params.id), req.user?.agent_id || null);
    res.json(b);
  } catch (e) { next(e); }
}

export async function archive(req, res, next) {
  try {
    const b = await bordereauService.archiveBordereau(Number(req.params.id));
    res.json(b);
  } catch (e) { next(e); }
}

export async function remove(req, res, next) {
  try {
    const r = await bordereauService.deleteBordereau(Number(req.params.id));
    res.json(r);
  } catch (e) { next(e); }
}

export async function eligibles(req, res, next) {
  try {
    const { division_id } = req.query;
    if (!division_id) throw httpError(422, 'division_id requis');
    const dossiers = await bordereauService.getDossiersEligibles(Number(division_id));
    res.json(dossiers);
  } catch (e) { next(e); }
}

export async function stats(req, res, next) {
  try {
    const s = await bordereauService.getBordereauStats();
    res.json(s);
  } catch (e) { next(e); }
}