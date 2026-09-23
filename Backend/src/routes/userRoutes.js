import express from 'express';
import * as ctrl from '../controllers/userController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { rbacMiddleware } from '../middlewares/rbacMiddleware.js';

const router = express.Router();
router.use(authMiddleware, rbacMiddleware('manage_users'));

router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.put('/:id/toggle', ctrl.toggle);
router.delete('/:id', ctrl.remove);
router.post('/:id/reset-password', ctrl.resetPassword);

export default router;