import express from 'express';
import * as ctrl from '../controllers/workflowController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { rbacMiddleware } from '../middlewares/rbacMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/:id/statut', ctrl.getStatus);
// Transition générique réservée aux acteurs de fin de workflow (§14.2),
// pour ne pas contourner le RBAC des actions métier.
router.post('/:id/transition', rbacMiddleware(['valider_dossier', 'signer_dossier', 'cloturer_dossier', 'archiver_dossier']), ctrl.transition);

export default router;