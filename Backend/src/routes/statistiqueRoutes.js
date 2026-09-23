import express from 'express';
import * as ctrl from '../controllers/statistiqueController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.use(authMiddleware);
router.get('/', ctrl.getStats);

export default router;