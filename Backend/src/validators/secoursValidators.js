import Joi from 'joi';

/**
 * Validation des étapes propres à la Division Secours.
 *
 * Messages posés à la construction : un texte accentué passé à `.required()`
 * fait échouer le chargement du module, et le serveur ne démarre plus.
 * Le schéma est figé, il faut donc nommer les champs dès maintenant.
 */

const DATE = Joi.string()
  .pattern(/^\d{4}-\d{2}-\d{2}$/)
  .required()
  .label('La date')
  .messages({
    'any.required': 'La date est requise',
    'string.pattern.base': 'La date doit être au format AAAA-MM-JJ',
  });

/** Visa du contrôle financier (1.1). */
export const visaSchema = Joi.object({
  numero_visa: Joi.string().trim().required().min(3).max(100)
    .label('Le numéro de visa')
    .messages({
      'any.required': 'Le numéro de visa est requis',
      'string.empty': 'Le numéro de visa est requis',
      'string.min': 'Le numéro de visa doit comporter 3 caractères minimum',
    }),

  /* La signature du CF n'est pas obligatoire : un visa peut être enregistré le
     jour même où le CF l'a apposée, avant que le nom du signataire ne soit
     recopié. Mais l'écran de réception signale son absence, plutôt que de la
     laisser passer inaperçue. */
  signe_par: Joi.string().trim().allow('', null).max(150),
  date_visa: DATE,
  commentaire: Joi.string().trim().allow('', null).max(1000),
}).unknown(false);

/** Apposition du cachet (2.4). */
export const cachetSchema = Joi.object({
  date_cachet: DATE,

  /* Titre et nom sont obligatoires : une pièce portant un simple cachet rond
     n'indique pas qui a ordonné la dépense, et c'est l'identification même que
     le document demande d'inscrire sur la pièce. */
  titre_ordonnateur: Joi.string().trim().required().min(2).max(200)
    .label('Le titre de l’ordonnateur')
    .messages({
      'any.required': 'Le titre de l’ordonnateur est requis',
      'string.empty': 'Le titre de l’ordonnateur est requis',
      'string.min': 'Le titre doit comporter 2 caractères minimum',
    }),

  nom_ordonnateur: Joi.string().trim().required().min(2).max(150)
    .label('Le nom de l’ordonnateur')
    .messages({
      'any.required': 'Le nom de l’ordonnateur est requis',
      'string.empty': 'Le nom de l’ordonnateur est requis',
      'string.min': 'Le nom doit comporter 2 caractères minimum',
    }),

  observations: Joi.string().trim().allow('', null).max(500),
}).unknown(false);

/** Signature des pièces par l'ordonnateur (1.7). */
export const signatureSchema = Joi.object({
  reference_signature: Joi.string().trim().required().min(5).max(100)
    .label('La référence de signature')
    .messages({
      'any.required': 'La référence de signature est requise',
      'string.empty': 'La référence de signature est requise',
      'string.min': 'La référence doit comporter 5 caractères minimum',
    }),
  observations: Joi.string().trim().allow('', null).max(1000),
}).unknown(false);

/** Signature d'un bénéficiaire sur l'état d'émargement. */
export const emargementSchema = Joi.object({
  signataire: Joi.string().trim().required().min(2).max(200)
    .label('Le signataire')
    .messages({
      'any.required': 'Le nom du signataire est requis',
      'string.empty': 'Le nom du signataire est requis',
      'string.min': 'Le nom doit comporter 2 caractères minimum',
    }),
  /* La date est obligatoire : un émargement sans date ne prouve pas que la
     somme a été remise le jour où l'on soutient qu'elle l'a été. */
  signe_le: DATE,
  observation: Joi.string().trim().allow('', null).max(500),
}).unknown(false);
