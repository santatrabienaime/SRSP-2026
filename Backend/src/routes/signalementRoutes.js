import express from 'express';
import * as ctrl from '../controllers/signalementController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { rbacMiddleware } from '../middlewares/rbacMiddleware.js';
import { validateMiddleware } from '../middlewares/validateMiddleware.js';
import { resoudreSignalementSchema } from '../validators/signalementValidators.js';

/**
 * File des dossiers bloqués remontés à la hiérarchie.
 *
 * Le chef de division ouvre le signalement depuis la fiche du dossier
 * (`/api/dossiers/:id/signalements`) ; le chef de service le prend en charge
 * et le referme ici. La lecture est cloisonnée par le service : un chef de
 * division ne voit que sa division, la coordination et le BAAF voient tout.
 *
 * Le compteur est ouvert à qui voit les signalements : c'est un nombre, pas
 * une donnée de dossier.
 */
const router = express.Router();
router.use(authMiddleware);

router.get('/compte', ctrl.compter);
router.get('/', rbacMiddleware('consulter_signalements'), ctrl.lister);
router.get('/:id', rbacMiddleware('consulter_signalements'), ctrl.detail);
router.put(
  '/:id/prendre',
  rbacMiddleware('traiter_signalement'),
  ctrl.prendreEnCharge
);
router.put(
  '/:id/resoudre',
  rbacMiddleware('traiter_signalement'),
  validateMiddleware(resoudreSignalementSchema),
  ctrl.resoudre
);

export default router;
