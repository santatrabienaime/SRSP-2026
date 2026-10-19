import * as M from '../models/referentielCrudModel.js';

export async function listTypesDossiers(req, res, next) {
  try { res.json(await M.listTypesDossiers()); } catch (e) { next(e); }
}

export async function createTypeDossier(req, res, next) {
  try { res.status(201).json(await M.createTypeDossier(req.body)); } catch (e) { next(e); }
}

export async function deleteTypeDossier(req, res, next) {
  try { await M.deleteTypeDossier(req.params.id); res.json({ message: 'Supprimé.' }); } catch (e) { next(e); }
}

export async function listTypesPieces(req, res, next) {
  try { res.json(await M.listTypesPieces()); } catch (e) { next(e); }
}

export async function createTypePiece(req, res, next) {
  try { res.status(201).json(await M.createTypePiece(req.body)); } catch (e) { next(e); }
}

export async function deleteTypePiece(req, res, next) {
  try { await M.deleteTypePiece(req.params.id); res.json({ message: 'Supprimé.' }); } catch (e) { next(e); }
}

export async function listTypesCourriers(req, res, next) {
  try { res.json(await M.listTypesCourriers()); } catch (e) { next(e); }
}

export async function createTypeCourrier(req, res, next) {
  try { res.status(201).json(await M.createTypeCourrier(req.body)); } catch (e) { next(e); }
}

export async function deleteTypeCourrier(req, res, next) {
  try { await M.deleteTypeCourrier(req.params.id); res.json({ message: 'Supprimé.' }); } catch (e) { next(e); }
}
