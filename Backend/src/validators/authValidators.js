import Joi from 'joi';

/**
 * Politique de mot de passe (article 1.6 du rapport explicatif).
 *
 * Minimum huit caracteres, avec au moins une majuscule, une minuscule,
 * un chiffre et un caractere special. Le message est explicite afin que
 * l'utilisateur sache quoi corriger.
 */
export const MOT_DE_PASSE_MESSAGE =
  'Le mot de passe doit contenir au moins 8 caractères, dont une majuscule, ' +
  'une minuscule, un chiffre et un caractère spécial.';

const motDePasseFort = Joi.string()
  .min(8)
  .max(128)
  .pattern(/[A-ZÀ-Þ]/)
  .pattern(/[a-zà-ÿ]/)
  .pattern(/[0-9]/)
  .pattern(/[^A-Za-z0-9]/)
  .messages({
    'string.min': MOT_DE_PASSE_MESSAGE,
    'string.pattern.base': MOT_DE_PASSE_MESSAGE,
    'string.max': 'Le mot de passe ne peut pas dépasser 128 caractères.',
  });

/** Règle réutilisée par les schémas de gestion des utilisateurs. */
export { motDePasseFort };

export const loginSchema = Joi.object({
  identifiant: Joi.string().required(),
  password: Joi.string().required(),
});

export const changePasswordSchema = Joi.object({
  ancien_mot_de_passe: Joi.string().required(),
  nouveau_mot_de_passe: motDePasseFort.required(),
});

/**
 * Demande de réinitialisation.
 *
 * `identifiant` est le nom d'utilisateur ou l'e-mail. Le champ est volontairement
 * large : c'est le service qui décide si un compte correspond, et sa réponse
 * ne doit rien révéler.
 */
export const forgotPasswordSchema = Joi.object({
  identifiant: Joi.string().trim().max(255).required().messages({
    'any.required': "L'identifiant est requis",
    'string.empty': "L'identifiant est requis",
  }),
}).unknown(false);

/**
 * Consommation du code de réinitialisation.
 *
 * Le code est composé de six chiffres ; le message d'erreur ne distingue pas
 * un code faux d'un code expiré.
 */
export const resetPasswordSchema = Joi.object({
  identifiant: Joi.string().trim().max(255).required().messages({
    'any.required': "L'identifiant est requis",
    'string.empty': "L'identifiant est requis",
  }),
  code: Joi.string().trim().length(6).pattern(/^[0-9]{6}$/).required().messages({
    'any.required': 'Le code est requis',
    'string.length': 'Le code comporte six chiffres.',
    'string.pattern.base': 'Le code comporte six chiffres.',
  }),
  nouveau_mot_de_passe: motDePasseFort.required().messages({
    'any.required': 'Le nouveau mot de passe est requis',
  }),
}).unknown(false);

/** Motif de l'annulation d'une demande (administrateur). */
export const annulationDemandeSchema = Joi.object({
  motif: Joi.string().trim().allow('', null).max(500),
}).unknown(false);

/** Schéma de création de compte : applique la même politique. */
export const userPasswordSchema = Joi.object({
  password: motDePasseFort.required(),
});
