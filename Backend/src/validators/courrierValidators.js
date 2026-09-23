import Joi from 'joi';

export const createCourrierSchema = Joi.object({
  type_id: Joi.number().integer().required(),
  sens: Joi.string().valid('ENTRANT', 'SORTANT').required(),
  expediteur: Joi.string().allow('', null),
  destinataire: Joi.string().allow('', null),
  objet: Joi.string().required(),
  division_id: Joi.number().integer().allow(null),
  dossier_id: Joi.number().integer().allow(null),
});