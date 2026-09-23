import { useEffect, useState } from 'react';
import { Upload } from 'lucide-react';
import { documentService } from '../../services/documentService.js';
import { referentielService } from '../../services/referentielService.js';
import { useNotification } from '../../hooks/useNotification.js';
import { Button } from '../ui/Button.jsx';
import { Select } from '../ui/Select.jsx';
import { Modal } from '../ui/Modal.jsx';
import { Alert } from '../ui/Alert.jsx';
import { isAllowedExtension } from '../../utils/fileHandler.js';

/**
 * Upload d'un document pour un dossier ou un courrier.
 * Ouvrir via bouton « Joindre un document ».
 */
export function DocumentUpload({ dossierId, courrierId, dossierNumero, onUploaded }) {
  const { toastSuccess, toastError } = useNotification();
  const [open, setOpen] = useState(false);
  const [types, setTypes] = useState([]);
  const [file, setFile] = useState(null);
  const [typeId, setTypeId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    referentielService
      .get()
      .then((ref) => setTypes(ref.types_documents || []))
      .catch(() => {});
  }, []);

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    setError(null);
    if (!f) return setFile(null);
    setFile(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!file) {
      setError({ message: 'Veuillez sélectionner un fichier.' });
      return;
    }
    if (typeId) {
      const t = types.find((x) => x.id === Number(typeId));
      if (t && !isAllowedExtension(file.name, t.extensions_autorisees)) {
        setError({
          message: `Extension non autorisée pour « ${t.libelle} » (${t.extensions_autorisees}).`,
        });
        return;
      }
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('fichier', file);
      if (dossierId) fd.append('dossier_id', String(dossierId));
      if (courrierId) fd.append('courrier_id', String(courrierId));
      if (typeId) fd.append('type_id', String(typeId));
      await documentService.upload(fd);
      toastSuccess(`Document « ${file.name} » joint.`);
      setFile(null);
      setTypeId('');
      setOpen(false);
      onUploaded?.();
    } catch (err) {
      setError(err);
      toastError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <Upload className="h-4 w-4" /> Joindre un document
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={`Joindre un document${dossierNumero ? ` — ${dossierNumero}` : ''}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)} disabled={submitting}>
              Annuler
            </Button>
            <Button type="submit" form="upload-form" loading={submitting}>
              Téléverser
            </Button>
          </>
        }
      >
        {error && (
          <Alert type="error" title="Impossible de joindre le fichier">
            {error.message}
          </Alert>
        )}
        <form id="upload-form" onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Type de document"
            value={typeId}
            onChange={(e) => setTypeId(e.target.value)}
          >
            <option value="">Sans type spécifique</option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.libelle}
              </option>
            ))}
          </Select>
          <label className="block cursor-pointer rounded-md border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center hover:border-primary-400">
            <input
              type="file"
              className="hidden"
              onChange={onFileChange}
              accept=".pdf,.jpg,.jpeg,.png,.docx,.xlsx,.doc,.xls"
            />
            {file ? (
              <p className="text-sm font-medium text-primary-600">{file.name}</p>
            ) : (
              <p className="text-sm text-slate-500">
                Cliquez pour choisir un fichier (PDF, image, Word, Excel)
              </p>
            )}
          </label>
        </form>
      </Modal>
    </>
  );
}

export default DocumentUpload;