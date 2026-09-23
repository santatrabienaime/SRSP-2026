import express from 'express';
import * as ctrl from '../controllers/notificationController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', ctrl.list);
router.put('/:id/lu', ctrl.markRead);
router.put('/lu/tout', ctrl.markAllRead);

export default router;