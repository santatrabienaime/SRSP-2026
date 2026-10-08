import * as model from '../models/commentaireModel.js';
import * as historiqueModel from '../models/historiqueModel.js';
import db from '../config/db.js';
import { httpError } from '../utils/httpError.js';

export async function getComments(dossierId) {
  return model.findByDossier(dossierId);
}

export async function addComment(dossierId, contenu, user) {
  const texte = (contenu || '').trim();
  if (!texte) throw httpError(400, 'Le commentaire ne peut pas être vide.');
  if (texte.length > 5000) {
    throw httpError(400, 'Le commentaire ne peut pas dépasser 5000 caractères.');
  }

  const dossier = await db.query('SELECT id FROM dossiers WHERE id = ?', [dossierId]);
  if (!dossier[0]) throw httpError(404, 'Dossier introuvable.');

  const commentaire = await model.create({
    dossier_id: dossierId,
    auteur_id: user.id,
    contenu: texte,
  });

  await historiqueModel.log({
    user_id: user.id,
    action: 'COMMENTAIRE',
    dossier_id: dossierId,
    details: 'Commentaire ajouté.',
  });

  return commentaire;
}

export async function deleteComment(id, user) {
  const ok = await model.remove(id, user.id);
  if (!ok) {
    throw httpError(403, "Vous ne pouvez supprimer que vos propres commentaires.");
  }
  return { message: 'Commentaire supprimé.' };
}
