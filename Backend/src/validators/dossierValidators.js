import Joi from 'joi';

export const createDossierSchema = Joi.object({
  type_id: Joi.number().integer().required(),
  objet: Joi.string().required(),
  demandeur: Joi.string().required(),
  matricule: Joi.string().allow('', null),
  date_reception: Joi.date().iso().required(),
  // Routage automatique : la division est déduite du type de dossier.
  // Si elle est transmise, le serveur vérifie qu'elle correspond au type.
  division_id: Joi.number().integer().allow(null, ''),
  priorite_id: Joi.number().integer().required(),
  observation: Joi.string().allow('', null),
  date_limite: Joi.date().iso().allow('', null),
});

export const updateDossierSchema = Joi.object({
  type_id: Joi.number().integer().required(),
  objet: Joi.string().required(),
  demandeur: Joi.string().required(),
  matricule: Joi.string().allow('', null),
  division_id: Joi.number().integer().allow(null, ''),
  priorite_id: Joi.number().integer().required(),
  observation: Joi.string().allow('', null),
  // Règle 3 : motif obligatoire pour une dérogation de division.
  motif_changement_division: Joi.string().allow('', null),
}).unknown(true);