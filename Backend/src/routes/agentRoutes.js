import express from 'express';
import * as ctrl from '../controllers/agentController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { rbacMiddleware } from '../middlewares/rbacMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', ctrl.list);
/* Fiche individuelle. L'interface ne peut pas se contenter de la liste : charger
   les treize agents pour en afficher un est correct mais fragile — le jour où
   le service compte deux cents agents, la page de détail devient inutilisable et
   le filtre par identifiant échoue silencieusement. */
router.get('/:id', ctrl.getOne);
router.post('/', rbacMiddleware('manage_personnel'), ctrl.create);
router.put('/:id', rbacMiddleware('manage_personnel'), ctrl.update);

export default router;