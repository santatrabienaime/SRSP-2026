import express from 'express';
import * as ctrl from '../controllers/workflowController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/:id/statut', ctrl.getStatus);
router.post('/:id/transition', ctrl.transition);

export default router;