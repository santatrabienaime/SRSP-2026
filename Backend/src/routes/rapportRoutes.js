import express from 'express';
import * as ctrl from '../controllers/rapportController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/pdf', ctrl.pdf);
router.get('/excel', ctrl.excel);

export default router;