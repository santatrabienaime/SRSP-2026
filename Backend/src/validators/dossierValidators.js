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

/** CIN malgache : exactement 12 chiffres, une fois les séparateurs retirés. */
export const CIN_MALGACHE = /^\d{12}$/;

/**
 * Carte de non-inscription : une lettre suivie de chiffres (MAT-1234).
 *
 * La forme est volontairement contrainte. Un motif « 4 à 20 caractères
 * alphanumériques » acceptait un CIN malgache tronqué à 11 chiffres, puisque
 * 11 chiffres rentrent dans cette plage : la saisie d'un chiffre manquant
 * passait au lieu d'être signalée. Le service ne délivre pas de numéro de
 * 5 chiffres.
 */
export const CIN_NON_INSCRIPTION = /^[A-Z]{1,4}\d{2,10}$/i;

/** Normalise un CIN pour comparaison : sans séparateur, en majuscules. */
export function normaliserCIN(valeur) {
  if (valeur === null || valeur === undefined) return null;
  const compact = String(valeur).replace(/[\s.-]/g, '').toUpperCase();
  return compact === '' ? null : compact;
}

/**
 * Le CIN est-il conforme à l'un des deux formats que le service connaît ?
 *
 * Vide est accepté : le CIN est facultatif, et un dossier sans CIN est
 * légitime. Un CIN non conforme ne l'est jamais — c'est la seule façon d'éviter
 * d'accrocher une personne à un dossier portant le numéro d'une autre.
 */
export function cinValide(valeur) {
  if (valeur === null || valeur === undefined || String(valeur).trim() === '') return true;
  const compact = normaliserCIN(valeur);
  return CIN_MALGACHE.test(compact) || CIN_NON_INSCRIPTION.test(compact);
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
    'cin.invalide': 'Le CIN doit contenir 12 chiffres (ex. 101 234 567 890), ou un matricule de non-inscription (ex. MAT-1234)',
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
  )).messages({ 'cin.invalide': 'Le CIN doit contenir 12 chiffres, ou un matricule de non-inscription' }),
  division_id: Joi.number().integer().allow(null, ''),
  priorite_id: Joi.number().integer().required(),
  observation: Joi.string().allow('', null),
  // Règle 3 : motif obligatoire pour une dérogation de division.
  motif_changement_division: Joi.string().allow('', null),
}).unknown(true);
