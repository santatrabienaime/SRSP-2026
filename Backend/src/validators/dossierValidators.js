import Joi from 'joi';

/**
 * Validation de la création d'un dossier.
 *
 * Les contrôles « bloquants » du document sont ici. Le contrôle du CIN est
 * volontairement ABSENT de ce fichier : il n'interdit pas, il prévient (voir
 * `uniciteCIN` dans le service). Un client revient legitimement — un dossier de
 * visa, puis un de solde, puis une pension — et le document lui-même propose
 * « Non, modifier » face à un CIN déjà connu. Bloquer serait une faute.
 */

/** Longueur minimale et maximale d'un matricule, séparateurs exclus. */
export const CIN_LONGUEUR_MIN = 5;
export const CIN_LONGUEUR_MAX = 20;

/**
 * Un matricule est-il recevable ?
 *
 * L'administration malgache délivre des CIN de longueurs diverses : la base en
 * contient de 5, 6, 8 et 12 chiffres, ainsi que des cartes de non-inscription
 * alphanumériques. Exiger 12 chiffres exacts revenait à refuser une pièce
 * d'identité parfaitement officielle — et, pire, à rendre IMPOSSIBLE la
 * modification d'un dossier existant dont le matricule fait 6 chiffres : la
 * secrétaire ne pouvait plus corriger un dossier réel sans changer le numéro du
 * demandeur.
 *
 * On exige donc seulement des caractères d'identification plausibles. Un format
 * atypique est signalé par l'interface, jamais refusé par la base.
 */
export function cinValide(valeur) {
  if (valeur === null || valeur === undefined || String(valeur).trim() === '') return true;
  const compact = normaliserCIN(valeur);
  if (!compact) return true;
  if (compact.length < CIN_LONGUEUR_MIN || compact.length > CIN_LONGUEUR_MAX) return false;
  return /^[A-Z0-9]+$/.test(compact);
}

/** Normalise un CIN pour comparaison : sans séparateur, en majuscules. */
export function normaliserCIN(valeur) {
  if (valeur === null || valeur === undefined) return null;
  const compact = String(valeur).replace(/[\s.-]/g, '').toUpperCase();
  return compact === '' ? null : compact;
}

/** Un nom ou un prénom trop court ne permet aucune exploitation. */
const nomCourt = (libelle) => Joi.string()
  .trim()
  .required()
  .min(2, `${libelle} : 2 caractères minimum`)
  .max(libelle === 'Nom' ? 100 : 100, `${libelle} trop long`);

export const createDossierSchema = Joi.object({
  type_id: Joi.number().integer().required().messages({
    'number.base': 'Le type de dossier est requis',
  }),
  objet: Joi.string().trim().required().max(500).messages({
    'any.required': "L'objet est requis",
    'string.empty': "L'objet est requis",
  }),
  // `demandeur` reste la valeur d'affichage (« NOM Prénom »). Les colonnes
  // séparées sont facultatives et servent au filtrage et à la recherche.
  demandeur: Joi.string().trim().required().max(150).messages({
    'any.required': 'Le nom du demandeur est requis',
    'string.empty': 'Le nom du demandeur est requis',
  }),
  demandeur_nom: Joi.string().trim().allow('', null).max(100),
  demandeur_prenom: Joi.string().trim().allow('', null).max(100),
  demandeur_tel: Joi.string().trim().allow('', null).max(30)
    .pattern(/^[+0-9\s.-]{6,30}$/, 'Téléphone : chiffres, espaces, + . - uniquement'),
  demandeur_email: Joi.string().trim().allow('', null).max(150)
    .email(),
  demandeur_adresse: Joi.string().trim().allow('', null).max(255),
  matricule: Joi.string().trim().allow('', null).max(50).custom((valeur, helpers) => {
    if (!cinValide(valeur)) {
      return helpers.error('cin.invalide');
    }
    return valeur;
  }).messages({
    'cin.invalide': 'Le CIN doit comporter 5 à 20 caractères alphanumériques (ex. 101 234 567 890)',
  }),
  date_reception: Joi.date().iso().required().messages({
    'any.required': 'La date de réception est requise',
  }),
  // Routage automatique : la division est déduite du type de dossier.
  // Si elle est transmise, le serveur vérifie qu'elle correspond au type.
  division_id: Joi.number().integer().allow(null, ''),
  priorite_id: Joi.number().integer().required().messages({
    'any.required': 'La priorité est requise',
  }),
  observation: Joi.string().allow('', null).max(2000),
  date_limite: Joi.date().iso().allow('', null)
    .when('date_reception', {
      // La date limite n'a de sens que par rapport à la date de réception :
      // une échéance antérieure à la réception du dossier est une erreur de
      // saisie, pas un dossier urgent.
      is: Joi.date().required(),
      then: Joi.date().iso().min(Joi.ref('date_reception'))
        .messages({ 'date.min': 'La date limite ne peut pas précéder la date de réception' }),
    }),
})
  .messages({
    'object.unknown': 'Champ non reconnu dans la création d\'un dossier',
  })
  .unknown(false);

export const updateDossierSchema = Joi.object({
  type_id: Joi.number().integer().required(),
  objet: Joi.string().trim().required(),
  demandeur: Joi.string().trim().required(),
  demandeur_nom: Joi.string().trim().allow('', null).max(100),
  demandeur_prenom: Joi.string().trim().allow('', null).max(100),
  demandeur_tel: Joi.string().trim().allow('', null).max(30),
  demandeur_email: Joi.string().trim().allow('', null).max(150)
    .email(),
  demandeur_adresse: Joi.string().trim().allow('', null).max(255),
  matricule: Joi.string().trim().allow('', null).max(50).custom((valeur, helpers) => (
    cinValide(valeur) ? valeur : helpers.error('cin.invalide')
  )).messages({ 'cin.invalide': 'Le CIN doit comporter 5 à 20 caractères alphanumériques' }),
  division_id: Joi.number().integer().allow(null, ''),
  priorite_id: Joi.number().integer().required(),
  observation: Joi.string().allow('', null),
  // Règle 3 : motif obligatoire pour une dérogation de division.
  motif_changement_division: Joi.string().allow('', null),
}).unknown(true);
