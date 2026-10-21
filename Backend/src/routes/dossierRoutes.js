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

/* Recherche d'un demandeur par son matricule, pour pré-remplir le formulaire.
   Cette route est déclarée AVANT `/:id` : sinon Express lirait «
   rechercher-par-matricule » comme un identifiant de dossier et répondrait 404. */
router.get('/rechercher-par-matricule', rbacMiddleware('create_dossier'), ctrl.rechercherParMatricule);

/* Trace des suppressions. Ces dossiers n'existent plus : la route est
   déclarée AVANT `/:id` pour que « suppressions » ne soit pas lu comme un
   identifiant de dossier. Réservée à l'audit. */
router.get('/suppressions', rbacMiddleware(['view_audit', 'manage_roles']), ctrl.suppressions);
router.get('/suppressions/:id', rbacMiddleware(['view_audit', 'manage_roles']), ctrl.suppression);

/* Actions en masse (référentiel) : même permission qu'en individuel, lot de
   100 maximum, chaque dossier restant soumis à sa propre transition. Déclaré
   AVANT `/:id/valider` : sinon Express appellerait valider(id='masse'). */
router.post('/masse/valider', rbacMiddleware(['verifier_dossier', 'valider_dossier']), ctrl.validerMasse);
router.post('/masse/signer', rbacMiddleware('signer_dossier'), ctrl.signerMasse);

router.get('/:id/tracabilite', assertDossierAccessMiddleware, ctrl.tracabilite);
router.get('/:id/fiche-reception', assertDossierAccessMiddleware, ctrl.ficheReceptionPDF);
router.get('/:id/prochaine-action', assertDossierAccessMiddleware, ctrl.prochaineAction);
router.get('/:id/transmissions', assertDossierAccessMiddleware, ctrl.transmissions);
router.get('/:id', assertDossierAccessMiddleware, ctrl.getOne);
router.get('/:id/statut', ctrl.statut);
router.post('/', rbacMiddleware('create_dossier'), validateMiddleware(createDossierSchema), ctrl.create);
router.put('/:id', rbacMiddleware('edit_dossier'), validateMiddleware(updateDossierSchema), ctrl.update);

// §14.2 : orienter = Secrétaire ; affecter = Chef de Division
router.post('/:id/orienter', rbacMiddleware('orienter_dossier'), ctrl.orienter);
router.post('/:id/affecter', rbacMiddleware('affecter_dossier'), ctrl.affecter);
// §14.2 : traiter/soumettre = Vérificateur / Liquidateur / Chargé
router.post('/:id/traiter', rbacMiddleware('traiter_dossier'), ctrl.traiter);
router.post(
  '/:id/demander-complement',
  rbacMiddleware(['traiter_dossier', 'soumettre_verification', 'verifier_dossier']),
  ctrl.demanderComplement
);
router.post(
  '/:id/verifier',
  rbacMiddleware(['soumettre_verification', 'verifier_dossier']),
  ctrl.verifier
);
// §14.2 : décision sur dossier soumis = Chef de Division (vérifier | valider)
router.post('/:id/valider', rbacMiddleware(['verifier_dossier', 'valider_dossier']), ctrl.valider);
// §14.2 : signer / clôturer / archiver = Chef de Service (et Admin)
router.post('/:id/signer', rbacMiddleware('signer_dossier'), ctrl.signer);
router.post('/:id/cloturer', rbacMiddleware('cloturer_dossier'), ctrl.cloturer);
router.post('/:id/archiver', rbacMiddleware('archiver_dossier'), ctrl.archiver);
// Publication d'un brouillon : l'action par laquelle un brouillon entre
// dans le circuit. Réservée à son auteur, que le service vérifie.
router.post('/:id/publier', rbacMiddleware('create_dossier'), ctrl.publier);
// La suppression est un acte administratif distinct de l'archivage : elle a sa
// propre permission, réservée à l'administrateur, et exige un motif.
router.delete('/:id', rbacMiddleware('delete_dossier'), ctrl.remove);

export default router;