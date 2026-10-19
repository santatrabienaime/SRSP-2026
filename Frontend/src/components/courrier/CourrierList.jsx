import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Trash2 } from 'lucide-react';
import { courrierService } from '../../services/courrierService.js';
import { usePagination } from '../../hooks/usePagination.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useNotification } from '../../hooks/useNotification.js';
import { COURRIER_STATUTS } from '../../config/constants.js';
import { Badge } from '../ui/Badge.jsx';
import { Table } from '../ui/Table.jsx';
import { Pagination } from '../ui/Pagination.jsx';
import { Input } from '../ui/Input.jsx';
import { Select } from '../ui/Select.jsx';
import { Button } from '../ui/Button.jsx';
import { ConfirmDialog } from '../ui/ConfirmDialog.jsx';
import { EmptyState } from '../ui/EmptyState.jsx';
import { formatDateTime } from '../../utils/formatDate.js';

const SENS_LABELS = { ENTRANT: 'Entrant', SORTANT: 'Sortant' };
const SENS_BADGE = {
  ENTRANT: 'border-sky-200 bg-sky-50 text-sky-700',
  SORTANT: 'border-violet-200 bg-violet-50 text-violet-700',
};

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
  const [aSupprimer, setASupprimer] = useState(null);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);
  const debouncedSearch = useDebounce(search, 350);
  const { toastSuccess, toastError } = useNotification();

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
    Promise.resolve().then(load);
  }, [load]);

  const pagination = usePagination(data, 10);
  const canCreate = hasPermission('manage_courriers');

  /* La suppression d'un courrier relève de la même permission que le reste du
     module (le routeur serveur exige manage_courriers sur toutes ses routes). */
  const supprimer = async () => {
    setSuppressionEnCours(true);
    try {
      await courrierService.delete(aSupprimer.id);
      toastSuccess('Courrier supprimé.');
      setASupprimer(null);
      await load();
    } catch (e) {
      toastError(e.message);
    } finally {
      setSuppressionEnCours(false);
    }
  };

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
        <Badge className="border-blue-200 bg-blue-50 text-blue-700">
          {COURRIER_STATUTS[r.statut] || r.statut || '—'}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      label: 'Date',
      render: (r) => <span className="text-slate-500">{formatDateTime(r.created_at)}</span>,
    },
    ...(canCreate
      ? [
          {
            key: 'actions',
            label: 'Actions',
            render: (r) => (
              <Button
                size="sm"
                variant="ghost"
                className="text-red-600 hover:bg-red-50"
                title="Supprimer"
                aria-label={`Supprimer le courrier ${r.numero}`}
                onClick={() => setASupprimer(r)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            ),
          },
        ]
      : []),
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
            {Object.entries(COURRIER_STATUTS).map(([code, libelle]) => (
              <option key={code} value={code}>{libelle}</option>
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

      <ConfirmDialog
        open={aSupprimer !== null}
        onClose={() => !suppressionEnCours && setASupprimer(null)}
        onConfirm={supprimer}
        loading={suppressionEnCours}
        danger
        title="Supprimer le courrier"
        message={`Supprimer définitivement le courrier ${aSupprimer?.numero || ''} ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
      />
    </div>
  );
}

export default CourrierList;