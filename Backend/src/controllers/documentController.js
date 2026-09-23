import * as documentService from '../services/documentService.js';

export async function list(req, res, next) {
  try { res.json(await documentService.getDocuments(req.query)); } catch (e) { next(e); }
}

export async function upload(req, res, next) {
  try {
    const doc = await documentService.uploadDocument({
      file: req.file, body: req.body, userId: req.user.id,
    });
    res.status(201).json(doc);
  } catch (e) { next(e); }
}

export async function valider(req, res, next) {
  try {
    await documentService.valider(req.params.id, req.body.valide);
    res.json({ message: 'Document mis à jour.' });
  } catch (e) { next(e); }
}

export async function remove(req, res, next) {
  try { await documentService.supprimer(req.params.id); res.status(204).send(); } catch (e) { next(e); }
}