import Joi from 'joi';

/* La date d'un acte est une date d'acte : celle à laquelle l'acte porte, pas
   celle de la saisie. Une note de service peut être datée du lendemain du jour
   où la secrétaire l'enregistre — c'est même le cas ordinaire, quand le
   courrier arrive le soir. La date de saisie reste dans `created_at`. */
const dateActe = Joi.string()
  .isoDate()
  .required()
  .messages({
    'string.isoDate': "La date de l'acte doit être une date valide (AAAA-MM-JJ).",
    'any.required': "La date de l'acte est obligatoire.",
  });

export const createActeSchema = Joi.object({
  type_acte_id: Joi.number().integer().required()
    .messages({ 'any.required': "Le type d'acte est obligatoire." }),
  date_acte: dateActe,
  objet: Joi.string().trim().min(3).max(255).required()
    .messages({
      'any.required': "L'objet de l'acte est obligatoire.",
      'string.empty': "L'objet de l'acte est obligatoire.",
      'string.min': "L'objet doit faire au moins 3 caractères.",
    }),
  destinataire: Joi.string().trim().allow('', null).max(150),
  expediteur: Joi.string().trim().allow('', null).max(150),
  dossier_id: Joi.number().integer().allow(null),
  division_id: Joi.number().integer().allow(null),
  observations: Joi.string().allow('', null).max(2000),
}).messages({ 'object.unknown': 'Champ inattendu dans la demande.' });

export const annulerActeSchema = Joi.object({
  motif: Joi.string().trim().min(3).max(2000).required()
    .messages({
      'any.required': "Le motif de l'annulation est obligatoire : un acte annulé reste au registre, et c'est le motif qui explique pourquoi il est barré.",
      'string.min': "Le motif de l'annulation doit faire au moins 3 caractères.",
    }),
}).messages({ 'object.unknown': 'Champ inattendu dans la demande.' });

export const createTypeActeSchema = Joi.object({
  code: Joi.string().trim().uppercase().max(30).required()
    .messages({ 'any.required': 'Le code du type est obligatoire.' }),
  libelle: Joi.string().trim().min(2).max(120).required()
    .messages({ 'any.required': 'Le libellé du type est obligatoire.' }),
  prefixe: Joi.string().trim().uppercase().min(2).max(10).required()
    .messages({
      'any.required': 'Le préfixe est obligatoire : c\'est lui qui ouvre le numéro.',
      'string.min': 'Le préfixe doit faire au moins 2 caractères.',
    }),
  description: Joi.string().allow('', null).max(2000),
}).messages({ 'object.unknown': 'Champ inattendu dans la demande.' });
