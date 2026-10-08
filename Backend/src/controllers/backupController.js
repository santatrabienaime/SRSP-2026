import * as backupService from '../services/backupService.js';

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
