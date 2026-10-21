import Joi from 'joi';

/**
 * Validation des données d'opération.
 *
 * Les champs sont tous facultatifs : ce sont ceux de l'opération qui
 * s'appliquent, et ils diffèrent d'une opération à l'autre. La validation
 * porte sur le **format** de chaque champ, jamais sur leur présence — c'est
 * l'écran qui affiche ceux qui concernent l'opération choisie.
 *
 * Le montant est un nombre : il est saisi par l'agent, jamais calculé.
 */

const MONTANT = Joi.number().precision(2).min(0).max(999999999999.99);

export const validateOperationSchema = Joi.object({
  /* Deux formes acceptées : la forme **déclarative** (`valeurs`), qui suit le
     schéma de l'opération, et la forme **plate** (les champs au premier
     niveau), qui reste acceptée pour compatibilité.

     Les clés inconnues ne sont pas refusées ici : c'est le **service** qui
     les filtre, en ne retenant que les champs que le schéma de l'opération
     déclare. Le valider ici les rejetterait sans connaître l'opération, et
     ferait perdre une saisie par une simple coquille. */
  valeurs: Joi.object().allow(null).unknown(true),

  reference_externe: Joi.string().trim().allow('', null).max(150),
  reference_dossier_mere: Joi.string().trim().allow('', null).max(150),
  matricule: Joi.string().trim().allow('', null).max(50),
  periode: Joi.string().trim().allow('', null).max(100),
  montant: MONTANT.allow('', null),
  source_montant: Joi.string().trim().allow('', null).max(255),
  date_reference: Joi.string().trim().allow('', null).pattern(/^\d{4}-\d{2}-\d{2}$/)
    .messages({ 'string.pattern.base': 'La date doit être au format AAAA-MM-JJ' }),
  destinataire: Joi.string().trim().allow('', null).max(200),
  date_transmission: Joi.string().trim().allow('', null).pattern(/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2})?$/)
    .messages({ 'string.pattern.base': 'La date et l’heure doivent être au format AAAA-MM-JJTHH:MM' }),
  reference_transmission: Joi.string().trim().allow('', null).max(100),
  etat_transmission: Joi.string().trim().allow('', null).max(30),
  localisation: Joi.string().trim().allow('', null).max(200),
  observation: Joi.string().trim().allow('', null).max(2000),
  donnees: Joi.object().allow(null).unknown(true),
}).unknown(true);

export const controleOperationSchema = Joi.object({
  decision: Joi.string().trim().required().max(30)
    .messages({
      'any.required': 'La décision de contrôle est requise',
      'string.empty': 'La décision de contrôle est requise',
    }),
  observations: Joi.string().trim().allow('', null).max(2000),
  date_controle: Joi.string().trim().allow('', null).pattern(/^\d{4}-\d{2}-\d{2}$/)
    .messages({ 'string.pattern.base': 'La date doit être au format AAAA-MM-JJ' }),
}).unknown(false);
