import express from 'express';
import * as ctrl from '../controllers/ordreDeplacementController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { rbacMiddleware } from '../middlewares/rbacMiddleware.js';
import { validateMiddleware } from '../middlewares/validateMiddleware.js';
import {
  ordreSchema, transitionSchema, annulationSchema,
} from '../validators/ordreDeplacementValidators.js';

const router = express.Router();
router.use(authMiddleware);

/* Permission requise pour chaque transition. Signer est réservé au Chef de
   Service, établir et exécuter au BAAF.

   Déclarée ici plutôt que dans le contrôleur : la règle d'accès est une donnée
   de la route, et la connaître en un seul endroit évite qu'un nouveau point
   d'entrée (une action groupée, un script) ne l'ignore. */
const PERMISSION_PAR_STATUT = {
  SIGNE: 'signer_pieces_deplacement',
  EXECUTEE: 'executer_pieces_deplacement',
  CLOTUREE: 'executer_pieces_deplacement',
  SOUMIS: 'etablir_pieces_deplacement',
  REJETEE: 'signer_pieces_deplacement',
};

/** Rejoue le middleware RBAC avec la permission propre à la transition. */
function permissionDeLaTransition() {
  return (req, res, next) => {
    const requise = PERMISSION_PAR_STATUT[req.body.statut];
    if (!requise) {
      return res.status(400).json({ message: 'Transition inconnue.' });
    }
    return rbacMiddleware(requise)(req, res, next);
  };
}

/* Consulter les types et la liste n'exige pas de permission particulière : c'est
   de la lecture sur des dossiers, cloisonnée dossier par dossier dans le
   contrôleur. Réserver la lecture empêcherait le BAAF de voir ce qu'il a établi. */
router.get('/types', ctrl.types);
router.get('/tableau-de-bord', ctrl.tableauDeBord);
router.get('/', ctrl.lister);

router.post(
  '/',
  rbacMiddleware('etablir_pieces_deplacement'),
  validateMiddleware(ordreSchema),
  ctrl.creer
);

router.get('/:id', ctrl.detail);

router.put(
  '/:id',
  /* Le corps est d'abord normalisé par Joi, pour que `req.body.statut` soit
     exactement la valeur analysée et non une chaîne non normalisée. Le garde de
     permission vient ensuite : il doit reposer sur le statut réellement demandé,
     pas sur une valeur que le validateur aurait encore à corriger. */
  validateMiddleware(transitionSchema),
  permissionDeLaTransition(),
  ctrl.transitionner
);

/* L'annulation exige la permission d'etablir : c'est le BAAF qui se trompe,
   et c'est donc lui qui corrige. Le signataire ne dispose pas de cette
   permission, et ne peut donc pas effacer une piece qu'il a refusee de signer. */
router.delete(
  '/:id',
  rbacMiddleware('etablir_pieces_deplacement'),
  validateMiddleware(annulationSchema),
  ctrl.annuler
);

export default router;
