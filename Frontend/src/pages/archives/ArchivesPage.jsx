import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Archive } from 'lucide-react';
import { dossierService } from '../../services/dossierService.js';
import { usePagination } from '../../hooks/usePagination.js';
import { useAuth } from '../../hooks/useAuth.js';
import { Table } from '../../components/ui/Table.jsx';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.jsx';
import { useNotification } from '../../hooks/useNotification.js';
import { formatDateString } from '../../utils/formatDate.js';
import { formatStatus, statusBadgeClass } from '../../utils/formatStatus.js';

/** Archives : dossiers clôturés et archivés + action d'archivage. */
export function ArchivesPage() {
  const { hasPermission } = useAuth();
  const { toastSuccess, toastError } = useNotification();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toArchive, setToArchive] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await dossierService.list({ statut: 'ARCHIVE' });
      setRows(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const pagination = usePagination(rows, 10);

  const handleArchive = async () => {
    setSubmitting(true);
    try {
      await dossierService.archiver(toArchive.id);
      toastSuccess('Dossier archivé.');
      setToArchive(null);
      await load();
    } catch (e) {
      toastError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

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
    { key: 'objet', label: 'Objet', render: (r) => <p className="max-w-xs truncate text-slate-700">{r.objet}</p> },
    { key: 'division_nom', label: 'Division', render: (r) => r.division_nom || '—' },
    {
      key: 'statut_code',
      label: 'Statut',
      render: (r) => <Badge className={statusBadgeClass(r.statut_code)}>{formatStatus(r.statut_code)}</Badge>,
    },
    { key: 'date_cloture', label: 'Clôturé le', render: (r) => formatDateString(r.date_cloture) },
    { key: 'date_archivage', label: 'Archivé le', render: (r) => formatDateString(r.date_archivage) },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Archives</h1>
        <p className="text-sm text-slate-500">Dossiers archivés — conservation et consultation.</p>
      </div>

      <Card>
        <Table columns={columns} data={pagination.currentItems} loading={loading} />
        <Pagination pagination={pagination} className="mt-4" />
      </Card>

      <ConfirmDialog
        open={toArchive !== null}
        onClose={() => setToArchive(null)}
        onConfirm={handleArchive}
        loading={submitting}
        danger
        title="Archiver le dossier"
        message={`Archiver le dossier clôturé ${toArchive?.numero} ?`}
        confirmLabel="Archiver"
      />
    </div>
  );
}

export default ArchivesPage;