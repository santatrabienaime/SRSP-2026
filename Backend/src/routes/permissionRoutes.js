import express from 'express';
import * as ctrl from '../controllers/permissionController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { rbacMiddleware } from '../middlewares/rbacMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', ctrl.list);
router.get('/me', ctrl.myPermissions);
router.get('/:id', ctrl.getOne);
router.post('/', rbacMiddleware('role.gerer'), ctrl.create);
router.put('/:id', rbacMiddleware('role.gerer'), ctrl.update);
router.delete('/:id', rbacMiddleware('role.gerer'), ctrl.remove);

export default router;