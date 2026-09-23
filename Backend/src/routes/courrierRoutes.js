import express from 'express';
import * as ctrl from '../controllers/courrierController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { rbacMiddleware } from '../middlewares/rbacMiddleware.js';
import { validateMiddleware } from '../middlewares/validateMiddleware.js';
import { createCourrierSchema } from '../validators/courrierValidators.js';

const router = express.Router();
// Interface « Courriers » réservée (§14.1) : Admin, Chef Service, Chef BAAF, Secrétaire
router.use(authMiddleware, rbacMiddleware('manage_courriers'));

router.get('/', ctrl.list);
router.get('/:id', ctrl.getOne);
router.post('/', validateMiddleware(createCourrierSchema), ctrl.create);
router.put('/:id/statut', ctrl.updateStatut);

export default router;