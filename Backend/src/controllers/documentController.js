import fs from 'fs';
import * as documentService from '../services/documentService.js';

export async function list(req, res, next) {
  try {
    const documents = await documentService.lister(req.params.id);
    res.json(documents);
  } catch (error) { next(error); }
}

export async function upload(req, res, next) {
  try {
    const document = await documentService.ajouter(
      req.params.id,
      req.file,
      req.body || {},
      req.user.id
    );
    res.status(201).json(document);
  } catch (error) {
    /* Un dépôt refusé après écriture laisserait un fichier orphelin sur le
       disque. On le retire avant de répondre, comme le fait déjà le contrôle
       de taille. */
    if (req.file?.path) {
      try { fs.unlinkSync(req.file.path); } catch { /* déjà absent */ }
    }
    next(error);
  }
}

export async function download(req, res, next) {
  try {
    const { document, absolute } = await documentService.fichier(
      req.params.id,
      req.params.documentId
    );
    res.download(absolute, document.nom_fichier);
  } catch (error) { next(error); }
}

export async function remove(req, res, next) {
  try {
    const resultat = await documentService.supprimer(
      req.params.id,
      req.params.documentId,
      req.user.id
    );
    res.json(resultat);
  } catch (error) { next(error); }
}
