import { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Eye, Send, CheckCircle2, Archive, Trash2, Pencil } from 'lucide-react';
import { bordereauService } from '../../services/bordereauService.js';
import { divisionService } from '../../services/divisionService.js';
import { usePagination } from '../../hooks/usePagination.js';
import { useNotification } from '../../hooks/useNotification.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { Table } from '../ui/Table.jsx';
import { Pagination } from '../ui/Pagination.jsx';
import { Button } from '../ui/Button.jsx';
import { Badge } from '../ui/Badge.jsx';
import { Modal } from '../ui/Modal.jsx';
import { Alert } from '../ui/Alert.jsx';
import { ConfirmDialog } from '../ui/ConfirmDialog.jsx';
import { Input } from '../ui/Input.jsx';
import { Select } from '../ui/Select.jsx';
import { BordereauForm } from './BordereauForm.jsx';
import { formatDateTime } from '../../utils/formatDate.js';

const STATUT_LABELS = {
  BROUILLON: 'Brouillon',
  EMIS: 'Émis',
  RECU_PAR_DIVISION: 'Reçu par division',
  ARCHIVE: 'Archivé',
};

const STATUT_TONES = {
  BROUILLON: 'bg-slate-100 text-slate-700',
  EMIS: 'bg-blue-100 text-blue-700',
  RECU_PAR_DIVISION: 'bg-emerald-100 text-emerald-700',
  ARCHIVE: 'bg-violet-100 text-violet-700',
};

