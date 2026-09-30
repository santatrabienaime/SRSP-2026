import express from 'express';
import * as ctrl from '../controllers/geographieController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { rbacMiddleware } from '../middlewares/rbacMiddleware.js';
import { assertDossierAccessMiddleware } from '../middlewares/scopeDossiersMiddleware.js';
import { validateMiddleware } from '../middlewares/validateMiddleware.js';
import Joi from 'joi';

const router = express.Router();
router.use(authMiddleware);

/* Le référentiel est lu par tout le monde : c'est une liste de districts, pas
   une donnée sensible, et la secrétaire en a besoin dès l'accueil. */
router.get('/referentiel', ctrl.referentiel);
router.get('/antennes', ctrl.antennes);
router.get('/districts', ctrl.districts);
router.get('/synthese', ctrl.synthese);

/* Rattacher un dossier est un acte d'administration : il engage la
   compétence territoriale de l'antenne, donc il est réservé à ceux qui
   enregistrent ou orientent. Un chef de division n'a pas à dire à quel
   district appartient un usager. */
const rattachementSchema = Joi.object({
  district_id: Joi.number().integer().required()
    .label('Le district')
    .messages({
      'any.required': 'Le district est requis',
      'number.base': 'Le district est invalide',
    }),
  /* La date de rattachement est datée, pas devinée : la carte administrative
     change, et un dossier doit rester rattaché au district qui était le sien
     à la date d'ouverture. */
  date_rattachement: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/)
    .allow('', null)
    .label('La date de rattachement')
    .messages({ 'string.pattern.base': 'La date doit être au format AAAA-MM-JJ' }),
  origine: Joi.string().valid('SAISIE', 'DEDUIT', 'CORRECTION').allow('', null),
}).unknown(false);

router.post(
  '/dossiers/:id/district',
  rbacMiddleware(['create_dossier', 'orienter_dossier', 'edit_dossier']),
  assertDossierAccessMiddleware,
  validateMiddleware(rattachementSchema),
  ctrl.rattacher
);

router.get('/dossiers/:id/district', assertDossierAccessMiddleware, ctrl.districtDuDossier);
router.get('/dossiers/:id/district/historique', assertDossierAccessMiddleware, ctrl.historique);

export default router;
