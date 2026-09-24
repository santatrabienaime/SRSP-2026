import { lazy, Suspense } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Spinner } from '../components/ui/Spinner.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { landingPathFor } from '../utils/landing.js';

/** Chargement différé : la page n'est téléchargée que si elle est accessible. */
const DivisionDossiersPage = lazy(() =>
  import('../pages/divisions/DivisionDossiersPage.jsx')
);

/** Rôles de pilotage : ils peuvent consulter toutes les divisions. */
const ROLES_GLOBAUX = [
  'ADMIN', 'CHEF_SERVICE', 'CHEF_BAAF', 'SECRETAIRE', 'COORDINATRICE',
];

/**
 * Indique si l'utilisateur a le droit de consulter la division demandée.
 * Un chef de division ou un agent : uniquement SA division.
 * Un rôle de pilotage : toutes les divisions.
 */
export function canViewDivision(user, code) {
  if (!user || !code) return false;
  if (ROLES_GLOBAUX.includes(user.role_nom || '')) return true;
  if (!user.division_code) return false;
  return String(user.division_code).toUpperCase() === String(code).toUpperCase();
}

/**
 * Garde de la page « dossiers d'une division ».
 *
 * Un accès à une division qui n'est pas la sienne ne produit pas de page
 * d'erreur : l'utilisateur est ramené vers son propre périmètre, où il voit
 * immédiatement ses dossiers.
 */
export function DivisionDossiersRoute() {
  const { user } = useAuth();
  const { code } = useParams();

  if (!user) return null;

  if (!canViewDivision(user, code)) {
    return <Navigate to={landingPathFor(user)} replace />;
  }

  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <Spinner label="Chargement de la division…" />
        </div>
      }
    >
      <DivisionDossiersPage />
    </Suspense>
  );
}

export default DivisionDossiersRoute;
