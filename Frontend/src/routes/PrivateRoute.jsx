import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { Spinner } from '../components/ui/Spinner.jsx';

/**
 * Garde d'authentification : redirige vers /login si aucun token valide.
 */
export function PrivateRoute() {
  const { token, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="Vérification de la session…" />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

export default PrivateRoute;