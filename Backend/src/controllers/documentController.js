import fs from 'fs';
import * as documentService from '../services/documentService.js';
import * as documentModel from '../models/documentModel.js';

export async function getOne(req, res, next) {
  try {
    const document = await documentModel.findDocumentById(req.params.id);
    if (!document) return res.status(404).json({ message: 'Document introuvable.' });
    res.json(document);
  } catch (e) { next(e); }
}

export async function list(req, res, next) {
  try { res.json(await documentService.getDocuments(req.query)); } catch (e) { next(e); }
}

export async function download(req, res, next) {
  try {
    const doc = await documentModel.findDocumentById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document introuvable.' });
    if (!doc.chemin_stockage || !fs.existsSync(doc.chemin_stockage)) {
      return res.status(404).json({ message: 'Fichier manquant sur le serveur.' });
    }
    res.download(doc.chemin_stockage, doc.nom_fichier);
  } catch (e) { next(e); }
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