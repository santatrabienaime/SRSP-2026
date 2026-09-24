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

// Contrôle d'une pièce : Chargé de Secours (depouiller_pieces), Chef de
// Division Secours, ou Admin. Un Chargé de Secours doit par ailleurs être
// le responsable du dossier (middleware d'accès).
router.post(
  '/:id/depouillement',
  rbacMiddleware(['depouiller_pieces', 'gerer_ordonnancement', 'preparer_mandatement']),
  assertDossierAccessMiddleware,
  ctrl.controler
);

export default router;
