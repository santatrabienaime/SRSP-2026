import Joi from 'joi';
import { motDePasseFort } from './authValidators.js';

/** Schémas de gestion des utilisateurs (validation des entrées). */

export const createUserSchema = Joi.object({
  username: Joi.string().trim().min(3).max(50).required()
    .messages({ 'string.empty': "L'identifiant est obligatoire." }),
  email: Joi.string().trim().email().max(100).required()
    .messages({ 'string.email': "L'adresse email n'est pas valide." }),
  password: motDePasseFort.required(),
  role_id: Joi.number().integer().positive().required()
    .messages({ 'any.required': 'Le rôle est obligatoire.' }),
  division_id: Joi.number().integer().positive().allow(null, ''),
}).unknown(true);

export const updateUserSchema = Joi.object({
  email: Joi.string().trim().email().max(100).required()
    .messages({ 'string.email': "L'adresse email n'est pas valide." }),
  role_id: Joi.number().integer().positive().required()
    .messages({ 'any.required': 'Le rôle est obligatoire.' }),
  // Le front envoie actif au format 0/1 (tinyint en base) : on accepte les deux.
  actif: Joi.boolean().truthy(1).falsy(0).required(),
}).unknown(true);

export const resetPasswordSchema = Joi.object({
  password: motDePasseFort.required(),
}).unknown(true);
