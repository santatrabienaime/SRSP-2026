import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Mail } from 'lucide-react';
import { courrierService } from '../../services/courrierService.js';
import { usePagination } from '../../hooks/usePagination.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { useAuth } from '../../hooks/useAuth.js';
import { Badge } from '../ui/Badge.jsx';
import { Table } from '../ui/Table.jsx';
import { Pagination } from '../ui/Pagination.jsx';
import { Input } from '../ui/Input.jsx';
import { Select } from '../ui/Select.jsx';
import { Button } from '../ui/Button.jsx';
import { EmptyState } from '../ui/EmptyState.jsx';
import { formatDateTime } from '../../utils/formatDate.js';

const SENS_LABELS = { ENTRANT: 'Entrant', SORTANT: 'Sortant' };
const SENS_BADGE = {
  ENTRANT: 'border-sky-200 bg-sky-50 text-sky-700',
  SORTANT: 'border-violet-200 bg-violet-50 text-violet-700',
};

const STATUTS_COURRIERS = ['', 'RECU', 'TRANSMIS', 'TRAITE', 'CLASSE'];

export function CourrierList({ baseFilters = {}, showCreate = true }) {
  // baseFilters est un objet recréé à chaque rendu du parent (ou défaut {})
  // -> le garder en ref évite que l'identité change fasse re-feuiller load (spinner clignote).
  const baseFiltersRef = useRef(baseFilters);
  useEffect(() => { baseFiltersRef.current = baseFilters; }, [baseFilters]);
  const filterKey = JSON.stringify(baseFilters);
  const { hasPermission } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [sens, setSens] = useState('');
  const [statut, setStatut] = useState('');
  const debouncedSearch = useDebounce(search, 350);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const rows = await courrierService.list({
        ...baseFiltersRef.current,
        search: debouncedSearch || undefined,
        sens: sens || undefined,
        statut: statut || undefined,
      });
      setData(Array.isArray(rows) ? rows : []);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [filterKey, debouncedSearch, sens, statut]);

  // load est stable (dépendances primitives : filterKey, debouncedSearch, sens, statut)
  // → l'effet se déclenche au montage ET à chaque vrai changement de filtre, sans boucle.
  useEffect(() => {
    load();
  }, [load]);

  const pagination = usePagination(data, 10);
  const canCreate = hasPermission('manage_courriers');

  const columns = [
    {
      key: 'numero',
      label: 'N° courrier',
      render: (r) => (
        <Link to={`/courriers/${r.id}`} className="font-semibold text-primary-600 hover:underline">
          {r.numero}
        </Link>
      ),
    },
    {
      key: 'sens',
      label: 'Sens',
      render: (r) => (
        <Badge className={SENS_BADGE[r.sens] || 'border-slate-200'}>
          {SENS_LABELS[r.sens] || r.sens}
        </Badge>
      ),
    },
    {
      key: 'objet',
      label: 'Objet',
      render: (r) => <p className="max-w-xs truncate text-slate-700">{r.objet}</p>,
    },
    { key: 'type_libelle', label: 'Type', render: (r) => r.type_libelle || '—' },
    { key: 'expediteur', label: 'Expéditeur', render: (r) => r.expediteur || '—' },
    { key: 'destinataire', label: 'Destinataire', render: (r) => r.destinataire || '—' },
    {
      key: 'statut',
      label: 'Statut',
      render: (r) => (
        <Badge className="border-blue-200 bg-blue-50 text-blue-700">{r.statut}</Badge>
      ),
    },
    {
      key: 'created_at',
      label: 'Date',
      render: (r) => <span className="text-slate-500">{formatDateTime(r.created_at)}</span>,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-9 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            label="Recherche"
            placeholder="N° courrier, objet, expéditeur…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="[&>input]:pl-9"
          />
        </div>
        <div className="w-full sm:w-44">
          <Select label="Sens" value={sens} onChange={(e) => setSens(e.target.value)}>
            <option value="">Tous</option>
            <option value="ENTRANT">Entrant</option>
            <option value="SORTANT">Sortant</option>
          </Select>
        </div>
        <div className="w-full sm:w-44">
          <Select label="Statut" value={statut} onChange={(e) => setStatut(e.target.value)}>
            <option value="">Tous</option>
            {STATUTS_COURRIERS.filter(Boolean).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
        </div>
        {canCreate && showCreate && (
          <Link to="/courriers/nouveau">
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4" /> Nouveau courrier
            </Button>
          </Link>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error.message}</p>}
      <Table columns={columns} data={pagination.currentItems} loading={loading} />
      {!loading && data.length === 0 && (
        <EmptyState title="Aucun courrier" message="Aucun courrier ne correspond aux critères." />
      )}
      <Pagination pagination={pagination} />
    </div>
  );
}

export default CourrierList;