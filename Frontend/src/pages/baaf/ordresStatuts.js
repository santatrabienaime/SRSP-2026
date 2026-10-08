/**
 * Statuts des pièces de déplacement (§3.9) : libellés affichés et couleurs
 * de badge. Partagés par l'écran d'établissement (OrdresDeplacementPage)
 * et le tableau de bord du Chef BAAF — deux écrans, un seul jeu de couleurs.
 */

export const LIBELLES_STATUT = {
  REDIGE: 'Établi', SOUMIS: 'Soumis', SIGNE: 'Signé',
  EXECUTEE: 'Exécutée', CLOTUREE: 'Clôturée', REJETEE: 'Annulée',
};

export const COULEURS_STATUT = {
  REDIGE: 'border-slate-200 bg-slate-100 text-slate-700',
  SOUMIS: 'border-amber-200 bg-amber-50 text-amber-700',
  SIGNE: 'border-sky-200 bg-sky-50 text-sky-700',
  EXECUTEE: 'border-violet-200 bg-violet-50 text-violet-700',
  CLOTUREE: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  REJETEE: 'border-red-200 bg-red-50 text-red-700',
};
