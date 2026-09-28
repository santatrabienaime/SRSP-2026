import * as model from '../models/commentaireModel.js';
import * as notificationModel from '../models/notificationModel.js';
import * as historiqueModel from '../models/historiqueModel.js';
import db from '../config/db.js';
import { httpError } from '../utils/httpError.js';

async function numeroDossier(dossierId) {
  const rows = await db.query('SELECT numero FROM dossiers WHERE id = ?', [dossierId]);
  return rows[0]?.numero || `#${dossierId}`;
}

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

  // Chaque personne mentionnée reçoit sa propre notification (jamais groupée).
  for (const username of commentaire.mentions) {
    const cible = await db.query(
      'SELECT id, email FROM users WHERE username = ? AND actif = TRUE LIMIT 1',
      [username]
    );
    if (cible[0]) {
      // Le JWT ne contient que l'identifiant : on relit l'email de l'auteur.
      const auteur = await db.query(
        'SELECT email FROM users WHERE id = ? LIMIT 1',
        [user.id]
      );
      await notificationModel.notifyUser(cible[0].id, {
        dossier_id: dossierId,
        action: 'MENTION',
        type: 'MENTION',
        message:
          `${auteur[0]?.email || 'Un collègue'} vous a mentionné dans un ` +
          `commentaire sur le dossier ${await numeroDossier(dossierId)}.`,
        lien: `/dossiers/${dossierId}`,
      });
    }
  }

  await historiqueModel.log({
    user_id: user.id,
    action: 'COMMENTAIRE',
    dossier_id: dossierId,
    details: commentaire.mentions.length
      ? `Commentaire (mentions : ${commentaire.mentions.join(', ')}).`
      : 'Commentaire ajouté.',
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
