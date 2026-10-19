import * as backupService from '../services/backupService.js';
import path from 'node:path';
import fs from 'node:fs';

export async function create(req, res, next) {
  try {
    const backup = await backupService.createBackup(req.user.id);
    res.status(201).json(backup);
  } catch (error) {
    next(error);
  }
}

export async function list(req, res, next) {
  try {
    res.json(await backupService.listBackups());
  } catch (error) {
    next(error);
  }
}

/** Restauration : opération destructive, réservée aux administrateurs. */
export async function restore(req, res, next) {
  try {
    const resultat = await backupService.restoreBackup(req.params.fichier, req.user.id);
    res.json(resultat);
  } catch (error) {
    next(error);
  }
}

/** Téléchargement d'une sauvegarde. */
export async function telecharger(req, res, next) {
  try {
    const nom = path.basename(req.params.fichier);
    const file = path.join(backupService.BACKUP_DIR, nom);
    if (!fs.existsSync(file)) return res.status(404).json({ message: 'Sauvegarde introuvable.' });
    res.download(file, nom);
  } catch (error) {
    next(error);
  }
}

/** Suppression d'une sauvegarde. */
export async function supprimer(req, res, next) {
  try {
    const nom = path.basename(req.params.fichier);
    const file = path.join(backupService.BACKUP_DIR, nom);
    if (fs.existsSync(file)) await fs.promises.unlink(file);
    // Supprimer aussi l'archive de pièces si elle existe
    const archive = file.replace(/\.sql$/, '-pieces.tar.gz');
    if (fs.existsSync(archive)) await fs.promises.unlink(archive);
    res.json({ message: 'Sauvegarde supprimée.' });
  } catch (error) {
    next(error);
  }
}

/** Vérification de l'intégrité d'une sauvegarde. */
export async function verifier(req, res, next) {
  try {
    const nom = path.basename(req.params.fichier);
    const file = path.join(backupService.BACKUP_DIR, nom);
    if (!fs.existsSync(file)) return res.status(404).json({ message: 'Sauvegarde introuvable.' });
    const stat = await fs.promises.stat(file);
    res.json({ fichier: nom, taille: stat.size, valide: stat.size > 0 });
  } catch (error) {
    next(error);
  }
}
