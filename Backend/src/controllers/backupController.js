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
