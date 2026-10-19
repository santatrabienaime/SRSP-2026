import { STATUT_LABELS, STATUT_BADGE_CLASSES, PRIORITE_BADGE_CLASSES } from '../config/constants.js';

/** Libellé français d'un code de statut (avec repli sûr). */
export function formatStatus(status) {
  if (!status) return '—';
  return STATUT_LABELS[status] || status.replace(/_/g, ' ').toLowerCase();
}

/** Classes Tailwind pour le badge d'un statut. */
export function statusBadgeClass(status) {
  return STATUT_BADGE_CLASSES[status] || 'bg-slate-100 text-slate-700 border-slate-300';
}

/**
 * Classes Tailwind pour le badge d'une priorité.
 * `priorites.libelle` contient le niveau en clair (URGENTE, HAUTE, NORMALE,
 * BASSE) : la correspondance est donc directe.
 */
export function prioriteBadgeClass(priorite) {
  const cle = String(priorite || '').toUpperCase();
  return PRIORITE_BADGE_CLASSES[cle] || 'bg-slate-100 text-slate-600 border-slate-300';
}

