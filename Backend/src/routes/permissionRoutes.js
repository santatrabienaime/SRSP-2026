import express from 'express';
import * as ctrl from '../controllers/permissionController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { rbacMiddleware } from '../middlewares/rbacMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', ctrl.list);
router.get('/me', ctrl.myPermissions);
router.get('/:id', ctrl.getOne);
router.post('/', rbacMiddleware('manage_roles'), ctrl.create);
router.put('/:id', rbacMiddleware('manage_roles'), ctrl.update);
router.delete('/:id', rbacMiddleware('manage_roles'), ctrl.remove);

export default router;