import Joi from 'joi';
import { motDePasseFort } from './authValidators.js';

/**
 * Schémas de la fiche « personnel » : l'identité d'un agent et, lorsqu'il en a
 * un, son compte de connexion, saisis dans le même formulaire.
 *
 * La forme des données est vérifiée ici ; les règles de service (matricule
 * libre, identifiant et email non déjà pris, un compte pour une seule fiche,
 * politique du mot de passe) sont appliquées par `personnelService`, seul
 * module qui connaît l'état de la base.
 */

const NOM_MESSAGE = 'Indiquez au moins deux caractères.';

const IDENTITE = {
  nom: Joi.string().trim().min(2).max(100).messages({
    'string.empty': 'Le nom est obligatoire.',
    'string.min': NOM_MESSAGE,
    'string.max': 'Le nom ne peut pas dépasser 100 caractères.',
  }),
  prenom: Joi.string().trim().min(2).max(100).messages({
    'string.empty': 'Le prénom est obligatoire.',
    'string.min': NOM_MESSAGE,
    'string.max': 'Le prénom ne peut pas dépasser 100 caractères.',
  }),
  // Bornes larges : la règle du service (2 à 10 caractères alphanumériques) est
  // vérifiée par `personnelService`, qui peut la commenter au lieu de refuser.
  matricule: Joi.string().trim().allow('', null).max(50),
  fonction_id: Joi.number().integer().positive().allow(null, ''),
  division_id: Joi.number().integer().positive().allow(null, ''),
  // Email de contact de la fiche : distinct de l'email de connexion du compte.
  email: Joi.string().trim().email().max(100).allow('', null)
    .messages({ 'string.email': "L'adresse email de contact n'est pas valide." }),
  telephone: Joi.string().trim().max(30).allow('', null),
  actif: Joi.boolean().truthy(1).falsy(0),
};

const COMPTE = {
  /* Le compte est facultatif : tout le personnel n'a pas vocation à se
     connecter (agents de terrain, vacataires). */
  creer_compte: Joi.boolean().truthy(1).falsy(0),
  username: Joi.string().trim().min(3).max(50).allow('', null).messages({
    'string.min': "L'identifiant doit comporter au moins 3 caractères.",
    'string.max': "L'identifiant ne peut pas dépasser 50 caractères.",
  }),
  compte_email: Joi.string().trim().email().max(100).allow('', null)
    .messages({ 'string.email': "L'adresse email de connexion n'est pas valide." }),
  password: Joi.string().allow('', null),
  role_id: Joi.number().integer().positive().allow(null, ''),
  compte_actif: Joi.boolean().truthy(1).falsy(0),
};

export const createPersonnelSchema = Joi.object({
  ...IDENTITE,
  nom: IDENTITE.nom.required(),
  prenom: IDENTITE.prenom.required(),
  ...COMPTE,
}).unknown(true);

export const updatePersonnelSchema = Joi.object({
  ...IDENTITE,
  ...COMPTE,
}).unknown(true);

/** Réinitialisation d'un mot de passe par un administrateur. */
export const resetMotDePassePersonnelSchema = Joi.object({
  password: motDePasseFort.required(),
}).unknown(true);
