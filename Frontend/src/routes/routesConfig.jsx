/**
 * Configuration des routes publiques et libellés de navigation.
 * Les routes protégées sont déclarées dans AppRouter.
 */

export const PUBLIC_ROUTES = [
  { path: '/login', label: 'Connexion' },
  { path: '/mot-de-passe-oublie', label: 'Mot de passe oublié' },
  { path: '/mot-de-passe-oublie/reset', label: 'Réinitialisation' },
];

export const APP_NAME = 'SRSP Fitovinany';
export const APP_TAGLINE = 'Suivi et traçabilité des dossiers administratifs';

/** Routes encadrées par des rôles (postes SRSP). */
export const ADMIN_ROUTES = ['/administration', '/agents', '/divisions'];