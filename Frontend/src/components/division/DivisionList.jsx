import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { divisionService } from '../../services/divisionService.js';
import { usePagination } from '../../hooks/usePagination.js';
import { Table } from '../ui/Table.jsx';
import { Pagination } from '../ui/Pagination.jsx';
import { Button } from '../ui/Button.jsx';
import { Badge } from '../ui/Badge.jsx';
import { EmptyState } from '../ui/EmptyState.jsx';
import { DivisionForm } from './DivisionForm.jsx';
import { Modal } from '../ui/Modal.jsx';

export function DivisionList() {
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const rows = await divisionService.list();
      setDivisions(Array.isArray(rows) ? rows : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const pagination = usePagination(divisions, 10);

  const columns = [
    { key: 'code', label: 'Code', render: (r) => <Badge className="border-slate-200 bg-slate-50">{r.code}</Badge> },
    { key: 'nom', label: 'Division', render: (r) => <span className="font-medium text-slate-700">{r.nom}</span> },
    {
      key: 'responsable',
      label: 'Responsable',
      render: (r) =>
        r.responsable_nom ? `${r.responsable_nom} ${r.responsable_prenom || ''}` : '—',
    },
    {
      key: 'actif',
      label: 'Statut',
      render: (r) =>
        r.actif ? (
          <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">Active</Badge>
        ) : (
          <Badge className="border-slate-200 bg-slate-100 text-slate-500">Inactive</Badge>
        ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Nouvelle division
        </Button>
      </div>
      <Table columns={columns} data={pagination.currentItems} loading={loading} />
      {!loading && divisions.length === 0 && (
        <EmptyState title="Aucune division" message="Créez la première division." />
      )}
      <Pagination pagination={pagination} />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Nouvelle division"
        footer={
          <Button variant="secondary" onClick={() => setOpen(false)}>Fermer</Button>
        }
      >
        <DivisionForm
          onSaved={() => {
            setOpen(false);
            load();
          }}
        />
      </Modal>
    </div>
  );
}

export default DivisionList;