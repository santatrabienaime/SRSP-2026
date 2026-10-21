import express from 'express';
import * as ctrl from '../controllers/referentielController.js';
import * as crudCtrl from '../controllers/referentielCrudController.js';
import * as schemaCtrl from '../controllers/schemaOperationController.js';
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
/* Le registre de conformité : les exigences du cahier, une par une, avec
   leur état. La route s'appelait « /fonctions », ce qui se confondait avec
   les fonctions d'emploi du personnel — deux choses sans rapport, dans le
   même écran. Elle porte le même contrôle que le bilan : ce registre dit ce
   qui manque, et il n'est pas public. */
router.get('/conformite', rbacMiddleware(['view_audit', 'consolidate_reports']), ctrl.lister);
router.get('/bilan', rbacMiddleware(['view_audit', 'consolidate_reports']), ctrl.bilan);
router.get('/postes', rbacMiddleware(['view_audit', 'consolidate_reports']), ctrl.postes);

// CRUD types de dossiers
router.get('/types-dossiers', crudCtrl.listTypesDossiers);
router.post('/types-dossiers', rbacMiddleware('manage_divisions'), crudCtrl.createTypeDossier);
router.delete('/types-dossiers/:id', rbacMiddleware('manage_divisions'), crudCtrl.deleteTypeDossier);

/* Sous-types de dossiers (types d'acte). La lecture est ouverte aux
   formulaires ; l'écriture demande `gerer_sous_types`, permission distincte de
   l'administration technique des divisions. */
router.get('/sous-types', crudCtrl.listSousTypes);
router.post('/sous-types', rbacMiddleware('gerer_sous_types'), crudCtrl.createSousType);
router.put('/sous-types/:id', rbacMiddleware('gerer_sous_types'), crudCtrl.updateSousType);
router.delete('/sous-types/:id', rbacMiddleware('gerer_sous_types'), crudCtrl.deleteSousType);

/* Types de pièces requises. La lecture sert au formulaire et au dépouillement ;
   l'écriture demande `configurer_pieces`. La suppression désactive la pièce au
   lieu de l'effacer, pour que les contrôles passés restent lisibles. */
router.get('/types-pieces', crudCtrl.listTypesPieces);
router.post('/types-pieces', rbacMiddleware('configurer_pieces'), crudCtrl.createTypePiece);
router.put('/types-pieces/:id', rbacMiddleware('configurer_pieces'), crudCtrl.updateTypePiece);
router.delete('/types-pieces/:id', rbacMiddleware('configurer_pieces'), crudCtrl.deleteTypePiece);

/* Schémas de données par type d'opération.
   Un schéma décrit les champs que l'agent saisit pour une opération : c'est
   ce qui permet au SRSP de faire évoluer ses formulaires sans développement. */
router.get('/schemas-operations', rbacMiddleware('configurer_operations'), schemaCtrl.lister);
router.put(
  '/schemas-operations/:id',
  rbacMiddleware('configurer_operations'),
  schemaCtrl.remplacer
);
/* Retirer un champ un par un n'a pas d'intérêt : l'écran prépare le
   schéma complet et l'enregistre en une fois. Un second chemin pour la même
   action risquerait de laisser le schéma à moitié configuré. */

/* CRUD types de courriers. La lecture est ouverte au même titre que les autres
   données de référence : le formulaire de courrier en a besoin. L'écriture
   demande `manage_courriers`, la permission du module concerné. */
router.get('/types-courriers', crudCtrl.listTypesCourriers);
router.post('/types-courriers', rbacMiddleware('manage_courriers'), crudCtrl.createTypeCourrier);
router.delete('/types-courriers/:id', rbacMiddleware('manage_courriers'), crudCtrl.deleteTypeCourrier);

export default router;
