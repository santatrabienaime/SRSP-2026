import express from 'express';
import * as ctrl from '../controllers/historiqueController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.use(authMiddleware);
router.get('/', ctrl.list);

export default router;