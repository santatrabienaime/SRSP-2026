import express from 'express';
import * as ctrl from '../controllers/depouillementController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { rbacMiddleware } from '../middlewares/rbacMiddleware.js';
import { assertDossierAccessMiddleware } from '../middlewares/scopeDossiersMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

// Consultation : réservée aux rôles autorisés sur le dossier
// (assertDossierAccessMiddleware applique le cloisonnement inter-division).
router.get('/:id/depouillement', assertDossierAccessMiddleware, ctrl.checklist);
router.get('/:id/depouillement/historique', assertDossierAccessMiddleware, ctrl.historique);

// Contrôle d'une pièce : agent de traitement (depouiller_pieces), chef de
// division qui vérifie ou valide le dossier, ou Admin. Le chef de division
// Pension ne porte ni `gerer_ordonnancement` ni `preparer_mandatement` : sans
// `verifier_dossier` / `valider_dossier`, il ne pourrait jamais constater les
// pièces avant de décider. L'accès au dossier reste contrôlé ci-dessous.
router.post(
  '/:id/depouillement',
  rbacMiddleware([
    'depouiller_pieces',
    'gerer_ordonnancement',
    'preparer_mandatement',
    'verifier_dossier',
    'valider_dossier',
  ]),
  assertDossierAccessMiddleware,
  ctrl.controler
);

export default router;
