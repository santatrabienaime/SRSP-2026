import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, FolderKanban, UserCheck } from 'lucide-react';
import { dossierService } from '../../services/dossierService.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { usePagination } from '../../hooks/usePagination.js';
import { useAuth } from '../../hooks/useAuth.js';
import { Badge } from '../ui/Badge.jsx';
import { Button } from '../ui/Button.jsx';
import { Select } from '../ui/Select.jsx';
import { Input } from '../ui/Input.jsx';
import { Table } from '../ui/Table.jsx';
import { Pagination } from '../ui/Pagination.jsx';
import { Alert } from '../ui/Alert.jsx';
import { EmptyState } from '../ui/EmptyState.jsx';
import { formatDateString, formatDateTime } from '../../utils/formatDate.js';
import { formatStatus, statusBadgeClass } from '../../utils/formatStatus.js';
import { STATUTS, STATUT_LABELS, TYPES_DOSSIERS } from '../../config/constants.js';

const STATUT_FILTERS = [
  { value: '', label: 'Tous les statuts' },
  ...Object.entries(STATUTS).map(([code]) => ({
    value: code,
    label: STATUT_LABELS[code],
  })),
];

/**
 * Liste des dossiers avec filtres côté serveur (statut, type, recherche).
 */
export function DossierList({ baseFilters = {}, showCreate = true }) {
  const { hasPermission, user } = useAuth();
  // Un agent est automatiquement restreint à SES dossiers par le serveur
  // (permission view_assigned_dossiers sans view_all_dossiers).
  const agentScoped =
    hasPermission('view_assigned_dossiers') && !hasPermission('view_all_dossiers');
  // Si la liste est verrouillée sur un type (page d'une division), le
  // sélecteur de type n'a pas lieu d'être et la barre est allégée.
  const lockedType = baseFilters.type || null;
  const showTypeFilter = !lockedType;
  // La liste peut etre verrouillee sur un groupe d'avancement (Nouveaux,
  // En cours, Termines) : le selecteur de statut est alors masque, sinon il
  // viendrait ecraser le groupe choisi.
  const lockedStatut = baseFilters.statut || null;
  const showStatutFilter = !lockedStatut;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statut, setStatut] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const debouncedSearch = useDebounce(search, 350);

  // baseFilters est souvent un objet recréé à chaque rendu du parent (ou défaut {} )
  // → le garder en ref évite que l'identité change et fasse re-feuiller load (clignotement).
  const baseFiltersRef = useRef(baseFilters);
  useEffect(() => { baseFiltersRef.current = baseFilters; }, [baseFilters]);
  const filterKey = JSON.stringify(baseFilters);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        ...baseFiltersRef.current,
        search: debouncedSearch || undefined,
        // Le statut vient du selecteur, sauf si la liste est verrouillee sur un
        // groupe d'avancement : dans ce cas baseFilters fait foi.
        ...(lockedStatut ? {} : { statut: statut || undefined }),
        // Le type vient du selecteur, sauf si la liste est verrouillee sur un
        // type (page d'une division) : dans ce cas baseFilters fait foi.
        ...(lockedType ? {} : { type: typeFilter || undefined }),
      };
      const rows = await dossierService.list(params);
      setData(Array.isArray(rows) ? rows : []);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [filterKey, debouncedSearch, statut, typeFilter]);

  // load est stable (dépendances primitives : filterKey, debouncedSearch, statut, typeFilter)
  // → l'effet se déclenche au montage ET à chaque vrai changement de filtre, sans boucle.
  useEffect(() => {
    load();
  }, [load]);

  const pagination = usePagination(data, 10);
  const canCreate = hasPermission('create_dossier');

  const columns = [
    {
      key: 'numero',
      label: 'N° dossier',
      render: (r) => (
        <Link to={`/dossiers/${r.id}`} className="font-semibold text-primary-600 hover:underline">
          {r.numero}
        </Link>
      ),
    },
    {
      key: 'objet',
      label: 'Objet',
      render: (r) => (
        <div>
          <p className="max-w-xs truncate font-medium text-slate-700">{r.objet}</p>
          <p className="text-xs text-slate-400">{r.demandeur}</p>
        </div>
      ),
    },
    { key: 'type_libelle', label: 'Type' },
    {
      key: 'division_nom',
      label: 'Division',
      render: (r) => r.division_nom || '—',
    },
    {
      key: 'date_reception',
      label: 'Réception',
      render: (r) => formatDateString(r.date_reception),
    },
    {
      key: 'statut_code',
      label: 'Statut',
      render: (r) => (
        <Badge className={statusBadgeClass(r.statut_code)}>
          {formatStatus(r.statut_code)}
        </Badge>
      ),
    },
    {
      key: 'agent',
      label: 'Agent',
      render: (r) => (r.agent_nom ? `${r.agent_nom} ${r.agent_prenom || ''}` : '—'),
    },
    {
      key: 'updated',
      label: 'Créé le',
      render: (r) => <span className="text-slate-500">{formatDateTime(r.created_at)}</span>,
    },
  ];

  // File « À affecter » : le chef de division agit sans ouvrir chaque fiche.
  // Le bouton n'apparait que pour un dossier qui attend son affectation et
  // pour un role autorise a affecter.
  const fileAAffecter = baseFilters.statut === 'A_AFFECTER';
  const peutAffecter = hasPermission('affecter_dossier');
  if (fileAAffecter && peutAffecter) {
    columns.push({
      key: 'action',
      label: 'Action',
      render: (r) => {
        const affectable = [STATUTS.ENREGISTRE, STATUTS.ORIENTE].includes(r.statut_code);
        if (!affectable) {
          return <span className="text-xs text-slate-400">Déjà affecté</span>;
        }
        return (
          <Link to={`/dossiers/${r.id}`}>
            <Button size="sm" variant="outline">
              <UserCheck className="h-3.5 w-3.5" />
              Affecter
            </Button>
          </Link>
        );
      },
    });
  }

  return (
    <div className="space-y-4">
      {agentScoped && (
        <p className="rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-800">
          Vous consultez uniquement les dossiers dont vous êtes le responsable.
        </p>
      )}
      {/* Filtres */}
      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end">
        <div className="flex-1">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-9 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              label="Recherche"
              placeholder="N° dossier, objet, demandeur…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="[&>input]:pl-9"
            />
          </div>
        </div>
        {showStatutFilter && (
          <div className="w-full sm:w-52">
            <Select
              label="Statut"
              value={statut}
              onChange={(e) => setStatut(e.target.value)}
            >
              {STATUT_FILTERS.map((s) => (
                <option key={s.value || 'all'} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          </div>
        )}
        {showTypeFilter ? (
          <div className="w-full sm:w-48">
            <Select
              label="Type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">Tous les types</option>
              {Object.entries(TYPES_DOSSIERS).map(([code, t]) => (
                <option key={code} value={code}>
                  {t.label}
                </option>
              ))}
            </Select>
          </div>
        ) : (
          <div className="w-full sm:w-48">
            <p className="text-xs font-medium text-slate-500">Type de dossier</p>
            <p className="mt-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              {TYPES_DOSSIERS[lockedType]?.label || lockedType}
            </p>
          </div>
        )}
        {canCreate && showCreate && (
          <Link to="/dossiers/nouveau">
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4" /> Nouveau dossier
            </Button>
          </Link>
        )}
      </div>

      {error && (
        <Alert type="error" title="Erreur de chargement">
          {error.message}
        </Alert>
      )}

      <Table columns={columns} data={pagination.currentItems} loading={loading} />

      {!loading && data.length === 0 && (
        <EmptyState
          title="Aucun dossier"
          message="Aucun dossier ne correspond aux critères sélectionnés."
          action={
            canCreate && (
              <Link to="/dossiers/nouveau">
                <Button variant="secondary">
                  <Plus className="h-4 w-4" /> Créer un dossier
                </Button>
              </Link>
            )
          }
        />
      )}

      <Pagination pagination={pagination} className="justify-end" />
    </div>
  );
}

export default DossierList;