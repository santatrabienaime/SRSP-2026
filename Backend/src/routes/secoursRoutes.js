import express from 'express';
import * as ctrl from '../controllers/secoursController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { rbacMiddleware } from '../middlewares/rbacMiddleware.js';
import { assertDossierAccessMiddleware } from '../middlewares/scopeDossiersMiddleware.js';
import { validateMiddleware } from '../middlewares/validateMiddleware.js';
import {
  visaSchema, cachetSchema, signatureSchema, emargementSchema,
} from '../validators/secoursValidators.js';

/**
 * Division Secours, montée sur /api/dossiers : les routes sont en
 * `/:id/secours/...`, le dossier restant le point d'entrée partout ailleurs.
 *
 * Cette route est déclarée APRÈS `/:id/mandatement` dans mandatementRoutes et
 * est montée sur le même préfixe. Express les distingue par leur motif : aucun
 * risque de capturer `/:id/mandatement`.
 */
const router = express.Router();
router.use(authMiddleware);

/* La lecture est ouverte à qui peut consulter le dossier : `assertDossierAccess`
   cloisonne par division, et c'est le contrôle qui doit s'appliquer, pas une
   permission. Réserver la lecture empêcherait le chargé de secours de vérifier
   l'état d'avancement d'un mandat qu'il doit matérialiser. */
router.get('/:id/secours/etat', assertDossierAccessMiddleware, ctrl.etatComplet);
router.get('/:id/secours/reception', assertDossierAccessMiddleware, ctrl.etatReception);
router.get('/:id/secours/visa', assertDossierAccessMiddleware, ctrl.getVisa);
router.get('/:id/secours/emargement', assertDossierAccessMiddleware, ctrl.getEmargement);
router.get('/:id/secours/signature', assertDossierAccessMiddleware, ctrl.getSignature);
router.get('/:id/secours/cachet', assertDossierAccessMiddleware, ctrl.getCachet);
router.get('/:id/secours/references', assertDossierAccessMiddleware, ctrl.referencesLogiciel);

/* --- 1.1 Visa du contrôle financier --- */
router.post(
  '/:id/secours/visa',
  rbacMiddleware('enregistrer_visa_cf'),
  assertDossierAccessMiddleware,
  validateMiddleware(visaSchema),
  ctrl.enregistrerVisa
);

/* --- 1.6 Références du logiciel secours et état d'émargement --- */
router.post(
  '/:id/secours/references/:code',
  rbacMiddleware('generer_etat_emargement'),
  assertDossierAccessMiddleware,
  ctrl.marquerReference
);
router.post(
  '/:id/secours/emargement',
  rbacMiddleware('generer_etat_emargement'),
  assertDossierAccessMiddleware,
  ctrl.genererEmargement
);
router.put(
  '/:id/secours/emargement/:beneficiaire',
  rbacMiddleware('generer_etat_emargement'),
  assertDossierAccessMiddleware,
  validateMiddleware(emargementSchema),
  ctrl.signerEmargement
);

/* --- 1.7 Signature des pièces par l'ordonnateur ---
   Permission DEDIEE, et non `suivre_signature` : celle-ci appartient au Chef de
   Division Secours, qui aurait alors authentifié sa propre dépense. Le contrôle
   que l'ordonnancement existe pour assurer aurait disparu. */
router.post(
  '/:id/secours/signature',
  rbacMiddleware('signer_pieces_mandatement'),
  assertDossierAccessMiddleware,
  validateMiddleware(signatureSchema),
  ctrl.enregistrerSignature
);
/* Archiver la copie signée est un acte MATÉRIEL : le document (1.7) le confie au
   Chef de Division Secours, qui assemble le dossier. La rattacher à la
   permission de signature l'aurait réservé au Chef de Service, c'est-à-dire à
   celui qui n'a pas les pièces en main. */
router.post(
  '/:id/secours/signature/archiver',
  rbacMiddleware('archiver_copie_mandatement'),
  assertDossierAccessMiddleware,
  ctrl.archiverCopie
);

/* --- 2.4 Cachet, titre et date --- */
router.post(
  '/:id/secours/cachet',
  rbacMiddleware('apposer_cachet'),
  assertDossierAccessMiddleware,
  validateMiddleware(cachetSchema),
  ctrl.apposerCachet
);

export default router;
