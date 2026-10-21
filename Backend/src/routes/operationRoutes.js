import express from 'express';
import * as ctrl from '../controllers/operationController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { rbacMiddleware } from '../middlewares/rbacMiddleware.js';
import { validateMiddleware } from '../middlewares/validateMiddleware.js';
import { assertDossierAccessMiddleware } from '../middlewares/scopeDossiersMiddleware.js';
import { validateOperationSchema, controleOperationSchema } from '../validators/operationValidators.js';

/**
 * Données propres à l'opération d'un dossier.
 *
 * Monté sur `/api/dossiers` : le dossier reste le point d'entrée partout
 * ailleurs, et la donnée d'opération lui appartient.
 */
const router = express.Router();
router.use(authMiddleware);

/* La lecture est ouverte à qui peut consulter le dossier : `assertDossierAccess`
   cloisonne par division, et c'est ce contrôle qui doit s'appliquer. */
router.get('/:id/operation', assertDossierAccessMiddleware, ctrl.lire);

router.put(
  '/:id/operation',
  rbacMiddleware('saisir_donnees_operation'),
  assertDossierAccessMiddleware,
  validateMiddleware(validateOperationSchema),
  ctrl.saisir
);

router.post(
  '/:id/operation/controler',
  rbacMiddleware('controler_donnees_operation'),
  assertDossierAccessMiddleware,
  validateMiddleware(controleOperationSchema),
  ctrl.controler
);

router.post(
  '/:id/operation/valider',
  rbacMiddleware('controler_donnees_operation'),
  assertDossierAccessMiddleware,
  ctrl.validerMontant
);

export default router;
