import express from 'express';
import * as ctrl from '../controllers/administratifController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { rbacMiddleware } from '../middlewares/rbacMiddleware.js';
import { validateMiddleware } from '../middlewares/validateMiddleware.js';
import {
  immatriculationSchema, majImmatriculationSchema, augureSchema, paiementSchema,
} from '../validators/administratifValidators.js';

const router = express.Router();
router.use(authMiddleware);

/* Les permissions existaient depuis le début sans.Menu ni écran : elles
    sont enfin rattachées à quelque chose. Le tableau de bord ouvre la partie, et
    exige le même droit que les actions qu'il annonce. */
router.get('/tableau-de-bord', rbacMiddleware('gerer_immatriculations'), ctrl.tableauDeBord);

/* Immatriculation */
router.get('/immatriculations', rbacMiddleware('gerer_immatriculations'), ctrl.listerImmatriculations);
router.post('/immatriculations', rbacMiddleware('gerer_immatriculations'), validateMiddleware(immatriculationSchema), ctrl.creerImmatriculation);
router.get('/immatriculations/verifier-cin', rbacMiddleware('gerer_immatriculations'), ctrl.verifierCIN);
router.get('/immatriculations/:id', rbacMiddleware('gerer_immatriculations'), ctrl.immatriculation);
router.put('/immatriculations/:id', rbacMiddleware('gerer_immatriculations'), validateMiddleware(majImmatriculationSchema), ctrl.majImmatriculation);

/* Insertion Augure */
router.get('/augure', rbacMiddleware('gerer_augure'), ctrl.listerAugure);
router.post('/augure', rbacMiddleware('gerer_augure'), validateMiddleware(augureSchema), ctrl.creerAugure);
router.put('/augure/:id', rbacMiddleware('gerer_augure'), ctrl.majAugure);

/* Mode de paiement */
router.get('/paiements', rbacMiddleware('gerer_paiements'), ctrl.listerPaiements);
router.post('/paiements', rbacMiddleware('gerer_paiements'), validateMiddleware(paiementSchema), ctrl.creerPaiement);
router.put('/paiements/:id', rbacMiddleware('gerer_paiements'), ctrl.traiterPaiement);

export default router;
