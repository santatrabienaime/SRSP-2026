import express from 'express';
import * as ctrl from '../controllers/archiveController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { rbacMiddleware } from '../middlewares/rbacMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

/* Consultation des archives.
   view_archives ouvre la LECTURE. Le périmètre (division du chef de division)
   est appliqué côté service : une permission ne dit pas à elle seule quelles
   lignes l'utilisateur a le droit de voir. */
router.get('/', rbacMiddleware('view_archives'), ctrl.lister);
router.get('/tris', rbacMiddleware('view_archives'), ctrl.tris);
router.get('/statistiques', rbacMiddleware('view_archives'), ctrl.statistiques);
router.get('/alertes', rbacMiddleware('view_archives'), ctrl.alertes);
router.get('/export/csv', rbacMiddleware('view_archives'), ctrl.exportCsv);
router.get('/export/excel', rbacMiddleware('view_archives'), ctrl.exportExcel);
router.get('/export/pdf', rbacMiddleware('view_archives'), ctrl.exportPdf);
router.get('/:id', rbacMiddleware('view_archives'), ctrl.detail);

/* Restauration : administrateur uniquement, motif obligatoire.
   Le contrôle du rôle est refait côté service — une permission suffirait à
   désigner un rôle, pas à garantir qu'une seule personne l'exerce. */
router.post('/:id/restaurer', ctrl.restaurer);

export default router;
