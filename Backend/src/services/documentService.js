import path from 'path';
import fs from 'fs';
import * as documentModel from '../models/documentModel.js';
import * as dossierModel from '../models/dossierModel.js';
import * as workflowService from './workflowService.js';
import * as historiqueModel from '../models/historiqueModel.js';
import { UPLOAD_DIR } from '../config/multer.js';
import db from '../config/db.js';
import { httpError } from '../utils/httpError.js';

/**
 * Pièces jointes : dépôt, consultation, suppression.
 *
 * Règles de sécurité :
 *  - le fichier est écrit sous un nom UUID par multer, jamais sous son nom
 *    d'origine ; celui-ci n'est conservé qu'en base pour l'affichage ;
 *  - le téléchargement résout le chemin stocké sous la racine des uploads et
 *    refuse toute sortie de cette racine ;
 *  - un dossier archivé n'accepte plus de dépôt ni de suppression ;
 *  - toute suppression est tracée dans l'historique.
 */

const STATUT_ARCHIVE = 'ARCHIVE';

function nomAffichable(originalname) {
  const base = path.basename(String(originalname || 'document')).replace(/[\u0000-\u001f]/g, '');
  return base.slice(0, 255) || 'document';
}

function estDansUploads(chemin) {
  const racine = path.resolve(UPLOAD_DIR);
  const cible = path.resolve(chemin);
  return cible === racine || cible.startsWith(racine + path.sep);
}

export async function lister(dossierId) {
  const dossier = await dossierModel.findDossierById(dossierId);
  if (!dossier) throw httpError(404, 'Dossier introuvable.');
  return documentModel.findByDossier(dossierId);
}

export async function ajouter(dossierId, fichier, data, userId) {
  if (!fichier) throw httpError(400, 'Aucun fichier reçu.');

  const dossier = await dossierModel.findDossierById(dossierId);
  if (!dossier) throw httpError(404, 'Dossier introuvable.');

  const statut = await workflowService.getCurrentStatus(dossierId);
  if (statut === STATUT_ARCHIVE) {
    throw httpError(409, 'Un dossier archivé ne peut plus recevoir de pièce.');
  }

  const typeId = data.type_id ? Number(data.type_id) : null;
  if (typeId && !(await documentModel.typeDocumentExiste(typeId))) {
    throw httpError(422, 'Type de document inconnu.');
  }

  const pieceCode = String(data.piece_code || '').trim().toUpperCase() || null;
  if (pieceCode && !(await documentModel.pieceApplicable(dossierId, pieceCode))) {
    throw httpError(422, `La pièce ${pieceCode} n'est pas requise pour ce dossier.`);
  }

  const description = String(data.description || '').trim().slice(0, 500) || null;
  const cheminRelatif = path.relative(UPLOAD_DIR, fichier.path).split(path.sep).join('/');

  /* Versionnage.
   *
   * Un dépôt pour une pièce déjà déposée ne remplace pas le fichier : il
   * devient la version suivante, et la version précédente est conservée. Le
   * cahier demande de « conserver la trace de la version précédente » —
   * l'effacer laisserait le dossier sans trace de ce qui avait été produit.
   *
   * Le motif du remplacement est conservé : c'est lui qui explique pourquoi
   * une nouvelle version a été déposée. */
  let version = 1;
  let remplace = null;
  if (pieceCode) {
    const precedente = await documentModel.derniereVersion(dossierId, pieceCode);
    if (precedente) {
      version = Number(precedente.version || 1) + 1;
      remplace = precedente.id;
    }
  }

  const { id } = await documentModel.create({
    dossier_id: Number(dossierId),
    type_id: typeId,
    piece_code: pieceCode,
    version,
    remplace,
    motif_remplacement: remplace ? (data.motif_remplacement || null) : null,
    nom_fichier: nomAffichable(fichier.originalname),
    chemin_stockage: cheminRelatif,
    taille: fichier.size,
    description,
    upload_par: userId,
  });

  await historiqueModel.log({
    user_id: userId,
    action: 'UPLOAD_DOCUMENT',
    dossier_id: Number(dossierId),
    nouvelle_valeur: nomAffichable(fichier.originalname),
    details: remplace
      ? `Version ${version} de la pièce ${pieceCode} — remplace la version ${version - 1}.`
        + (data.motif_remplacement ? ` Motif : ${data.motif_remplacement}.` : '')
      : `Dépôt d'une pièce (${Math.round((fichier.size || 0) / 1024)} Ko).`,
  });

  return { id, version, ...(await documentModel.findById(id)) };
}

export async function fichier(dossierId, documentId) {
  const document = await documentModel.findPourDossier(documentId, dossierId);
  if (!document) throw httpError(404, 'Document introuvable.');

  const absolute = path.resolve(UPLOAD_DIR, document.chemin_stockage);
  if (!estDansUploads(absolute) || !fs.existsSync(absolute)) {
    throw httpError(404, 'Fichier introuvable sur le serveur.');
  }
  return { document, absolute };
}

export async function supprimer(dossierId, documentId, userId) {
  const document = await documentModel.findPourDossier(documentId, dossierId);
  if (!document) throw httpError(404, 'Document introuvable.');

  const statut = await workflowService.getCurrentStatus(dossierId);
  if (statut === STATUT_ARCHIVE) {
    throw httpError(409, 'Un document d’un dossier archivé ne peut plus être supprimé.');
  }

  /* Une version antérieure ne se supprime pas : elle est la trace de ce qui
     avait été produit. Le cahier demande de « conserver la trace de la
     version précédente » ; l'effacer la ferait disparaître. */
  const derniere = document.piece_code
    ? await documentModel.derniereVersion(dossierId, document.piece_code)
    : null;
  if (derniere && Number(derniere.id) !== Number(documentId)) {
    throw httpError(
      409,
      `La version ${document.version} est conservée : elle est le trace des versions précédentes. `
      + 'Supprimez la version la plus récente si le dépôt est erroné.'
    );
  }

  const [utilisateur] = await db.query(
    `SELECT r.nom FROM users u JOIN roles r ON r.id = u.role_id WHERE u.id = ?`,
    [userId]
  );
  const admin = utilisateur?.nom === 'ADMIN';
  if (!admin && Number(document.upload_par) !== Number(userId)) {
    throw httpError(403, 'Seul le déposant ou l’administrateur peut supprimer cette pièce.');
  }

  const absolute = path.resolve(UPLOAD_DIR, document.chemin_stockage);
  if (estDansUploads(absolute) && fs.existsSync(absolute)) {
    try {
      fs.unlinkSync(absolute);
    } catch (e) {
      throw httpError(500, `Impossible de supprimer le fichier : ${e.message}`);
    }
  }

  await documentModel.remove(documentId);
  await historiqueModel.log({
    user_id: userId,
    action: 'SUPPRESSION_DOCUMENT',
    dossier_id: Number(dossierId),
    ancienne_valeur: document.nom_fichier,
    details: 'Suppression d’une pièce jointe.',
  });

  return { message: 'Document supprimé.' };
}
