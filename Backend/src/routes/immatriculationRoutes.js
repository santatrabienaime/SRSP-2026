import express from 'express';
import * as ctrl from '../controllers/immatriculationController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { rbacMiddleware } from '../middlewares/rbacMiddleware.js';
import { validateMiddleware } from '../middlewares/validateMiddleware.js';
import {
  immatriculationSchema, majImmatriculationSchema, augureSchema, paiementSchema,
} from '../validators/administratifValidators.js';

/**
 * Module d'immatriculation de la Coordination.
 *
 * Une ressource de premier niveau : `/api/immatriculations`. Les sous-objets
 * — insertion en paie, changement de mode de paiement — sont rattachés à
 * l'immatriculation, parce qu'ils n'existent que par elle.
 */
const router = express.Router();
router.use(authMiddleware);

/* Les volumes sont ouverts à qui peut consulter : c'est un tableau de bord
   d'activité, pas une donnée sensible. */
router.get('/volumes', rbacMiddleware('view_stats'), ctrl.volumes);

router.get('/', rbacMiddleware('gerer_immatriculations'), ctrl.lister);
router.post(
  '/',
  rbacMiddleware('gerer_immatriculations'),
  validateMiddleware(immatriculationSchema),
  ctrl.creer
);
router.get('/:id', rbacMiddleware('gerer_immatriculations'), ctrl.detail);
router.put(
  '/:id',
  rbacMiddleware('gerer_immatriculations'),
  validateMiddleware(majImmatriculationSchema),
  ctrl.modifier
);

/* L'insertion en paie : les éléments requis pour insérer un nouvel
   arrivant dans les systèmes de paie et de pension. */
router.post(
  '/:id/insertion',
  rbacMiddleware('gerer_immatriculations'),
  validateMiddleware(augureSchema),
  ctrl.enregistrerInsertion
);
router.put(
  '/:id/insertion/:insertionId',
  rbacMiddleware('gerer_immatriculations'),
  ctrl.modifierInsertion
);

/* Le changement de mode de paiement : une décision qui exige un motif et des
   pièces justificatives vérifiées. */
router.post(
  '/:id/paiement',
  rbacMiddleware('gerer_immatriculations'),
  validateMiddleware(paiementSchema),
  ctrl.enregistrerChangement
);
router.put(
  '/:id/paiement/:paiementId',
  rbacMiddleware('gerer_immatriculations'),
  ctrl.modifierChangement
);

export default router;
