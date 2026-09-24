import express from 'express';
import * as ctrl from '../controllers/mandatementController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { rbacMiddleware } from '../middlewares/rbacMiddleware.js';
import { assertDossierAccessMiddleware } from '../middlewares/scopeDossiersMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

/* --- Mandatement (Chef de Division Secours : preparer_mandatement,
       ordonnancement : gerer_ordonnancement) --- */
router.get(
  '/:id/mandatement',
  rbacMiddleware(['preparer_mandatement', 'gerer_ordonnancement', 'suivre_signature']),
  assertDossierAccessMiddleware,
  ctrl.getMandatement
);
router.get('/mandatement/pieces', ctrl.listPieces);
router.post(
  '/:id/mandatement',
  rbacMiddleware(['preparer_mandatement', 'gerer_ordonnancement']),
  assertDossierAccessMiddleware,
  ctrl.saveMandatement
);
router.post(
  '/:id/mandatement/ordonnancer',
  rbacMiddleware('gerer_ordonnancement'),
  assertDossierAccessMiddleware,
  ctrl.ordonnancer
);
router.post(
  '/:id/mandatement/liquider',
  rbacMiddleware('gerer_ordonnancement'),
  assertDossierAccessMiddleware,
  ctrl.liquider
);
router.post(
  '/:id/mandatement/piece',
  rbacMiddleware(['preparer_mandatement', 'gerer_ordonnancement']),
  assertDossierAccessMiddleware,
  ctrl.printPiece
);

/* --- Correspondances : montées sur /api/correspondances (voir
       correspondanceRoutes.js) car la route '/:id' de dossierRoutes
       intercepterait '/dossiers/correspondances'. --- */

export default router;
