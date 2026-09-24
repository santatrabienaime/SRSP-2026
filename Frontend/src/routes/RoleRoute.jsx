import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { landingPathFor } from '../utils/landing.js';

/**
 * Garde par rôle / permission (RBAC).
 *
 * Un accès non autorisé ne doit pas afficher une page d'erreur : l'utilisateur
 * est conduit vers l'interface qui le concerne réellement. On évite ainsi les
 * écrans 403/404 et les listes vides sources de confusion.
 *
 * Utilisation :
 *  <RoleRoute roles={['ADMIN']} permissions={['manage_users']}>
 *    <Composant />
 *  </RoleRoute>
 */
export function RoleRoute({
  roles = [],
  permissions = [],
  fallback,
  children,
}) {
  const { user, isRole, hasAnyPermission } = useAuth();

  // Tant que le profil n'est pas chargé, on n'affiche rien de définitif.
  if (!user) return null;

  const okRole = roles.length === 0 || isRole(...roles);
  const okPerm = permissions.length === 0 || hasAnyPermission(permissions);

  if (okRole && okPerm) return children ?? <Outlet />;

  return <Navigate to={fallback || landingPathFor(user)} replace />;
}

export default RoleRoute;
