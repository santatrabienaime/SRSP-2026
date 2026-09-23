import express from 'express';
import * as ctrl from '../controllers/documentController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { uploadSingle } from '../middlewares/uploadMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', ctrl.list);
router.post('/', uploadSingle('fichier'), ctrl.upload);
router.put('/:id/valider', ctrl.valider);
router.delete('/:id', ctrl.remove);

export default router;