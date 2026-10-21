/**
 * Constantes métier du SRSP Fitovinany
 * Conformes au cahier des charges v2.0 (§10, §7)
 */

export const STATUTS = {
  /* Brouillon : dossier saisi mais pas encore publié dans le circuit. Il
     n'est visible que de son auteur, et ne déclenche aucune notification. */
  BROUILLON: 'BROUILLON',
  RECU: 'RECU',
  ENREGISTRE: 'ENREGISTRE',
  ORIENTE: 'ORIENTE',
  AFFECTE: 'AFFECTE',
  EN_TRAITEMENT: 'EN_TRAITEMENT',
  EN_ATTENTE_COMPLEMENT: 'EN_ATTENTE_COMPLEMENT',
  SOUMIS_A_VERIFICATION: 'SOUMIS_A_VERIFICATION',
  CORRECTION_DEMANDEE: 'CORRECTION_DEMANDEE',
  VALIDE: 'VALIDE',
  SIGNE: 'SIGNE',
  CLOTURE: 'CLOTURE',
  ARCHIVE: 'ARCHIVE',
};

export const STATUTS_LIST = Object.values(STATUTS);

export const STATUTS_LABELS = {
  BROUILLON: 'Brouillon',
  RECU: 'Reçu',
  ENREGISTRE: 'Enregistré',
  ORIENTE: 'Orienté',
  AFFECTE: 'Affecté',
  EN_TRAITEMENT: 'En traitement',
  EN_ATTENTE_COMPLEMENT: 'En attente de complément',
  SOUMIS_A_VERIFICATION: 'Soumis au Chef de Division',
  CORRECTION_DEMANDEE: 'Correction demandée',
  VALIDE: 'Validé',
  SIGNE: 'Signé',
  CLOTURE: 'Clôturé',
  ARCHIVE: 'Archivé',
};

export const TYPES_DOSSIERS = {
  VISA: 'VISA',
  SOLDE: 'SOLDE',
  PENSION: 'PENSION',
  SECOURS: 'SECOURS',
};

export const PRIORITES = {
  URGENTE: 'URGENTE',
  HAUTE: 'HAUTE',
  NORMALE: 'NORMALE',
  BASSE: 'BASSE',
};

/** Rôles (postes) du SRSP */
export const ROLES = {
  ADMIN: 'ADMIN',
  CHEF_SERVICE: 'CHEF_SERVICE',
  CHEF_BAAF: 'CHEF_BAAF',
  COORDINATRICE: 'COORDINATRICE',
  SECRETAIRE: 'SECRETAIRE',
  CHEF_DIVISION_VISA: 'CHEF_DIVISION_VISA',
  VERIFICATEUR_VISA: 'VERIFICATEUR_VISA',
  CHEF_DIVISION_SOLDE: 'CHEF_DIVISION_SOLDE',
  VERIFICATEUR_SOLDE: 'VERIFICATEUR_SOLDE',
  CHEF_DIVISION_PENSION: 'CHEF_DIVISION_PENSION',
  LIQUIDATEUR_PENSION: 'LIQUIDATEUR_PENSION',
  CHEF_DIVISION_SECOURS: 'CHEF_DIVISION_SECOURS',
  CHARGE_SECOURS: 'CHARGE_SECOURS',
};

/** Correspondance division -> rôle du chef de division */
export const DIVISION_CHEF_ROLE = {
  VISAS: 'CHEF_DIVISION_VISA',
  SOLDE: 'CHEF_DIVISION_SOLDE',
  PENSIONS: 'CHEF_DIVISION_PENSION',
  SECOURS: 'CHEF_DIVISION_SECOURS',
};

/** Statuts protégés (aucune modification ordinaire) */
export const STATUTS_PROTEGES = ['CLOTURE', 'ARCHIVE'];

/**
 * Un brouillon n'est pas dans le circuit : il ne déclenche aucune notification,
 * il n'apparaît dans aucune file d'attente, et seul son auteur le voit.
 */
export const STATUT_BROUILLON = 'BROUILLON';

/**
 * États d'une pièce au dépouillement.
 *
 * « Présente » n'est pas le seul état utile : une pièce illisible ou à corriger
 * reste à traiter, et la confondre avec une pièce présente ferait valider un
 * dossier incomplet. « Manquante » est l'état par défaut : une pièce non
 * contrôlée n'est pas une pièce reçue.
 */
export const ETATS_PIECE = {
  PRESENTE: 'PRESENTE',
  MANQUANTE: 'MANQUANTE',
  ILLISIBLE: 'ILLISIBLE',
  A_CORRIGER: 'A_CORRIGER',
  /* Une pièce qui ne s'applique pas à ce dossier — un acte de mariage pour
     un dossier de décès de décès, par exemple. Elle n'a pas été demandée :
     elle ne doit donc pas être traitée comme une pièce manquante, ni
     bloquer la validation. */
  NON_APPLICABLE: 'NON_APPLICABLE',
};

export const ETATS_PIECE_LIST = Object.values(ETATS_PIECE);

export const ETATS_PIECE_LABELS = {
  PRESENTE: 'Présente',
  MANQUANTE: 'Manquante',
  ILLISIBLE: 'Illisible',
  A_CORRIGER: 'À corriger',
  NON_APPLICABLE: 'Non applicable',
};

/**
 * États qui satisfont une pièce obligatoire.
 *
 * « Présente » satisfait parce que la pièce a été fournie. « Non
 * applicable » satisfait aussi : la pièce n'avait pas à être fournie, et la
 * traiter comme manquante bloquerait un dossier à tort.
 */
export const ETATS_PIECE_VALIDES = [ETATS_PIECE.PRESENTE, ETATS_PIECE.NON_APPLICABLE];

/** États qui demandent un motif : ceux qui restent à traiter. */
export const ETATS_PIECE_A_MOTIVER = [ETATS_PIECE.MANQUANTE, ETATS_PIECE.ILLISIBLE, ETATS_PIECE.A_CORRIGER];
