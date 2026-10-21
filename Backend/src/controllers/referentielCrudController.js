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

/* ── Sous-types (types d'acte) ───────────────────────────────────────── */

export async function listSousTypes(req, res, next) {
  try {
    res.json(await M.listSousTypes({
      type_dossier_id: req.query.type_dossier_id,
      actif: req.query.actif,
    }));
  } catch (e) { next(e); }
}

export async function createSousType(req, res, next) {
  try { res.status(201).json(await M.createSousType(req.body)); } catch (e) { next(e); }
}

export async function updateSousType(req, res, next) {
  try { res.json(await M.updateSousType(req.params.id, req.body)); } catch (e) { next(e); }
}

export async function deleteSousType(req, res, next) {
  try {
    await M.deleteSousType(req.params.id);
    res.json({ message: 'Sous-type supprimé.' });
  } catch (e) { next(e); }
}

/* ── Types de pièces ─────────────────────────────────────────────────── */

export async function listTypesPieces(req, res, next) {
  try {
    res.json(await M.listTypesPieces({
      type_dossier_id: req.query.type_dossier_id,
      sous_type_id: req.query.sous_type_id,
      division_code: req.query.division_code,
      actif: req.query.actif,
    }));
  } catch (e) { next(e); }
}

export async function createTypePiece(req, res, next) {
  try { res.status(201).json(await M.createTypePiece(req.body)); } catch (e) { next(e); }
}

export async function updateTypePiece(req, res, next) {
  try { res.json(await M.updateTypePiece(req.params.id, req.body)); } catch (e) { next(e); }
}

export async function deleteTypePiece(req, res, next) {
  try {
    const piece = await M.deleteTypePiece(req.params.id);
    res.json({
      message: 'Pièce désactivée : elle n’est plus proposée aux nouveaux dossiers, son historique reste consultable.',
      ...piece,
    });
  } catch (e) { next(e); }
}

/* ── Types de courriers ──────────────────────────────────────────────── */

export async function listTypesCourriers(req, res, next) {
  try { res.json(await M.listTypesCourriers()); } catch (e) { next(e); }
}

export async function createTypeCourrier(req, res, next) {
  try { res.status(201).json(await M.createTypeCourrier(req.body)); } catch (e) { next(e); }
}

export async function deleteTypeCourrier(req, res, next) {
  try { await M.deleteTypeCourrier(req.params.id); res.json({ message: 'Supprimé.' }); } catch (e) { next(e); }
}
