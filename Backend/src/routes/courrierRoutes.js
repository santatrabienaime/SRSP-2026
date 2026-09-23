import express from 'express';
import * as ctrl from '../controllers/courrierController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { rbacMiddleware } from '../middlewares/rbacMiddleware.js';
import { validateMiddleware } from '../middlewares/validateMiddleware.js';
import { createCourrierSchema } from '../validators/courrierValidators.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', ctrl.list);
router.get('/:id', ctrl.getOne);
router.post('/', rbacMiddleware('courrier.gerer'), validateMiddleware(createCourrierSchema), ctrl.create);
router.put('/:id/statut', rbacMiddleware('courrier.gerer'), ctrl.updateStatut);

export default router;