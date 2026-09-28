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

/** Schéma de création de compte : applique la même politique. */
export const userPasswordSchema = Joi.object({
  password: motDePasseFort.required(),
});
