import express from 'express';
import * as ctrl from '../controllers/referentielController.js';
import * as crudCtrl from '../controllers/referentielCrudController.js';
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

// CRUD types de dossiers
router.get('/types-dossiers', crudCtrl.listTypesDossiers);
router.post('/types-dossiers', rbacMiddleware('manage_divisions'), crudCtrl.createTypeDossier);
router.delete('/types-dossiers/:id', rbacMiddleware('manage_divisions'), crudCtrl.deleteTypeDossier);

// CRUD types de pieces
router.get('/types-pieces', crudCtrl.listTypesPieces);
router.post('/types-pieces', rbacMiddleware('manage_divisions'), crudCtrl.createTypePiece);
router.delete('/types-pieces/:id', rbacMiddleware('manage_divisions'), crudCtrl.deleteTypePiece);

/* CRUD types de courriers. La lecture est ouverte au même titre que les autres
   données de référence : le formulaire de courrier en a besoin. L'écriture
   demande `manage_courriers`, la permission du module concerné. */
router.get('/types-courriers', crudCtrl.listTypesCourriers);
router.post('/types-courriers', rbacMiddleware('manage_courriers'), crudCtrl.createTypeCourrier);
router.delete('/types-courriers/:id', rbacMiddleware('manage_courriers'), crudCtrl.deleteTypeCourrier);

export default router;
