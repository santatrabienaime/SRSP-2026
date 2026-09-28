import express from 'express';
import * as ctrl from '../controllers/dossierController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { rbacMiddleware } from '../middlewares/rbacMiddleware.js';
import { validateMiddleware } from '../middlewares/validateMiddleware.js';
import { createDossierSchema, updateDossierSchema } from '../validators/dossierValidators.js';
import { scopeDossiersMiddleware, assertDossierAccessMiddleware } from '../middlewares/scopeDossiersMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', scopeDossiersMiddleware, ctrl.list);

/* Recherche d'un demandeur par son CIN, pour pré-remplir le formulaire.
   Cette route est déclarée AVANT `/:id` : sinon Express lirait « verifier-cin »
   comme un identifiant de dossier et répondrait 404. */
router.get('/rechercher-par-cin', rbacMiddleware('create_dossier'), ctrl.rechercherParCIN);

router.get('/:id/tracabilite', assertDossierAccessMiddleware, ctrl.tracabilite);
router.get('/:id', assertDossierAccessMiddleware, ctrl.getOne);
router.get('/:id/statut', ctrl.statut);
router.post('/', rbacMiddleware('create_dossier'), validateMiddleware(createDossierSchema), ctrl.create);
router.put('/:id', rbacMiddleware('edit_dossier'), validateMiddleware(updateDossierSchema), ctrl.update);

// §14.2 : orienter = Secrétaire ; affecter = Chef de Division
router.post('/:id/orienter', rbacMiddleware('orienter_dossier'), ctrl.orienter);
router.post('/:id/affecter', rbacMiddleware('affecter_dossier'), ctrl.affecter);
// §14.2 : traiter/soumettre = Vérificateur / Liquidateur / Chargé
router.post('/:id/traiter', rbacMiddleware('traiter_dossier'), ctrl.traiter);
router.post('/:id/verifier', rbacMiddleware('soumettre_verification'), ctrl.verifier);
// §14.2 : décision sur dossier soumis = Chef de Division (vérifier | valider)
router.post('/:id/valider', rbacMiddleware(['verifier_dossier', 'valider_dossier']), ctrl.valider);
// §14.2 : signer / clôturer / archiver = Chef de Service (et Admin)
router.post('/:id/signer', rbacMiddleware('signer_dossier'), ctrl.signer);
router.post('/:id/cloturer', rbacMiddleware('cloturer_dossier'), ctrl.cloturer);
router.post('/:id/archiver', rbacMiddleware('archiver_dossier'), ctrl.archiver);

export default router;