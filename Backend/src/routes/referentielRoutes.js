import express from 'express';
import * as ctrl from '../controllers/referentielController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { rbacMiddleware } from '../middlewares/rbacMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

/* Le service lit le référentiel : c'est de la documentation, et il doit savoir
   ce que la plateforme sait faire. Le BILAN, en revanche, décrit l'état réel de
   la plateforme — y compris ce qui manque — et n'appartient qu'à ceux qui
   décident quoi construire ensuite : administrateur et Chef de Service. */
/* Les données de référence des formulaires : types de dossiers, priorités,
   fonctions, types de courriers, types de documents, statuts. Six écrans en
   dépendent. La route est declaree AVANT `/service` pour que le nom reste
   lisible : `/referentiel` est le premier appel que fait un formulaire. */
router.get('/', ctrl.getReferentiel);
router.get('/service', ctrl.service);
router.get('/fonctions', ctrl.lister);
router.get('/bilan', rbacMiddleware(['view_audit', 'consolidate_reports']), ctrl.bilan);
router.get('/postes', ctrl.postes);

export default router;
