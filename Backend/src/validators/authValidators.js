import Joi from 'joi';

export const loginSchema = Joi.object({
  identifiant: Joi.string().required(),
  password: Joi.string().required(),
});

export const changePasswordSchema = Joi.object({
  ancien_mot_de_passe: Joi.string().required(),
  nouveau_mot_de_passe: Joi.string().min(8).required(),
});