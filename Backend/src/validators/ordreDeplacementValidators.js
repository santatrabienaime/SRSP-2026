import Joi from 'joi';

/**
 * Validation des pièces de déplacement du Chef BAAF (3.9).
 *
 * Les messages sont posés sur chaque champ À SA CONSTRUCTION : un texte accentué
 * passé à `.required()` est évalué au chargement du module et fait échouer le
 * démarrage du serveur. Le schéma renvoyé par Joi est par ailleurs figé, on ne
 * peut donc pas le compléter après coup.
 */

const DATE = Joi.string()
  .pattern(/^\d{4}-\d{2}-\d{2}$/)
  .required()
  .label('La date')
  .messages({
    'any.required': 'La date est requise',
    'string.pattern.base': 'La date doit être au format AAAA-MM-JJ',
  });

const MONTANT = Joi.number().min(0).max(999999999999.99).precision(2)
  .allow(null, '')
  .label('Le montant')
  .messages({
    'number.min': 'Le montant ne peut pas être négatif',
    'number.base': 'Le montant doit être un nombre',
  });

export const ordreSchema = Joi.object({
  type_id: Joi.number().integer().required()
    .label('Le type de pièce')
    .messages({
      'any.required': 'Le type de pièce est requis',
      'number.base': 'Le type de pièce est invalide',
    }),

  /* Un ordre sans dossier ne pourrait être ni vérifié ni rattaché au service
     qui l'a demandé. La colonne est NOT NULL en base : on ne l'accepte donc pas
     ici, plutôt que de laisser l'insertion échouer plus loin. */
  dossier_id: Joi.number().integer().required()
    .label('Le dossier')
    .messages({
      'any.required': 'Le dossier est requis',
      'number.base': 'Le dossier est invalide',
    }),

  agent_id: Joi.number().integer().required()
    .label('L’agent')
    .messages({
      'any.required': 'L’agent est requis',
      'number.base': 'L’agent est invalide',
    }),

  lieu_depart: Joi.string().trim().required().min(2).max(200)
    .label('Le lieu de départ')
    .messages({
      'any.required': 'Le lieu de départ est requis',
      'string.empty': 'Le lieu de départ est requis',
      'string.min': 'Le lieu de départ doit comporter 2 caractères minimum',
    }),

  lieu_destination: Joi.string().trim().required().min(2).max(200)
    .label('La destination')
    .messages({
      'any.required': 'La destination est requise',
      'string.empty': 'La destination est requise',
      'string.min': 'La destination doit comporter 2 caractères minimum',
    }),

  date_depart: DATE,
  date_retour: DATE,

  objet: Joi.string().trim().required().min(5).max(500)
    .label('L’objet')
    .messages({
      'any.required': 'L’objet de la mission est requis',
      'string.empty': 'L’objet de la mission est requis',
      'string.min': 'L’objet doit comporter 5 caractères minimum',
    }),

  observations: Joi.string().trim().allow('').max(2000),
  montant_avance: MONTANT,
}).unknown(false);

/** Passage d'un ordre à l'étape suivante du circuit. */
export const transitionSchema = Joi.object({
  statut: Joi.string().valid('SOUMIS', 'SIGNE', 'EXECUTEE', 'CLOTUREE', 'REJETEE')
    .required()
    .label('Le statut')
    .messages({
      'any.required': 'Le statut est requis',
      'any.only': 'Transition non autorisée',
    }),

  /* La référence de signature n'est exigée qu'au passage à SIGNE. Elle est
     declared ici pour que le corps soit accepté, et son caractère obligatoire
     est vérifié par le modèle, qui sait à quel moment on signe. */
  reference_signature: Joi.string().trim().allow('', null).max(100),

  montant_reel: MONTANT,
  motif_cloture: Joi.string().trim().allow('', null).max(500),
  observations: Joi.string().trim().allow('', null).max(2000),
}).unknown(false);

/** Annulation d'un ordre non signé. Le motif est obligatoire. */
export const annulationSchema = Joi.object({
  motif: Joi.string().trim().required().min(5).max(500)
    .label('Le motif')
    .messages({
      'any.required': "Le motif de l'annulation est requis",
      'string.empty': "Le motif de l'annulation est requis",
      'string.min': 'Le motif doit comporter 5 caractères minimum',
    }),
}).unknown(false);

/**
 * Cohérence des dates et du circuit.
 *
 * Joi valide champ par champ ; la comparaison entre la date de retour et la
 * date de départ ne peut pas s'y exprimer. Elle est vérifiée ici et, de nouveau,
 * par une contrainte CHECK en base : une saisie par script ou par import ne
 * passe pas par le formulaire.
 */
export function verifierCoherenceOrdre(donnees) {
  if (donnees.date_depart && donnees.date_retour) {
    if (donnees.date_retour < donnees.date_depart) {
      return 'La date de retour ne peut pas précéder la date de départ.';
    }
  }
  return null;
}
