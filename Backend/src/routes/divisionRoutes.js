import express from 'express';
import * as ctrl from '../controllers/divisionController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { rbacMiddleware } from '../middlewares/rbacMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', ctrl.list);
/* Fiche individuelle : evite de charger les quatre divisions pour en afficher
   une, et evite un filtre par identifiant cote interface. */
router.get('/:id', ctrl.getOne);
router.post('/', rbacMiddleware('manage_divisions'), ctrl.create);
router.put('/:id', rbacMiddleware('manage_divisions'), ctrl.update);

export default router;