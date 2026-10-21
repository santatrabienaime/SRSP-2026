import express from 'express';
import * as ctrl from '../controllers/correspondanceController.js';
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

/* Suivi d'une correspondance : réponse reçue, transmission centrale, état de
   réception. C'est ce qui permet de tracer une opposition jusqu'au niveau
   central. */
router.put(
  '/:id',
  rbacMiddleware('gerer_correspondances'),
  ctrl.updateCorrespondance
);

export default router;
