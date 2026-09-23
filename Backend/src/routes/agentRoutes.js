import express from 'express';
import * as ctrl from '../controllers/agentController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { rbacMiddleware } from '../middlewares/rbacMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', ctrl.list);
router.post('/', rbacMiddleware('manage_personnel'), ctrl.create);
router.put('/:id', rbacMiddleware('manage_personnel'), ctrl.update);

export default router;