/**
 * Libellés métier des types d'actions.
 *
 * Les codes en base sont techniques (VALIDATION, CHANGEMENT_STATUT). Les
 * afficher tels quels dans un journal d'audit serait illisible pour un lecteur ;
 * les traduire ici évite de le faire — et de le faire diverger — à chaque écran.
 */

export const LIBELLES_ACTIONS = {
  CREATION_DOSSIER: 'Création du dossier',
  ENREGISTREMENT: 'Enregistrement',
  MODIFICATION_DOSSIER: 'Modification du dossier',
  ORIENTATION: 'Orientation',
  AFFECTATION: 'Affectation',
  TRANSFERT: 'Transfert',
  TRAITEMENT: 'Traitement',
  SOUMISSION_VERIFICATION: 'Soumission à vérification',
  CORRECTION_DEMANDEE: 'Correction demandée',
  CORRECTION_EFFECTUEE: 'Correction effectuée',
  VERIFICATION: 'Vérification',
  CONTROL_APPROUVE: 'Contrôle approuvé',
  VALIDATION: 'Validation',
  SIGNATURE: 'Signature',
  CLOTURE: 'Clôture',
  ARCHIVAGE: 'Archivage',
  RESTAURATION_ARCHIVE: 'Restauration depuis les archives',
  LIQUIDATION_PENSION: 'Liquidation de pension',
  DECOMPTE_AVANCE: 'Décompte d\'avance',
  UPLOAD_DOCUMENT: 'Dépôt d\'un document',
  CHANGEMENT_STATUT: 'Changement de statut',
  CREATION_COURRIER: 'Création d\'un courrier',
  CORRESPONDANCE: 'Correspondance',
  CONNEXION: 'Connexion',
  CONNEXION_ECHOUEE: 'Tentative de connexion refusée',
  SAUVEGARDE_DB: 'Sauvegarde de la base',
};

/** Renvoie le libellé, ou le code brut si l'action n'est pas encore connue. */
export function libelleAction(action) {
  return LIBELLES_ACTIONS[action] || action;
}
