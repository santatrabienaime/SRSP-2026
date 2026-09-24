import express from 'express';
import * as ctrl from '../controllers/mandatementController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { rbacMiddleware } from '../middlewares/rbacMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

// Correspondances de la division Pensions.
// Ressource de premier niveau : monté sur /api/correspondances (et non sous
// /api/dossiers, où la route '/:id' de dossierRoutes intercepterait la demande).

// Liste globale ou filtrée par dossier (?dossier_id=)
router.get('/', rbacMiddleware('gerer_correspondances'), ctrl.getCorrespondances);

router.post(
  '/',
  rbacMiddleware('gerer_correspondances'),
  ctrl.createCorrespondance
);

export default router;
