import Joi from 'joi';

/**
 * Validation des saisies de la Coordinatrice.
 *
 * Le motif du changement de paiement est obligatoire : c'est une décision qui
 * change où va l'argent d'un fonctionnaire, et une décision sans motif ne
 * peut être ni expliquée plus tard ni auditée.
 */

const CIN = Joi.string().trim().allow('', null).max(50).custom((v, h) => {
  if (!v) return v;
  const compact = String(v).replace(/[\s.-]/g, '');
  if (compact.length < 5 || compact.length > 20) return h.error('cin.invalide');
  if (!/^[A-Za-z0-9]+$/.test(compact)) return h.error('cin.invalide');
  return v;
}).messages({
  'cin.invalide': 'Le CIN doit comporter 5 à 20 caractères alphanumériques',
});

/* Les messages sont posés sur CHAQUE champ, à sa construction.
   Deux pièges évités :
   - un texte accentué passé à `.required()` est évalué dès le chargement du
     module et fait échouer le démarrage du serveur ;
   - le schéma renvoyé par Joi est figé : on ne peut pas le muter ensuite, il
     faut donc nommer les champs en understood dès le départ. */
const nomRequis = Joi.string().trim().required().min(2).max(100)
  .label('Le nom')
  .messages({
    'any.required': 'Le nom est requis',
    'string.empty': 'Le nom est requis',
    'string.min': 'Le nom doit comporter 2 caractères minimum',
    'string.max': 'Le nom est trop long',
  });

const prenomRequis = Joi.string().trim().required().min(2).max(100)
  .label('Le prénom')
  .messages({
    'any.required': 'Le prénom est requis',
    'string.empty': 'Le prénom est requis',
    'string.min': 'Le prénom doit comporter 2 caractères minimum',
    'string.max': 'Le prénom est trop long',
  });

export const immatriculationSchema = Joi.object({
  nom: nomRequis,
  prenom: prenomRequis,
  cin: CIN,
  date_naissance: Joi.date().iso().allow('', null),
  corps: Joi.string().trim().allow('', null).max(100),
  grade: Joi.string().trim().allow('', null).max(100),
  indice: Joi.number().integer().allow('', null),
  date_entree: Joi.date().iso().allow('', null),
  division_id: Joi.number().integer().allow('', null),
  statut: Joi.string().valid('EN_ATTENTE', 'ACTIVE', 'REJETEE').allow('', null),
  observations: Joi.string().allow('', null).max(2000),
}).unknown(false);

export const majImmatriculationSchema = immatriculationSchema.fork(
  ['nom', 'prenom'],
  (champ) => champ.optional()
).unknown(false);

export const augureSchema = Joi.object({
  immatriculation_id: Joi.number().integer().required().messages({
    'number.base': "L'immatriculation est requise",
  }),
  matricule_augure: Joi.string().trim().allow('', null).max(50),
  situation_familiale: Joi.string().trim().allow('', null).max(100),
  adresse: Joi.string().trim().allow('', null).max(255),
  telephone: Joi.string().trim().allow('', null).max(30)
    .label('Le téléphone')
    .pattern(/^[+0-9\s.-]{6,30}$/)
    .messages({ 'string.pattern.base': 'Téléphone : uniquement chiffres, espaces et + . -' }),
  date_naissance: Joi.date().iso().allow('', null),
  indice_base: Joi.number().integer().allow('', null),
  salaire_base: Joi.number().positive().allow('', null)
    .label('Le salaire de base')
    .messages({ 'number.positive': 'Le salaire de base doit être positif' }),
  statut: Joi.string().valid('A_INSERER', 'INSERE', 'REJETE').allow('', null),
  observations: Joi.string().allow('', null).max(2000),
}).unknown(false);

export const paiementSchema = Joi.object({
  immatriculation_id: Joi.number().integer().required().messages({
    'number.base': "L'immatriculation est requise",
  }),
  mode: Joi.string().valid('VIREMENT', 'CHEQUE', 'ESPECES', 'MANDAT')
    .label('Le mode de paiement')
    .required().messages({ 'any.only': 'Mode de paiement inconnu' }),
  banque: Joi.string().trim().allow('', null).max(100),
  compte_bancaire: Joi.string().trim().allow('', null).max(50)
    .label('Le numéro de compte')
    .custom((v, h) => {
      // Un virement sans compte n'a pas de sens : on le signale, mais la saisie
      // reste possible pour un changement vers espèces ou chèque.
      if (v && !/^[A-Za-z0-9 ./-]{6,50}$/.test(v)) return h.error('compte.invalide');
      return v;
    }).messages({ 'compte.invalide': 'Numéro de compte invalide' }),
  motif: Joi.string().trim().required().min(5).max(1000)
    .label('Le motif')
    .messages({
      'any.required': 'Le motif est requis',
      'string.empty': 'Le motif est requis',
      'string.min': 'Le motif doit comporter 5 caractères minimum',
    }),
  statut: Joi.string().valid('EN_ATTENTE', 'APPROUVE', 'REJETE').allow('', null),
}).unknown(false);

/**
 * Un virement exige banque et compte. On le vérifie ensemble, ce que Joi ne
 * sait pas faire champ par champ : sans cette règle, une demande de virement
 * sans compte passait la validation et echouait plus tard, a la banque.
 */
export function verifierCoherencePaiement(donnees) {
  if (donnees.mode === 'VIREMENT') {
    if (!donnees.compte_bancaire) {
      return 'Un virement exige un numéro de compte.';
    }
    if (!donnees.banque) {
      return 'Un virement exige le nom de la banque.';
    }
  }
  return null;
}
