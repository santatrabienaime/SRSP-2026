import { useState, useEffect, useCallback } from 'react';
import { Download, Trash2, CheckCircle2, XCircle, FileText } from 'lucide-react';
import { documentService } from '../../services/documentService.js';
import { useNotification } from '../../hooks/useNotification.js';
import { Badge } from '../ui/Badge.jsx';
import { Table } from '../ui/Table.jsx';
import { Button } from '../ui/Button.jsx';
import { ConfirmDialog } from '../ui/ConfirmDialog.jsx';
import { formatBytes } from '../../utils/fileHandler.js';
import { formatDateTime } from '../../utils/formatDate.js';

/** Liste des documents d'un dossier (ou courrier). Téléchargement direct. */
export function DocumentList({ dossierId, courrierId, onChanged }) {
  const { toastSuccess, toastError } = useNotification();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState(null);
  const [downloading, setDownloading] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (dossierId) params.dossier_id = dossierId;
      if (courrierId) params.courrier_id = courrierId;
      const rows = await documentService.list(params);
      setDocs(Array.isArray(rows) ? rows : []);
    } catch (e) {
      toastError(e.message);
    } finally {
      setLoading(false);
    }
  }, [dossierId, courrierId, toastError]);

  useEffect(() => {
    Promise.resolve().then(load);
  }, [load]);

  const handleDelete = async () => {
    try {
      await documentService.remove(toDelete.id);
      toastSuccess('Document supprimé.');
      setToDelete(null);
      await load();
      onChanged?.();
    } catch (e) {
      toastError(e.message);
    }
  };

  const handleToggleValide = async (doc) => {
    try {
      await documentService.valider(doc.id, !doc.valide);
      await load();
      onChanged?.();
    } catch (e) {
      toastError(e.message);
    }
  };

  const handleDownload = async (doc) => {
    try {
      setDownloading(doc.id);
      const blob = await documentService.download(doc.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.nom_fichier;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      toastError(e.message);
    } finally {
      setDownloading(null);
    }
  };

  const columns = [
    {
      key: 'nom_fichier',
      label: 'Fichier',
      render: (r) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 shrink-0 text-slate-400" />
          <span className="truncate font-medium text-slate-700">{r.nom_fichier}</span>
        </div>
      ),
    },
    {
      key: 'type_libelle',
      label: 'Type',
      render: (r) => r.type_libelle || '—',
    },
    { key: 'taille', label: 'Taille', render: (r) => formatBytes(r.taille) },
    {
      key: 'upload_par_nom',
      label: 'Déposé par',
      render: (r) => r.upload_par_nom || '—',
    },
    {
      key: 'created_at',
      label: 'Date',
      render: (r) => <span className="text-slate-500">{formatDateTime(r.created_at)}</span>,
    },
    {
      key: 'valide',
      label: 'Statut',
      render: (r) =>
        r.valide ? (
          <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="mr-1 h-3 w-3" /> Validé
          </Badge>
        ) : (
          <Badge className="border-slate-200 bg-slate-50 text-slate-500">Non vérifié</Badge>
        ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDownload(r)}
            loading={downloading === r.id}
            title="Télécharger"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleToggleValide(r)} title={r.valide ? 'Marquer non vérifié' : 'Marquer validé'}>
            {r.valide ? (
              <XCircle className="h-4 w-4 text-amber-500" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            )}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setToDelete(r)} title="Supprimer">
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Table columns={columns} data={docs} loading={loading} emptyLabel="Aucun document joint" />

      <ConfirmDialog
        open={toDelete !== null}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        danger
        title="Supprimer le document"
        message={`Supprimer définitivement « ${toDelete?.nom_fichier} » ?`}
        confirmLabel="Supprimer"
      />
    </>
  );
}

export default DocumentList;
