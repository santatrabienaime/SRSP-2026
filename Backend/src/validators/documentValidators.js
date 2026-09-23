import Joi from 'joi';

export const createDocumentSchema = Joi.object({
  dossier_id: Joi.number().integer().allow(null),
  courrier_id: Joi.number().integer().allow(null),
  type_id: Joi.number().integer().allow(null),
});