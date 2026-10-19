import express from 'express';
import * as ctrl from '../controllers/personnelController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { rbacMiddleware } from '../middlewares/rbacMiddleware.js';
import { validateMiddleware } from '../middlewares/validateMiddleware.js';
import {
  createPersonnelSchema,
  updatePersonnelSchema,
  resetMotDePassePersonnelSchema,
} from '../validators/personnelValidators.js';

const router = express.Router();

/* Une personne réunit une fiche (`agents`) et un compte (`users`) : la garde
   demande donc l'une OU l'autre des permissions de gestion. Le mené n'est pas
   élargi pour autant — les deux ne sont détenues que par l'Administrateur. */
router.use(authMiddleware, rbacMiddleware(['manage_personnel', 'manage_users']));

router.get('/', ctrl.list);
router.get('/:id', ctrl.getOne);
router.post('/', validateMiddleware(createPersonnelSchema), ctrl.create);
router.put('/:id', validateMiddleware(updatePersonnelSchema), ctrl.update);
router.put('/:id/toggle', ctrl.toggle);
router.post('/:id/reset-password', validateMiddleware(resetMotDePassePersonnelSchema), ctrl.resetPassword);
router.delete('/:id', ctrl.remove);

export default router;