export function BordereauList() {
  const { toastSuccess, toastError } = useNotification();

  const [bordereaux, setBordereaux] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statutFilter, setStatutFilter] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const [editant, setEditant] = useState(null);
  const [detail, setDetail] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await bordereauService.list({
        page: 1,
        limit: 100,
        search: debouncedSearch,
        statut: statutFilter,
        division_id: divisionFilter ? Number(divisionFilter) : undefined,
      });
      setBordereaux(data.data || []);
      setError(null);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statutFilter, divisionFilter]);

  useEffect(() => {
    divisionService.list().then((d) => setDivisions(Array.isArray(d) ? d : [])).catch(() => {});
    load();
  }, [load]);

  const openCreate = () => setEditant({});
  const openEdit = (b) => setEditant(b);
  const openDetail = (b) => setDetail(b);

  const handleEmit = async (id) => {
    setSaving(true);
    try {
      await bordereauService.emit(id);
      toastSuccess('Bordereau émis.');
      load();
    } catch (e) { toastError(e.message); }
    finally { setSaving(false); }
  };

  const handleAcknowledge = async (id) => {
    setSaving(true);
    try {
      await bordereauService.acknowledge(id);
      toastSuccess('Réception confirmée.');
      load();
    } catch (e) { toastError(e.message); }
    finally { setSaving(false); }
  };

  const handleArchive = async (id) => {
    setSaving(true);
    try {
      await bordereauService.archive(id);
      toastSuccess('Bordereau archivé.');
      load();
    } catch (e) { toastError(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    setConfirm({ action: 'delete', id });
  };

  const executeConfirm = async () => {
    if (!confirm) return;
    setSaving(true);
    try {
      if (confirm.action === 'delete') {
        await bordereauService.remove(confirm.id);
        toastSuccess('Bordereau supprimé.');
      }
      setConfirm(null);
      load();
    } catch (e) {
      toastError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const colonnes = [
    { key: 'reference', label: 'Référence', render: (b) => <span className="font-mono text-sm font-medium">{b.reference}</span> },
    { key: 'division', label: 'Division', render: (b) => <span className="text-sm text-slate-600">{b.division_nom}</span> },
    { key: 'statut', label: 'Statut', render: (b) => <Badge className={STATUT_TONES[b.statut] || 'bg-slate-100 text-slate-700'}>{STATUT_LABELS[b.statut] || b.statut}</Badge> },
    { key: 'date', label: 'Date transmission', render: (b) => <span className="text-sm text-slate-500">{b.date_transmission ? formatDateTime(b.date_transmission) : '—'}</span> },
    { key: 'reception', label: 'Réception division', render: (b) => <span className="text-sm text-slate-500">{b.date_reception_division ? formatDateTime(b.date_reception_division) : '—'}</span> },
    { key: 'dossiers', label: 'Nb dossiers', render: (b) => <Badge className="bg-primary-50 text-primary-700 border-primary-200">{b.dossiers?.length || 0}</Badge> },
    { key: 'emetteur', label: 'Émis par', render: (b) => <span className="text-sm text-slate-500">{b.agent_nom ? `${b.agent_nom} ${b.agent_prenom}` : '—'}</span> },
    { key: 'recu_par', label: 'Reçu par', render: (b) => <span className="text-sm text-slate-500">{b.recu_par_nom ? `${b.recu_par_nom} ${b.recu_par_prenom}` : '—'}</span> },
    {
      key: 'actions',
      label: 'Actions',
      render: (b) => (
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" title="Voir" onClick={() => openDetail(b)}><Eye className="h-3.5 w-3.5" /></Button>
          {b.statut === 'BROUILLON' && (
            <>
              <Button size="sm" variant="ghost" title="Modifier" onClick={() => openEdit(b)}><Pencil className="h-3.5 w-3.5" /></Button>
              <Button size="sm" variant="ghost" title="Émettre" onClick={() => handleEmit(b.id)}><Send className="h-3.5 w-3.5" /></Button>
              <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" title="Supprimer" onClick={() => handleDelete(b.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
            </>
          )}
          {b.statut === 'EMIS' && (
            <Button size="sm" variant="ghost" title="Accuser réception" onClick={() => handleAcknowledge(b.id)}><CheckCircle2 className="h-3.5 w-3.5" /></Button>
          )}
          {b.statut === 'RECU_PAR_DIVISION' && (
            <Button size="sm" variant="ghost" title="Archiver" onClick={() => handleArchive(b.id)}><Archive className="h-3.5 w-3.5" /></Button>
          )}
        </div>
      ),
    },
  ];

  const filtres = useMemo(() => {
    let res = bordereaux;
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      res = res.filter((b) =>
        b.reference.toLowerCase().includes(q) ||
        b.observation?.toLowerCase().includes(q) ||
        b.division_nom?.toLowerCase().includes(q)
      );
    }
    if (statutFilter) res = res.filter((b) => b.statut === statutFilter);
    if (divisionFilter) res = res.filter((b) => b.division_id === Number(divisionFilter));
    return res;
  }, [bordereaux, debouncedSearch, statutFilter, divisionFilter]);
  const pagination = usePagination(filtres, 10);

  return (
    <div className="space-y-4">
      {error && <Alert type="error" title="Impossible de charger les bordereaux">{error.message || String(error)}</Alert>}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Input
            label="Rechercher"
            value={search}
            onChange={setSearch}
            placeholder="Référence, observation…"
            clearable
          />
        </div>
        <div className="flex gap-2 sm:w-auto">
          <Select value={statutFilter} onChange={setStatutFilter} style={{ minWidth: 180 }}>
            <option value="">Tous statuts</option>
            <option value="BROUILLON">Brouillon</option>
            <option value="EMIS">Émis</option>
            <option value="RECU_PAR_DIVISION">Reçu par division</option>
            <option value="ARCHIVE">Archivé</option>
          </Select>
          <Select value={divisionFilter} onChange={setDivisionFilter} style={{ minWidth: 180 }}>
            <option value="">Toutes divisions</option>
            {divisions.map((d) => <option key={d.id} value={d.id}>{d.nom}</option>)}
          </Select>
        </div>
        <Button onClick={openCreate} variant="secondary"><Plus className="h-4 w-4" /> Nouveau bordereau</Button>
      </div>

      <Table columns={colonnes} data={pagination.currentItems} loading={loading} emptyLabel="Aucun bordereau" />
      <Pagination pagination={pagination} />

      <Modal open={editant !== null} onClose={() => setEditant(null)} title={editant?.id ? `Modifier ${editant.reference}` : 'Nouveau bordereau'} size="lg">
        <BordereauForm key={editant?.id ?? 'nouveau'} initial={editant?.id ? editant : null} onCancel={() => setEditant(null)} onSaved={() => { setEditant(null); load(); }} />
      </Modal>

      <Modal open={detail !== null} onClose={() => setDetail(null)} title={`Bordereau — ${detail?.reference}`} size="xl">
        <BordereauDetail initial={detail} onClose={() => setDetail(null)} />
      </Modal>

      <ConfirmDialog
        open={confirm !== null}
        onClose={() => !saving && setConfirm(null)}
        onConfirm={executeConfirm}
        loading={saving}
        danger={confirm?.action === 'delete'}
        title="Supprimer le bordereau"
        message="Cette action est irréversible. Seuls les bordereaux en brouillon peuvent être supprimés."
        confirmLabel="Supprimer"
      />
    </div>
  );
}

function BordereauDetail({ initial }) {
  const b = initial;
  if (!b) return null;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div><p className="text-xs font-medium text-slate-500">Référence</p><p className="font-mono text-sm font-medium">{b.reference}</p></div>
        <div><p className="text-xs font-medium text-slate-500">Division</p><p>{b.division_nom}</p></div>
        <div><p className="text-xs font-medium text-slate-500">Statut</p><Badge className={STATUT_TONES[b.statut] || 'bg-slate-100 text-slate-700'}>{STATUT_LABELS[b.statut] || b.statut}</Badge></div>
        <div><p className="text-xs font-medium text-slate-500">Date transmission</p><p>{b.date_transmission ? formatDateTime(b.date_transmission) : '—'}</p></div>
        <div><p className="text-xs font-medium text-slate-500">Réception division</p><p>{b.date_reception_division ? formatDateTime(b.date_reception_division) : '—'}</p></div>
        <div><p className="text-xs font-medium text-slate-500">Émis par</p><p>{b.agent_nom ? `${b.agent_nom} ${b.agent_prenom}` : '—'}</p></div>
        <div><p className="text-xs font-medium text-slate-500">Reçu par</p><p>{b.recu_par_nom ? `${b.recu_par_nom} ${b.recu_par_prenom}` : '—'}</p></div>
        <div className="sm:col-span-2"><p className="text-xs font-medium text-slate-500">Observation</p><p className="text-sm text-slate-600 whitespace-pre-wrap">{b.observation || '—'}</p></div>
      </div>

      {b.dossiers?.length && (
        <div>
          <h4 className="text-sm font-semibold text-slate-700 mb-2">Dossiers ({b.dossiers.length})</h4>
          <ul className="divide-y divide-slate-200 max-h-64 overflow-y-auto">
            {b.dossiers.map((d) => (
              <li key={d.id} className="flex items-center justify-between py-2 px-3 hover:bg-slate-50">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800">{d.numero}</p>
                  <p className="text-xs text-slate-500 truncate">{d.objet}</p>
                </div>
                <span className="text-xs text-slate-500">{d.statut_libelle}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default BordereauList;