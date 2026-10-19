import express from 'express';
import * as ctrl from '../controllers/bordereauController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { rbacMiddleware } from '../middlewares/rbacMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

// Lecture : SECRETAIRE, CHEF_DIVISION_*, CHEF_SERVICE, ADMIN
router.get('/', rbacMiddleware(['create_dossier', 'manage_courriers', 'view_all_dossiers']), ctrl.list);
router.get('/stats', rbacMiddleware(['create_dossier', 'manage_courriers', 'view_all_dossiers']), ctrl.stats);
router.get('/eligibles', rbacMiddleware(['create_dossier', 'manage_courriers']), ctrl.eligibles);
router.get('/:id', rbacMiddleware(['create_dossier', 'manage_courriers', 'view_all_dossiers']), ctrl.getOne);

// Écriture : SECRETAIRE, ADMIN (create_dossier)
router.post('/', rbacMiddleware(['create_dossier']), ctrl.create);
router.put('/:id', rbacMiddleware(['create_dossier']), ctrl.update);
router.post('/:id/dossiers', rbacMiddleware(['create_dossier']), ctrl.addDossiers);
router.delete('/:id/dossiers/:dossierId', rbacMiddleware(['create_dossier']), ctrl.removeDossier);
router.post('/:id/emit', rbacMiddleware(['create_dossier']), ctrl.emit);
router.delete('/:id', rbacMiddleware(['create_dossier']), ctrl.remove);

// Division destinataire : CHEF_DIVISION_*, ADMIN
router.post('/:id/acknowledge', rbacMiddleware(['affecter_dossier']), ctrl.acknowledge);
router.post('/:id/archive', rbacMiddleware(['archiver_dossier']), ctrl.archive);

export default router;