import express from 'express';
import { getReferentiel } from '../controllers/referentielController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', getReferentiel);

export default router;