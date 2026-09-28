import express from 'express';
import * as ctrl from '../controllers/historiqueController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

/* Journal des actions.
   Le cloisonnement est appliqué dans le service : la permission dit ce qu'on a
   le droit de voir en général, pas quelles lignes. Un chef de division ne peut
   ainsi pas lire le journal d'un dossier d'une autre division en devinant son
   identifiant. */
router.get('/', ctrl.list);
router.get('/actions', ctrl.actions);

router.get('/export/csv', ctrl.exportCsv);
router.get('/export/excel', ctrl.exportExcel);
router.get('/export/pdf', ctrl.exportPdf);

export default router;
