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

/** Taille maximale d'un document : 5 Mo (§5.3 du cahier des charges). */
const TAILLE_MAX = 5 * 1024 * 1024;
/** Longueur maximale d'un nom de fichier (§5.1). */
const NOM_MAX = 255;

/** Formate une taille en octets pour l'affichage. */
const fmtTaille = (octets) => {
  if (!octets) return '0 Ko';
  if (octets < 1024) return `${octets} o`;
  if (octets < 1024 * 1024) return `${(octets / 1024).toFixed(1)} Ko`;
  return `${(octets / 1024 / 1024).toFixed(1)} Mo`;
};

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
  const [description, setDescription] = useState('');
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
    /* Contrôle de taille (§5.3) : 5 Mo maximum, avant même l'envoi. */
    if (f.size > TAILLE_MAX) {
      setError({
        message: `Fichier trop volumineux : ${fmtTaille(f.size)} (maximum 5 Mo).`,
      });
      setFile(null);
      e.target.value = '';
      return;
    }
    /* Nom de fichier : 255 caractères maximum (§5.1). */
    if (f.name.length > NOM_MAX) {
      setError({
        message: 'Nom de fichier trop long (255 caractères maximum).',
      });
      setFile(null);
      e.target.value = '';
      return;
    }
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
      if (description) fd.append('description', description);
      await documentService.upload(fd);
      toastSuccess(`Document « ${file.name} » joint.`);
      setFile(null);
      setTypeId('');
      setDescription('');
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
              <span className="block space-y-1">
                <p className="text-sm font-medium text-primary-600">{file.name}</p>
                <p className="text-xs text-slate-400">
                  {fmtTaille(file.size)} — {file.type || 'type inconnu'}
                </p>
              </span>
            ) : (
              <p className="text-sm text-slate-500">
                Cliquez pour choisir un fichier (PDF, image, Word, Excel — 5 Mo max)
              </p>
            )}
          </label>
          {/* Description du document (§5.4) : 500 caractères, compteur. */}
          <div className="space-y-1">
            <label
              htmlFor="doc-description"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Description
            </label>
            <textarea
              id="doc-description"
              rows={2}
              maxLength={500}
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 500))}
              onKeyDown={(e) => {
                if (description.length >= 500 && e.key.length === 1) e.preventDefault();
              }}
              placeholder="Précisions sur ce document…"
              className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <p
              className={`text-right text-xs ${
                description.length >= 450 ? 'text-red-500' : 'text-slate-400'
              }`}
            >
              {description.length}/500
            </p>
          </div>
        </form>
      </Modal>
    </>
  );
}

export default DocumentUpload;