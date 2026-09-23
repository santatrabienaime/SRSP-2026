import { Download, FileText, User } from 'lucide-react';
import { Button } from '../ui/Button.jsx';
import { Badge } from '../ui/Badge.jsx';
import { documentService } from '../../services/documentService.js';
import { useNotification } from '../../hooks/useNotification.js';
import { formatBytes } from '../../utils/fileHandler.js';
import { formatDateTime } from '../../utils/formatDate.js';

/** Aperçu détaillé d'un document (affiché en modale). */
export function DownloadPreview({ document }) {
  const { toastError } = useNotification();

  const handleDownload = async () => {
    try {
      const blob = await documentService.download(document.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = document.nom_fichier;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      toastError(e.message);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
          <FileText className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-800">{document.nom_fichier}</p>
          <p className="text-xs text-slate-500">{formatBytes(document.taille)}</p>
        </div>
        {document.valide && (
          <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">Validé</Badge>
        )}
      </div>

      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-slate-500">Type</dt>
          <dd className="text-slate-700">{document.type_libelle || '—'}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">Déposé par</dt>
          <dd className="flex items-center gap-1 text-slate-700">
            <User className="h-3.5 w-3.5" /> {document.upload_par_nom || '—'}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">Date</dt>
          <dd className="text-slate-700">{formatDateTime(document.created_at)}</dd>
        </div>
      </dl>

      <Button className="mt-5 w-full" onClick={handleDownload}>
        <Download className="h-4 w-4" /> Télécharger le fichier
      </Button>
    </div>
  );
}

export default DownloadPreview;