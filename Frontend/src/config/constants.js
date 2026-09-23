/**
 * Constantes partagées du frontend SRSP Fitovinany
 * Alignées sur le cahier des charges v2.0
 */

export const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const STATUTS = {
  RECU: 'RECU',
  ENREGISTRE: 'ENREGISTRE',
  ORIENTE: 'ORIENTE',
  AFFECTE: 'AFFECTE',
  EN_TRAITEMENT: 'EN_TRAITEMENT',
  SOUMIS_A_VERIFICATION: 'SOUMIS_A_VERIFICATION',
  CORRECTION_DEMANDEE: 'CORRECTION_DEMANDEE',
  VALIDE: 'VALIDE',
  SIGNE: 'SIGNE',
  CLOTURE: 'CLOTURE',
  ARCHIVE: 'ARCHIVE',
};

export const STATUT_LABELS = {
  RECU: 'Reçu',
  ENREGISTRE: 'Enregistré',
  ORIENTE: 'Orienté',
  AFFECTE: 'Affecté',
  EN_TRAITEMENT: 'En traitement',
  SOUMIS_A_VERIFICATION: 'Soumis à vérification',
  CORRECTION_DEMANDEE: 'Correction demandée',
  VALIDE: 'Validé',
  SIGNE: 'Signé',
  CLOTURE: 'Clôturé',
  ARCHIVE: 'Archivé',
};

export const STATUT_BADGE_CLASSES = {
  RECU: 'bg-slate-100 text-slate-700 border-slate-300',
  ENREGISTRE: 'bg-sky-100 text-sky-800 border-sky-300',
  ORIENTE: 'bg-cyan-100 text-cyan-800 border-cyan-300',
  AFFECTE: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  EN_TRAITEMENT: 'bg-amber-100 text-amber-800 border-amber-300',
  SOUMIS_A_VERIFICATION: 'bg-purple-100 text-purple-800 border-purple-300',
  CORRECTION_DEMANDEE: 'bg-rose-100 text-rose-800 border-rose-300',
  VALIDE: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  SIGNE: 'bg-teal-100 text-teal-800 border-teal-300',
  CLOTURE: 'bg-blue-100 text-blue-800 border-blue-300',
  ARCHIVE: 'bg-gray-200 text-gray-700 border-gray-400',
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

export const STATUTS_PROTEGES = ['CLOTURE', 'ARCHIVE'];

export const WORKFLOW_ORDER = [
  'RECU', 'ENREGISTRE', 'ORIENTE', 'AFFECTE', 'EN_TRAITEMENT',
  'SOUMIS_A_VERIFICATION', 'CORRECTION_DEMANDEE', 'VALIDE', 'SIGNE', 'CLOTURE', 'ARCHIVE',
];