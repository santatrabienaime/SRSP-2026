/**
 * Page d'atterrissage selon le profil.
 *
 * Un utilisateur est toujours conduit vers l'interface qui le concerne :
 *  - un utilisateur rattaché à une division  -> les dossiers de SA division
 *  - un rôle de pilotage                    -> le tableau de bord
 *
 * Evite d'atterrir sur une page d'erreur ou sur une liste vide.
 */
export function landingPathFor(user) {
  if (!user) return '/login';
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
