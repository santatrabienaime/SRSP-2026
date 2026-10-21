import express from 'express';
import * as ctrl from '../controllers/reinitialisationController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { rbacMiddleware } from '../middlewares/rbacMiddleware.js';
import { validateMiddleware } from '../middlewares/validateMiddleware.js';
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  annulationDemandeSchema,
} from '../validators/authValidators.js';

/**
 * Réinitialisation de mot de passe.
 *
 * Deux parties :
 *   - les routes **publiques**, montées sur `/auth/password` : déposer une
 *     demande et consommer un code ;
 *   - les routes **d'administration**, montées sur `/reinitialisations` :
 *     voir les demandes, délivrer un code, annuler une demande.
 */
const router = express.Router();

/* ── Administration ──────────────────────────────────────────────────── */

router.use(authMiddleware);

router.get('/', rbacMiddleware('manage_users'), ctrl.lister);
router.get('/:id', rbacMiddleware('manage_users'), ctrl.detail);
router.post(
  '/:id/code',
  rbacMiddleware('manage_users'),
  ctrl.genererCode
);
router.post(
  '/:id/annuler',
  rbacMiddleware('manage_users'),
  validateMiddleware(annulationDemandeSchema),
  ctrl.annuler
);

export default router;
