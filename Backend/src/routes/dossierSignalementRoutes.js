import express from 'express';
import * as ctrl from '../controllers/signalementController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { rbacMiddleware } from '../middlewares/rbacMiddleware.js';
import { validateMiddleware } from '../middlewares/validateMiddleware.js';
import { assertDossierAccessMiddleware } from '../middlewares/scopeDossiersMiddleware.js';
import { creerSignalementSchema } from '../validators/signalementValidators.js';

/**
 * Signalements vus depuis la fiche du dossier.
 *
 * L'ouverture exige `signaler_dossier` ; la lecture suit l'accès au dossier :
 * qui peut ouvrir le dossier peut voir sa difficulté. Un signalement n'est pas
 * une pièce du dossier, il ne se consulte donc pas comme un document — mais il
 * ne se cache pas non plus à l'agent qui travaille dessus.
 */
const router = express.Router();
router.use(authMiddleware);

router.get(
  '/:id/signalements',
  assertDossierAccessMiddleware,
  ctrl.listerParDossier
);
router.post(
  '/:id/signalements',
  rbacMiddleware('signaler_dossier'),
  assertDossierAccessMiddleware,
  validateMiddleware(creerSignalementSchema),
  ctrl.signaler
);

export default router;
