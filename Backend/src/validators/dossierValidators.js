import Joi from 'joi';

export const createDossierSchema = Joi.object({
  type_id: Joi.number().integer().required(),
  objet: Joi.string().required(),
  demandeur: Joi.string().required(),
  matricule: Joi.string().allow('', null),
  date_reception: Joi.date().iso().required(),
  division_id: Joi.number().integer().required(),
  priorite_id: Joi.number().integer().required(),
  observation: Joi.string().allow('', null),
});

export const updateDossierSchema = createDossierSchema;