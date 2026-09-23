import express from 'express';
import { login, me, logout, changePassword } from '../controllers/authController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validateMiddleware } from '../middlewares/validateMiddleware.js';
import { loginSchema, changePasswordSchema } from '../validators/authValidators.js';

const router = express.Router();

router.post('/login', validateMiddleware(loginSchema), login);
router.get('/me', authMiddleware, me);
router.post('/logout', authMiddleware, logout);
router.put('/password', authMiddleware, validateMiddleware(changePasswordSchema), changePassword);

export default router;