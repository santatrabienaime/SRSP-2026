import { useState, useEffect, useCallback } from 'react';
import { Plus, Search } from 'lucide-react';
import { agentService } from '../../services/agentService.js';
import { usePagination } from '../../hooks/usePagination.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { Table } from '../ui/Table.jsx';
import { Pagination } from '../ui/Pagination.jsx';
import { Button } from '../ui/Button.jsx';
import { Input } from '../ui/Input.jsx';
import { Badge } from '../ui/Badge.jsx';
import { Modal } from '../ui/Modal.jsx';
import { EmptyState } from '../ui/EmptyState.jsx';
import { AgentForm } from './AgentForm.jsx';

export function AgentList() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const rows = await agentService.list();
      setAgents(Array.isArray(rows) ? rows : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = agents.filter(
    (a) =>
      !debouncedSearch ||
      `${a.nom} ${a.prenom} ${a.matricule || ''} ${a.fonction_libelle || ''}`
        .toLowerCase()
        .includes(debouncedSearch.toLowerCase())
  );

  const pagination = usePagination(filtered, 10);

  const columns = [
    {
      key: 'nom',
      label: 'Agent',
      render: (r) => (
        <span className="font-medium text-slate-700">{r.nom} {r.prenom}</span>
      ),
    },
    { key: 'matricule', label: 'Matricule', render: (r) => r.matricule || '—' },
    { key: 'fonction_libelle', label: 'Fonction', render: (r) => r.fonction_libelle || '—' },
    { key: 'division_nom', label: 'Division', render: (r) => r.division_nom || '—' },
    { key: 'email', label: 'Email', render: (r) => r.email || '—' },
    { key: 'telephone', label: 'Téléphone', render: (r) => r.telephone || '—' },
    {
      key: 'actif',
      label: 'Statut',
      render: (r) =>
        r.actif ? (
          <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">Actif</Badge>
        ) : (
          <Badge className="border-slate-200 bg-slate-100 text-slate-500">Inactif</Badge>
        ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-9 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            label="Rechercher un agent"
            placeholder="Nom, matricule…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="[&>input]:pl-9"
          />
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Nouvel agent
        </Button>
      </div>

      <Table columns={columns} data={pagination.currentItems} loading={loading} />
      {!loading && filtered.length === 0 && (
        <EmptyState title="Aucun agent" message="Créez le premier agent." />
      )}
      <Pagination pagination={pagination} />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Nouvel agent"
        footer={<Button variant="secondary" onClick={() => setOpen(false)}>Fermer</Button>}
      >
        <AgentForm
          onSaved={() => {
            setOpen(false);
            load();
          }}
        />
      </Modal>
    </div>
  );
}

export default AgentList;