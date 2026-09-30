import express from 'express';
import * as ctrl from '../controllers/acteController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { rbacMiddleware } from '../middlewares/rbacMiddleware.js';
import { validateMiddleware } from '../middlewares/validateMiddleware.js';
import {
  createActeSchema, annulerActeSchema, createTypeActeSchema,
} from '../validators/acteValidators.js';

const router = express.Router();

/* Le registre est un état du service : seul un compte connecté le voit, et
   personne d'autre. Sans cette porte, un agent sans permission pourrait lire la
   correspondance sortante, qui porte les noms des bénéficiaires et les
   montants. */
router.use(authMiddleware);

/* Créer un type d'acte ouvre une nouvelle série de numéros : c'est une décision
   sur la nomenclature du registre, pas une saisie du quotidien. Elle revient à
   l'administrateur seul, pas à la secrétaire qui tient le registre.

   La porte est `system_config` et non `gerer_chronologie_actes`, parce que le
   garde RBAC est un OU : une liste `['system_config',
   'gerer_chronologie_actes']` laisserait passer la secrétaire, qui est
   précisément celle que l'on veut tenir à l'écart de la création d'un type. */
router.post(
  '/types',
  rbacMiddleware('system_config'),
  validateMiddleware(createTypeActeSchema),
  ctrl.createType
);

router.use(rbacMiddleware('gerer_chronologie_actes'));

/* `/chronologie` et `/types` sont déclarés après la porte mais avant `/:id` :
   sinon « chronologie » serait lu comme un identifiant. */
router.get('/chronologie', ctrl.chronologie);
router.get('/types', ctrl.listTypes);
router.get('/', ctrl.list);
router.get('/:id', ctrl.getOne);
router.post('/', validateMiddleware(createActeSchema), ctrl.create);
router.put('/:id/annuler', validateMiddleware(annulerActeSchema), ctrl.annuler);

export default router;
