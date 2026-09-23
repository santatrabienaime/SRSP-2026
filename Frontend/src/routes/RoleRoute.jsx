import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

/**
 * Garde par rôle (RBAC) : restreint l'accès aux seuls rôles autorisés
 * (ou aux utilisateurs disposant d'au moins une permission donnée).
 *
 * Utilisation comme wrapper :
 *  <RoleRoute roles={['ADMIN']} permissions={['user.gerer']}>
 *    <Composant />
 *  </RoleRoute>
 */
export function RoleRoute({ roles = [], permissions = [], fallback = '/403', children }) {
  const { user, isRole, hasAnyPermission } = useAuth();

  const okRole = roles.length === 0 || isRole(...roles);
  const okPerm = permissions.length === 0 || hasAnyPermission(permissions);

  if (okRole && okPerm) return children ?? <Outlet />;
  return <Navigate to={fallback} replace />;
}

export default RoleRoute;