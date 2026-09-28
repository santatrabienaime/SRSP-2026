import express from 'express';
import * as ctrl from '../controllers/userController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { rbacMiddleware } from '../middlewares/rbacMiddleware.js';
import { validateMiddleware } from '../middlewares/validateMiddleware.js';
import {
  createUserSchema, updateUserSchema, resetPasswordSchema,
} from '../validators/userValidators.js';

const router = express.Router();
router.use(authMiddleware, rbacMiddleware('manage_users'));

router.get('/', ctrl.list);
router.post('/', validateMiddleware(createUserSchema), ctrl.create);
router.put('/:id', validateMiddleware(updateUserSchema), ctrl.update);
router.put('/:id/toggle', ctrl.toggle);
router.delete('/:id', ctrl.remove);
router.post('/:id/reset-password', validateMiddleware(resetPasswordSchema), ctrl.resetPassword);

export default router;