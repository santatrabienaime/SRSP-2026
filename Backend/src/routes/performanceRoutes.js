import express from 'express';
import * as ctrl from '../controllers/performanceController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

/* Le filtrage par division ou par agent n'est pas une option : `getEquipe` et
   `getParAgent` refusent d'eux-mêmes un périmètre trop large. Sans cela, un chef
   de division qui renommerait l'URL verrait tout le service. */
router.get('/moi', ctrl.getMiennes);
router.get('/equipe', ctrl.getEquipe);
router.get('/synthese', ctrl.getSynthese);
router.get('/agent/:id', ctrl.getParAgent);

export default router;
