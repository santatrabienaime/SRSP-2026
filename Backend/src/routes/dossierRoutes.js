import express from 'express';
import * as ctrl from '../controllers/dossierController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { rbacMiddleware } from '../middlewares/rbacMiddleware.js';
import { validateMiddleware } from '../middlewares/validateMiddleware.js';
import { createDossierSchema, updateDossierSchema } from '../validators/dossierValidators.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', ctrl.list);
router.get('/:id', ctrl.getOne);
router.get('/:id/statut', ctrl.statut);
router.post('/', rbacMiddleware('dossier.creer'), validateMiddleware(createDossierSchema), ctrl.create);
router.put('/:id', rbacMiddleware('dossier.modifier'), validateMiddleware(updateDossierSchema), ctrl.update);

router.post('/:id/orienter', rbacMiddleware('dossier.affecter'), ctrl.orienter);
router.post('/:id/affecter', rbacMiddleware('dossier.affecter'), ctrl.affecter);
router.post('/:id/traiter', rbacMiddleware('dossier.traiter'), ctrl.traiter);
router.post('/:id/verifier', rbacMiddleware('dossier.verifier'), ctrl.verifier);
router.post('/:id/valider', rbacMiddleware('dossier.valider'), ctrl.valider);
router.post('/:id/signer', rbacMiddleware('dossier.valider'), ctrl.signer);
router.post('/:id/cloturer', rbacMiddleware('dossier.cloturer'), ctrl.cloturer);
router.post('/:id/archiver', rbacMiddleware('dossier.archiver'), ctrl.archiver);

export default router;