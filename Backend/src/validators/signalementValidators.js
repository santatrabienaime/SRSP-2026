import Joi from 'joi';

/** Ouverture d'un signalement sur un dossier bloqué. */
export const creerSignalementSchema = Joi.object({
  type: Joi.string().valid('BLOCAGE', 'INTERLOCUTION', 'ARBITRAGE').default('BLOCAGE'),
  priorite: Joi.string().valid('NORMALE', 'HAUTE', 'CRITIQUE').default('NORMALE'),
  motif: Joi.string().trim().min(10).max(2000).required().messages({
    'string.min': 'Le motif du signalement doit être explicite (10 caractères minimum).',
    'any.required': 'Le motif du signalement est requis.',
    'string.empty': 'Le motif du signalement est requis.',
  }),
}).unknown(false);

/** Prise en charge : aucun corps n'est nécessaire, mais on accepte un commentaire. */
export const prendreSignalementSchema = Joi.object({
  commentaire: Joi.string().trim().allow('', null).max(1000),
}).unknown(true);

/** Résolution ou rejet : la décision écrite est obligatoire. */
export const resoudreSignalementSchema = Joi.object({
  statut: Joi.string().valid('RESOLU', 'REJETE').default('RESOLU'),
  resolution: Joi.string().trim().min(10).max(2000).required().messages({
    'string.min': 'La résolution doit être explicite (10 caractères minimum).',
    'any.required': 'La résolution est requise.',
    'string.empty': 'La résolution est requise.',
  }),
}).unknown(false);
