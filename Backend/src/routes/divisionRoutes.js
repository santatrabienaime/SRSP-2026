import express from 'express';
import * as ctrl from '../controllers/divisionController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { rbacMiddleware } from '../middlewares/rbacMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', ctrl.list);
router.post('/', rbacMiddleware('division.gerer'), ctrl.create);
router.put('/:id', rbacMiddleware('division.gerer'), ctrl.update);

export default router;