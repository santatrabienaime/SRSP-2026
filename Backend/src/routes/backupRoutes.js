import express from 'express';
import * as ctrl from '../controllers/backupController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { rbacMiddleware } from '../middlewares/rbacMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

// Sauvegardes : réservé aux administrateurs (permission system_config).
router.get('/', rbacMiddleware('system_config'), ctrl.list);
router.post('/', rbacMiddleware('system_config'), ctrl.create);

export default router;
