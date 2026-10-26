/**
 * Constantes partagées du frontend SRSP Fitovinany
 * Alignées sur le cahier des charges v2.0
 */

export const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const STATUTS = {
  /* Brouillon : dossier saisi mais pas encore publié. Il n'est visible que
     de son auteur et n'entre pas dans le circuit. */
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

export const STATUT_LABELS = {
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

export const STATUT_BADGE_CLASSES = {
  BROUILLON: 'border-slate-300 bg-slate-100 text-slate-600',
  RECU: 'bg-slate-100 text-slate-700 border-slate-300',
  ENREGISTRE: 'bg-sky-100 text-sky-800 border-sky-300',
  ORIENTE: 'bg-cyan-100 text-cyan-800 border-cyan-300',
  AFFECTE: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  EN_TRAITEMENT: 'bg-amber-100 text-amber-800 border-amber-300',
  EN_ATTENTE_COMPLEMENT: 'bg-orange-100 text-orange-800 border-orange-300',
  SOUMIS_A_VERIFICATION: 'bg-purple-100 text-purple-800 border-purple-300',
  CORRECTION_DEMANDEE: 'bg-rose-100 text-rose-800 border-rose-300',
  VALIDE: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  SIGNE: 'bg-teal-100 text-teal-800 border-teal-300',
  CLOTURE: 'bg-blue-100 text-blue-800 border-blue-300',
  ARCHIVE: 'bg-gray-200 text-gray-700 border-gray-400',
};

/* Statuts d'un courrier (module « Courriers », CDC §14.1).
   Le libellé est présenté à l'utilisateur ; le code part au serveur. */
export const COURRIER_STATUTS = {
  RECU: 'Reçu',
  TRANSMIS: 'Transmis',
  TRAITE: 'Traité',
  CLASSE: 'Classé',
};

export const TYPES_DOSSIERS = {
  VISA: { code: 'VISA', label: 'Visa' },
  SOLDE: { code: 'SOLDE', label: 'Solde' },
  PENSION: { code: 'PENSION', label: 'Pension' },
  SECOURS: { code: 'SECOURS', label: 'Secours' },
};

export const PRIORITES = {
  URGENTE: { label: 'Urgente', level: 4 },
  HAUTE: { label: 'Haute', level: 3 },
  NORMALE: { label: 'Normale', level: 2 },
  BASSE: { label: 'Basse', level: 1 },
};

export const PRIORITE_BADGE_CLASSES = {
  URGENTE: 'bg-red-100 text-red-800 border-red-300',
  HAUTE: 'bg-orange-100 text-orange-800 border-orange-300',
  NORMALE: 'bg-blue-100 text-blue-800 border-blue-300',
  BASSE: 'bg-slate-100 text-slate-600 border-slate-300',
};

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

export const ROLE_LABELS = {
  ADMIN: 'Administrateur',
  CHEF_SERVICE: 'Chef de Service',
  CHEF_BAAF: 'Chef BAAF',
  COORDINATRICE: 'Coordonnatrice',
  SECRETAIRE: 'Secrétaire',
  CHEF_DIVISION_VISA: 'Chef Division Visa',
  VERIFICATEUR_VISA: 'Vérificateur Visa',
  CHEF_DIVISION_SOLDE: 'Chef Division Solde',
  VERIFICATEUR_SOLDE: 'Vérificateur Solde',
  CHEF_DIVISION_PENSION: 'Chef Division Pension',
  LIQUIDATEUR_PENSION: 'Liquidateur Pension',
  CHEF_DIVISION_SECOURS: 'Chef Division Secours',
  CHARGE_SECOURS: 'Chargé Secours',
};
export const WORKFLOW_ORDER = [
  'BROUILLON', 'RECU', 'ENREGISTRE', 'ORIENTE', 'AFFECTE', 'EN_TRAITEMENT',
  'EN_ATTENTE_COMPLEMENT', 'SOUMIS_A_VERIFICATION', 'CORRECTION_DEMANDEE',
  'VALIDE', 'SIGNE', 'CLOTURE', 'ARCHIVE',
];

/* États d'une pièce au dépouillement.
   « Présente » satisfait une pièce obligatoire ; « non applicable » la
   satisfait aussi, car elle n'avait pas à être fournie. « Absente » et
   « Rejetée » restent à traiter et doivent être motivées : le motif dit à
   l'agent ce qu'il doit rapporter ou corriger.

   `MANQUANTE` reste le code historique de l'absence : le libellé affiché est
   « Absente ». Les états `ILLISIBLE` et `A_CORRIGER` restent lus pour les
   dossiers déjà contrôlés, mais ne sont plus proposés : les boutons de
   contrôle sont Présente / Absente / Rejetée / Non applicable. */
export const ETATS_PIECE = {
  PRESENTE: 'PRESENTE',
  MANQUANTE: 'MANQUANTE',
  REJETEE: 'REJETEE',
  ILLISIBLE: 'ILLISIBLE',
  A_CORRIGER: 'A_CORRIGER',
  NON_APPLICABLE: 'NON_APPLICABLE',
};

export const ETATS_PIECE_LABELS = {
  PRESENTE: 'Présente',
  MANQUANTE: 'Absente',
  REJETEE: 'Rejetée',
  ILLISIBLE: 'Illisible',
  A_CORRIGER: 'À corriger',
  NON_APPLICABLE: 'Non applicable',
};

export const ETATS_PIECE_BADGES = {
  PRESENTE: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  MANQUANTE: 'border-red-200 bg-red-50 text-red-700',
  REJETEE: 'border-rose-300 bg-rose-50 text-rose-700',
  ILLISIBLE: 'border-amber-200 bg-amber-50 text-amber-700',
  A_CORRIGER: 'border-orange-200 bg-orange-50 text-orange-700',
  NON_APPLICABLE: 'border-slate-200 bg-slate-50 text-slate-600',
};

/* Seuls ces états demandent un motif : ceux qui restent à traiter. */
export const ETATS_PIECE_A_MOTIVER = ['MANQUANTE', 'REJETEE', 'ILLISIBLE', 'A_CORRIGER'];

/* ── Données d'opération ───────────────────────────────────────────────
   Les divisions Solde, Pensions et Secours portent, sur chacun de leurs
   dossiers, des données propres à l'opération : la référence, la période, le
   montant et sa source. Le type d'opération n'est pas choisi par l'agent : il
   est repris du dossier, pour que la donnée et le dossier ne puissent pas
   diverger. */

export const TYPES_OPERATION = {
  SOLDE: 'Solde',
  PENSION: 'Pension',
  SECOURS: 'Secours',
  VISA: 'Visa',
};

/* Décisions du contrôle de l'opération. Le contrôle est l'acte du chef de
   division : sa décision, et elle seule, fait foi sur la saisie de l'agent. */
export const DECISIONS_CONTROLE_OPERATION = {
  APPROUVE: 'Approuvé',
  RETOURNE: 'Retourné pour correction',
  A_COMPLETER: 'À compléter',
};

/* ── Correspondances ───────────────────────────────────────────────────
   Une correspondance est une lettre ou une notification : le type dit de
   quoi elle est faite, l'état dit si elle est partie ou encore en
   préparation. Le code part au serveur, le libellé est lu par l'agent. */
export const TYPES_CORRESPONDANCE = {
  LETTRE_PRESCRIPTION: 'Lettre de prescription',
  DEMANDE_DOSSIERE_MERE: 'Demande de dossier mère',
  OPPOSITION_PENSION_ALIMENTAIRE: 'Opposition (pension alimentaire)',
  OPPOSITION_CESSION_VOLONTAIRE: 'Opposition (cession volontaire)',
  OPPOSITION_SAISIE_ARRET: 'Opposition (saisie arrêt)',
};

export const ETATS_CORRESPONDANCE = {
  BROUILLON: 'Brouillon',
  ENVOYEE: 'Envoyée',
};

/* États de la réponse attendue et de la réception au niveau central.
   Le serveur conserve ces états en texte libre : les libellés ci-dessous
   sont ceux que l'écran propose ; un état inconnu est affiché tel quel
   plutôt que masqué, pour que rien ne disparaisse du dossier. */
export const ETATS_REPONSE_CORRESPONDANCE = {
  EN_ATTENTE: 'En attente de réponse',
  ACCUSEE: 'Accusée de réception',
  REPARTIE: 'Suite donnée',
  SANS_REPONSE: 'Sans réponse',
};

export const ETATS_RECEPTION_CENTRALE = {
  NON_TRANSMISE: 'Non transmise au central',
  TRANSMISE: 'Transmise au central',
  RECU: 'Reçue au central',
  REJETEE: 'Rejetée par le central',
};