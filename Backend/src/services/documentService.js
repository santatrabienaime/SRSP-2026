import * as documentModel from '../models/documentModel.js';
import * as historiqueModel from '../models/historiqueModel.js';

export async function getDocuments(filters) {
  return documentModel.findDocuments(filters);
}

export async function uploadDocument({ file, body, userId }) {
  if (!file) throw new Error('Aucun fichier fourni.');
  const doc = await documentModel.createDocument({
    dossier_id: body.dossier_id ? parseInt(body.dossier_id) : null,
    courrier_id: body.courrier_id ? parseInt(body.courrier_id) : null,
    type_id: body.type_id ? parseInt(body.type_id) : null,
    nom_fichier: file.originalname,
    chemin_stockage: file.path,
    taille: file.size,
    upload_par: userId,
  });
  await historiqueModel.log({
    user_id: userId,
    action: 'UPLOAD_DOCUMENT',
    dossier_id: body.dossier_id || null,
    details: `Fichier ${file.originalname}`,
  });
  return doc;
}

export async function valider(id, valide) {
  return documentModel.validerDocument(id, valide);
}

export async function supprimer(id) {
  return documentModel.deleteDocument(id);
}