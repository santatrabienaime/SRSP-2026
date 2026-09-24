import { DossierList } from '../../components/dossier/DossierList.jsx';
import { useAuth } from '../../hooks/useAuth.js';

/** Rôles de pilotage : ils voient l'ensemble des divisions. */
const ROLES_GLOBAUX = [
  'ADMIN', 'CHEF_SERVICE', 'CHEF_BAAF', 'SECRETAIRE', 'COORDINATRICE',
];

export function DossierListPage() {
  const { user } = useAuth();

  // Un chef de division ou un agent n'a pas à parcourir les dossiers des
  // autres services : la liste est cadrée sur le type de sa division.
  const roleNom = user?.role_nom || '';
  const global = ROLES_GLOBAUX.includes(roleNom);
  const baseFilters =
    !global && user?.type_code ? { type: user.type_code } : {};

  const titre = baseFilters.type ? 'Dossiers de ma division' : 'Dossiers';
  const sousTitre = baseFilters.type
    ? 'Seuls les dossiers relevant de votre division sont affichés.'
    : 'Gestion, suivi et traçabilité des dossiers administratifs.';

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">{titre}</h1>
        <p className="text-sm text-slate-500">{sousTitre}</p>
      </div>
      <DossierList key={baseFilters.type || 'all'} baseFilters={baseFilters} />
    </div>
  );
}

export default DossierListPage;
