import express from 'express';
import * as ctrl from '../controllers/calculController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { rbacMiddleware } from '../middlewares/rbacMiddleware.js';
import { assertDossierAccessMiddleware } from '../middlewares/scopeDossiersMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

/* --- Liquidation de pension ---
   Saisie : Liquidateur Pension (liquider_pension).
   L'agent doit être le responsable du dossier (cloisonnement). */
router.get('/:id/liquidation-pension', assertDossierAccessMiddleware, ctrl.getLiquidation);
router.post(
  '/:id/liquidation-pension',
  rbacMiddleware('liquider_pension'),
  assertDossierAccessMiddleware,
  ctrl.saveLiquidation
);

/* --- Décompte d'avance ---
   Saisie : Vérificateur Solde (calculer_avances). */
router.get('/:id/decompte-avance', assertDossierAccessMiddleware, ctrl.getDecompte);
router.post(
  '/:id/decompte-avance',
  rbacMiddleware('calculer_avances'),
  assertDossierAccessMiddleware,
  ctrl.saveDecompte
);

/* --- Contrôle du décompte ---
   Décision : Chef de Service (controler_decomptes), avant validation.
   Le cloisonnement s'applique comme sur les deux autres blocs : sans
   assertDossierAccessMiddleware, un chef de division Solde pouvait contrôler —
   donc RETOURNER ou APPROUVER — le dossier d'une AUTRE division en devinant
   son identifiant. */
router.get(
  '/:id/controle-decompte',
  rbacMiddleware('controler_decomptes'),
  assertDossierAccessMiddleware,
  ctrl.getControles
);
router.post(
  '/:id/controle-decompte',
  rbacMiddleware('controler_decomptes'),
  assertDossierAccessMiddleware,
  ctrl.saveControle
);

export default router;
