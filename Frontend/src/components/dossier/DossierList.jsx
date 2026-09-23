import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, FolderKanban } from 'lucide-react';
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
  const { hasPermission } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statut, setStatut] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const debouncedSearch = useDebounce(search, 350);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        ...baseFilters,
        search: debouncedSearch || undefined,
        statut: statut || undefined,
        type: typeFilter || undefined,
      };
      const rows = await dossierService.list(params);
      setData(Array.isArray(rows) ? rows : []);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [baseFilters, debouncedSearch, statut, typeFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const pagination = usePagination(data, 10);
  const canCreate = hasPermission('dossier.creer');

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

  return (
    <div className="space-y-4">
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