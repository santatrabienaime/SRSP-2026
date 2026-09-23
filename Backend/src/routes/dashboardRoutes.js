import express from 'express';
import * as ctrl from '../controllers/dashboardController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/summary', ctrl.summary);
router.get('/by-division', ctrl.byDivision);
router.get('/by-status', ctrl.byStatus);
router.get('/evolution', ctrl.evolution);

export default router;