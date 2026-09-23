import express from 'express';
import * as ctrl from '../controllers/auditController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { rbacMiddleware } from '../middlewares/rbacMiddleware.js';

// Journal d'audit global (§1 Admin) — réservé à view_audit
const router = express.Router();
router.use(authMiddleware, rbacMiddleware('view_audit'));

router.get('/', ctrl.list);

export default router;