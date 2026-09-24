import { useState, useEffect, useCallback } from 'react';
import { Search, History } from 'lucide-react';
import { historiqueService } from '../../services/historiqueService.js';
import { usePagination } from '../../hooks/usePagination.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { Table } from '../../components/ui/Table.jsx';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { formatDateTime } from '../../utils/formatDate.js';
import { Link } from 'react-router-dom';

const ACTION_NAMES = {
  CREATION_DOSSIER: 'Création du dossier',
  ENREGISTREMENT: 'Enregistrement',
  MODIFICATION_DOSSIER: 'Modification',
  ORIENTATION: 'Orientation',
  AFFECTATION: 'Affectation',
  TRAITEMENT: 'Traitement',
  VERIFICATION: 'Vérification',
  VALIDATION: 'Validation',
  SIGNATURE: 'Signature',
  CLOTURE: 'Clôture',
  ARCHIVAGE: 'Archivage',
  UPLOAD_DOCUMENT: 'Upload document',
  CREATION_COURRIER: 'Création courrier',
};

const ACTION_COLORS = {
  CREATION_DOSSIER: 'border-primary-200 bg-primary-50 text-primary-700',
  ENREGISTREMENT: 'border-sky-200 bg-sky-50 text-sky-700',
  MODIFICATION_DOSSIER: 'border-amber-200 bg-amber-50 text-amber-700',
  ORIENTATION: 'border-cyan-200 bg-cyan-50 text-cyan-700',
  AFFECTATION: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  TRAITEMENT: 'border-blue-200 bg-blue-50 text-blue-700',
  VERIFICATION: 'border-purple-200 bg-purple-50 text-purple-700',
  VALIDATION: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  SIGNATURE: 'border-teal-200 bg-teal-50 text-teal-700',
  CLOTURE: 'border-slate-200 bg-slate-100 text-slate-600',
  ARCHIVAGE: 'border-gray-300 bg-gray-100 text-gray-600',
  UPLOAD_DOCUMENT: 'border-violet-200 bg-violet-50 text-violet-700',
  CREATION_COURRIER: 'border-rose-200 bg-rose-50 text-rose-700',
};

export function HistoriquePage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await historiqueService.list({ search: debouncedSearch || undefined });
      setRows(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = rows.filter(
    (r) =>
      !debouncedSearch ||
      `${r.username || ''} ${r.dossier_numero || ''} ${r.action || ''} ${r.details || ''} ${r.ip_address || ''}`
        .toLowerCase()
        .includes(debouncedSearch.toLowerCase())
  );

  const pagination = usePagination(filtered, 15);

  const columns = [
    {
      key: 'date_action',
      label: 'Date',
      render: (r) => <span className="whitespace-nowrap text-slate-500">{formatDateTime(r.date_action)}</span>,
    },
    {
      key: 'action',
      label: 'Action',
      render: (r) => (
        <Badge className={ACTION_COLORS[r.action] || 'border-slate-200'}>
          {ACTION_NAMES[r.action] || r.action}
        </Badge>
      ),
    },
    {
      key: 'dossier',
      label: 'Dossier',
      render: (r) =>
        r.dossier_id ? (
          <Link to={`/dossiers/${r.dossier_id}`} className="font-medium text-primary-600 hover:underline">
            {r.dossier_numero || `#${r.dossier_id}`}
          </Link>
        ) : (
          '—'
        ),
    },
    { key: 'username', label: 'Utilisateur', render: (r) => r.username || '—' },
    {
      key: 'ip_address',
      label: 'IP',
      render: (r) => (
        <span className="font-mono text-xs text-slate-500">{r.ip_address || '—'}</span>
      ),
    },
    { key: 'details', label: 'Détails', render: (r) => <p className="max-w-md truncate text-slate-600">{r.details || '—'}</p> },
    {
      key: 'valeurs',
      label: 'Avant / Après',
      render: (r) => (
        <span className="text-xs text-slate-500">
          {r.ancienne_valeur || '—'} → {r.nouvelle_valeur || '—'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Historique</h1>
        <p className="text-sm text-slate-500">Journal traçable de toutes les actions (piste d'audit).</p>
      </div>
      <Card>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Rechercher (utilisateur, dossier, action…)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="[&>input]:pl-9"
            />
          </div>
          <History className="hidden h-5 w-5 text-slate-300 sm:block" />
        </div>
        <Table columns={columns} data={pagination.currentItems} loading={loading} />
        <Pagination pagination={pagination} className="mt-4" />
      </Card>
    </div>
  );
}

export default HistoriquePage;