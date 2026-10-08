import { STATUT_LABELS, STATUT_BADGE_CLASSES } from '../config/constants.js';

/** Libellé français d'un code de statut (avec repli sûr). */
export function formatStatus(status) {
  if (!status) return '—';
  return STATUT_LABELS[status] || status.replace(/_/g, ' ').toLowerCase();
}

/** Classes Tailwind pour le badge d'un statut. */
export function statusBadgeClass(status) {
  return STATUT_BADGE_CLASSES[status] || 'bg-slate-100 text-slate-700 border-slate-300';
}

/** Badge prêt à l'emploi (chaîne JSX). */
export function StatusBadge() {
  // Éviter l'import circulaire : ce petit composant est aussi exporté par ui/Badge.
  return null;
}