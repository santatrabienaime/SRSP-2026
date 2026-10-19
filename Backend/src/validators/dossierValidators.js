import Joi from 'joi';

/**
 * Validation de la création d'un dossier.
 *
 * Les contrôles « bloquants » du document sont ici. L'unicité du matricule est
 * volontairement ABSENTE : elle n'interdit pas, elle prévient (voir
 * `rechercherParMatricule` dans le service). Un client revient legitimement — un
 * dossier de visa, puis un de solde, puis une pension — et le document lui-même
 * propose « Non, modifier » face à un matricule déjà connu. Bloquer serait une
 * faute.
 *
 * La règle de longueur du matricule n'est pas non plus vérifiée ici : elle
 * souffre une exception que seul le service peut trancher, car il consulte la
 * base (un numéro déjà enregistré reste acceptable — voir `verifierMatricule`).
 */

/** Longueur minimale et maximale d'un matricule, séparateurs exclus. */
export const MATRICULE_LONGUEUR_MIN = 2;
export const MATRICULE_LONGUEUR_MAX = 10;

/**
 * Un matricule respecte-t-il la règle du service ?
 *
 * Le demandeur est identifié par son numéro de matricule : 2 à 10 caractères
 * alphanumériques. Ce numéro est saisi tantôt avec espaces, tantôt sans : c'est
 * la forme compactée qui est jugée.
 *
 * Un format atypique est signalé par l'interface, jamais refusé par la base —
 * sauf ici, où la longueur est une règle de service : la borne haute empêche de
 * confondre un matricule avec un numéro de dossier ou une référence.
 */
export function matriculeValide(valeur) {
  if (valeur === null || valeur === undefined || String(valeur).trim() === '') return true;
  const compact = normaliserMatricule(valeur);
  if (!compact) return true;
  if (compact.length < MATRICULE_LONGUEUR_MIN || compact.length > MATRICULE_LONGUEUR_MAX) return false;
  return /^[A-Z0-9]+$/.test(compact);
}

/** Le matricule ne contient-il que des caractères d'identification ? */
export function matriculeCaracteresValides(valeur) {
  const compact = normaliserMatricule(valeur);
  return !compact || /^[A-Z0-9]+$/.test(compact);
}

/** Normalise un matricule pour comparaison : sans séparateur, en majuscules. */
export function normaliserMatricule(valeur) {
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
  // Règle du matricule (2 à 10 caractères) vérifiée par le service, seul à
  // pouvoir tolérer un numéro déjà enregistré avant la règle (voir
  // `verifierMatricule`). Ici, seule la taille de stockage est bornée.
  matricule: Joi.string().trim().allow('', null).max(50),
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
  // Voir `verifierMatricule` : la règle de longueur et son exception y vivent.
  matricule: Joi.string().trim().allow('', null).max(50),
  division_id: Joi.number().integer().allow(null, ''),
  priorite_id: Joi.number().integer().required(),
  observation: Joi.string().allow('', null),
  // Règle 3 : motif obligatoire pour une dérogation de division.
  motif_changement_division: Joi.string().allow('', null),
}).unknown(true);
