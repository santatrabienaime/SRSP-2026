/**
 * Page d'atterrissage selon le profil.
 *
 * Un utilisateur est toujours conduit vers l'interface qui le concerne :
 *  - un utilisateur rattaché à une division  -> les dossiers de SA division
 *  - un rôle de pilotage                    -> le tableau de bord
 *
 * Evite d'atterrir sur une page d'erreur ou sur une liste vide.
 *
 * `demande` est le chemin que l'utilisateur tentait d'atteindre avant d'être
 * renvoyé vers la connexion. On ne le respecte que s'il est interne à
 * l'application : une URL absolue coming d'un lien externe ne doit jamais
 * devenir une redirection apres authentification.
 */
export function landingPathFor(user, demande = null) {
  if (!user) return '/login';
  const parDefaut = defautPour(user);
  if (!demande) return parDefaut;

  // Rejet des URL externes, des protocolesRelative et des chemins absolus.
  if (!demande.startsWith('/') || demande.startsWith('//')) return parDefaut;
  // /login, /connexion et leurs équivalents ne sont pas une destination.
  const chemin = demande.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';
  const interdits = ['/login', '/connexion', '/mot-de-passe-oublie', '/reinitialiser-mot-de-passe'];
  if (interdits.includes(chemin)) return parDefaut;
  return demande;
}

/** Page d'atterrissage par défaut, selon le profil. */
function defautPour(user) {
  const roleNom = user.role_nom || '';
  const pilotage = [
    'ADMIN', 'CHEF_SERVICE', 'CHEF_BAAF', 'SECRETAIRE', 'COORDINATRICE',
  ];
  if (user.division_code && !pilotage.includes(roleNom)) {
    return `/divisions/${user.division_code}/dossiers`;
  }
  return '/';
}

export default landingPathFor;
