import express from 'express';
import { login, me, logout, changePassword } from '../controllers/authController.js';
import * as reinitCtrl from '../controllers/reinitialisationController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validateMiddleware } from '../middlewares/validateMiddleware.js';
import {
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/authValidators.js';

const router = express.Router();

router.post('/login', validateMiddleware(loginSchema), login);
router.get('/me', authMiddleware, me);
router.post('/logout', authMiddleware, logout);
router.put('/password', authMiddleware, validateMiddleware(changePasswordSchema), changePassword);

/* ── Réinitialisation du mot de passe (public) ───────────────────────────
   Ces deux routes n'exigent aucun jeton : l'agent a oublié son mot de
   passe, il ne peut donc pas être authentifié. La sécurité n'en dépend pas :
   le code à usage unique est délivré par un administrateur après vérification
   d'identité, et les réponses ne révèlent jamais si un compte existe. */
router.post(
  '/password/forgot',
  validateMiddleware(forgotPasswordSchema),
  reinitCtrl.demander
);
router.post(
  '/password/reset',
  validateMiddleware(resetPasswordSchema),
  reinitCtrl.reinitialiser
);

export default router;