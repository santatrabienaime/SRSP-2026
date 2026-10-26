import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Upload, Download, Trash2, FileText, RefreshCw, Layers,
} from 'lucide-react';
import { dossierService } from '../../services/dossierService.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useNotification } from '../../hooks/useNotification.js';
import { Card } from '../ui/Card.jsx';
import { Button } from '../ui/Button.jsx';
import { Select } from '../ui/Select.jsx';
import { TextInput, TextAreaInput } from '../fields/index.jsx';
import { Spinner } from '../ui/Spinner.jsx';
import { Alert } from '../ui/Alert.jsx';
import { Badge } from '../ui/Badge.jsx';
import { ConfirmDialog } from '../ui/ConfirmDialog.jsx';
import { formatDateTime } from '../../utils/formatDate.js';

/**
 * Pièces jointes d'un dossier.
 *
 * Le dépôt est un multipart envoyé tel quel : le serveur contrôle l'extension,
 * la taille, le droit d'accès au dossier et l'appartenance de la pièce au
 * type de dossier. Le client refait les deux premiers contrôles —extension et
 * taille— pour éviter un aller-retour inutile, mais il ne fait pas autorité :
 * c'est le serveur qui tranche.
 *
 * Un dépôt ne remplace jamais un fichier : il en devient la version suivante,
 * et la version précédente est conservée. Les versions d'une même pièce sont
 * donc regroupées, de la plus récente à la plus ancienne, et chacune porte le
 * nom de celle qu'elle remplace.
 */

/* Mêmes limites que le serveur (Backend/src/config/multer.js). */
const EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.docx', '.xlsx'];
const TAILLE_MAX = 5 * 1024 * 1024;

/** Taille lisible. */
function poids(octets) {
  if (!octets && octets !== 0) return '—';
  if (octets < 1024) return `${octets} o`;
  if (octets < 1024 * 1024) return `${(octets / 1024).toFixed(0)} Ko`;
  return `${(octets / (1024 * 1024)).toFixed(1)} Mo`;
}

/** Déclenche le téléchargement d'un blob déjà chargé. */
function telecharger(blob, nom) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nom;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export function DocumentsPanel({ dossierId, dossierStatut, pieces = [] }) {
  const { user, hasAnyPermission } = useAuth();
  const { toastSuccess, toastError } = useNotification();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const [aSupprimer, setASupprimer] = useState(null);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);
  const [fichier, setFichier] = useState(null);
  const [pieceCode, setPieceCode] = useState('');
  const [description, setDescription] = useState('');
  const [motif, setMotif] = useState('');
  const [refus, setRefus] = useState(null);
  const inputRef = useRef(null);

  const peutDeposer = hasAnyPermission(['upload_document', 'manage_documents']);
  const archive = dossierStatut === 'ARCHIVE';

  /* Les pièces, regroupées par pièce concernée. Le serveur renvoie déjà la
     liste triée (pièce, puis version décroissante) : on se contente de
     regrouper les lignes qui se suivent, sans réordonner ce qu'il a décidé. */
  const groupes = useMemo(() => {
    const map = new Map();
    for (const doc of documents) {
      const cle = doc.piece_code || '';
      if (!map.has(cle)) map.set(cle, []);
      map.get(cle).push(doc);
    }
    return [...map.entries()];
  }, [documents]);

  /* La pièce choisie a-t-elle déjà été déposée ? Si oui, le prochain dépôt en
     sera une nouvelle version, et le motif du remplacement doit être dit. */
  const pieceDejaDeposee = useMemo(
    () => Boolean(pieceCode) && documents.some((d) => d.piece_code === pieceCode),
    [documents, pieceCode]
  );

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const liste = await dossierService.getDocuments(dossierId);
      setDocuments(Array.isArray(liste) ? liste : []);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [dossierId]);

  useEffect(() => { Promise.resolve().then(load); }, [load]);

  /* Contrôles côté client, doublés du contrôle serveur. Un refus ici
     évite d'envoyer un fichier de 40 Mo pour le voir rejecté. */
  const verifierFichier = (f) => {
    if (!f) return 'Aucun fichier sélectionné.';
    const nom = f.name.toLowerCase();
    if (!EXTENSIONS.some((ext) => nom.endsWith(ext))) {
      return `Extension non autorisée. Formats acceptés : ${EXTENSIONS.join(', ')}.`;
    }
    if (f.size > TAILLE_MAX) {
      return `Fichier trop volumineux (${poids(f.size)}) : la limite est de 5 Mo.`;
    }
    return null;
  };

  const choisirFichier = (e) => {
    const f = e.target.files?.[0] || null;
    setRefus(null);
    if (f) {
      const message = verifierFichier(f);
      if (message) {
        setRefus(message);
        setFichier(null);
        if (inputRef.current) inputRef.current.value = '';
        return;
      }
    }
    setFichier(f);
  };

  const deposer = async () => {
    if (!fichier) return;
    setSending(true);
    setRefus(null);
    try {
      const form = new FormData();
      form.append('fichier', fichier);
      if (pieceCode) form.append('piece_code', pieceCode);
      if (description.trim()) form.append('description', description.trim());
      /* Le motif n'a de sens que pour une nouvelle version : le serveur ne
         l'enregistre d'ailleurs que si le dépôt remplace une pièce déjà
         déposée. */
      if (motif.trim()) form.append('motif_remplacement', motif.trim());
      await dossierService.uploadDocument(dossierId, form);
      toastSuccess(
        pieceDejaDeposee
          ? 'Nouvelle version déposée.'
          : 'Pièce jointe déposée.'
      );
      setFichier(null);
      setPieceCode('');
      setDescription('');
      setMotif('');
      if (inputRef.current) inputRef.current.value = '';
      await load();
    } catch (e) {
      setRefus(e.message);
      toastError(e.message);
    } finally {
      setSending(false);
    }
  };

  const telechargerDocument = async (doc) => {
    try {
      const blob = await dossierService.downloadDocument(dossierId, doc.id);
      telecharger(blob, doc.nom_fichier || `document-${doc.id}`);
    } catch (e) {
      toastError(e.message);
    }
  };

  const supprimerDocument = async () => {
    if (!aSupprimer) return;
    setSuppressionEnCours(true);
    try {
      await dossierService.deleteDocument(dossierId, aSupprimer.id);
      toastSuccess('Pièce jointe supprimée.');
      setASupprimer(null);
      await load();
    } catch (e) {
      toastError(e.message);
    } finally {
      setSuppressionEnCours(false);
    }
  };

  /* Le serveur autorise le déposant, l'administrateur/gestionnaire des
     documents et les profils qui contrôlent ou valident le dossier. Le chef
     de division doit pouvoir retirer un scan erroné ou un doublon ; le bouton
     est donc proposé à ces profils, sans restriction de version. */
  const peutSupprimer = (doc) =>
    hasAnyPermission([
      'manage_documents',
      'verifier_dossier',
      'valider_dossier',
      'depouiller_pieces',
    ]) ||
    (user?.id && Number(doc.upload_par) === Number(user.id));

  return (
    <Card
      title="Pièces jointes"
      subtitle="Fichiers déposés sur ce dossier"
      actions={
        <Button variant="ghost" size="sm" onClick={load} title="Recharger la liste">
          <RefreshCw className="h-4 w-4" />
        </Button>
      }
    >
      {error && (
        <Alert type="warning" title="Pièces jointes indisponibles">
          {error.message}
        </Alert>
      )}

      {peutDeposer && !archive ? (
        <div className="mb-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="mb-3 text-sm font-medium text-slate-700">Déposer une pièce</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor={`fichier-${dossierId}`}
                className="mb-1 block text-xs font-medium text-slate-500"
              >
                Fichier
              </label>
              <input
                id={`fichier-${dossierId}`}
                ref={inputRef}
                type="file"
                onChange={choisirFichier}
                accept={EXTENSIONS.join(',')}
                className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-primary-600 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-primary-700"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                PDF, JPG, PNG, DOCX ou XLSX — 5 Mo maximum.
              </p>
            </div>
            {pieces.length > 0 && (
              <Select
                label="Pièce concernée (facultatif)"
                value={pieceCode}
                onChange={(e) => setPieceCode(e.target.value)}
              >
                <option value="">— Aucune —</option>
                {pieces.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.libelle}
                    {p.obligatoire ? ' (obligatoire)' : ''}
                  </option>
                ))}
              </Select>
            )}
          </div>
          <div className="mt-3">
            <TextAreaInput
              label="Description (facultative)"
              rows={2}
              value={description}
              onChange={setDescription}
              maxLength={500}
              placeholder="Ex. original papier remis au guichet, scan de l'acte notarié…"
            />
          </div>
          {/* Le motif n'apparaît que si la pièce a déjà été déposée : le dépôt
              sera alors une nouvelle version, et le motif dit pourquoi la
              précédente est remplacée. */}
          {pieceDejaDeposee && (
            <div className="mt-3">
              <TextInput
                label="Motif du remplacement"
                value={motif}
                onChange={setMotif}
                maxLength={500}
                placeholder="Ex. scan illisible, remplacée par une copie lisible"
                hint="Ce dépôt devient une nouvelle version de la pièce : dites pourquoi."
              />
            </div>
          )}
          {refus && (
            <p className="mt-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {refus}
            </p>
          )}
          <div className="mt-3">
            <Button onClick={deposer} loading={sending} disabled={!fichier}>
              <Upload className="h-4 w-4" /> Déposer
            </Button>
          </div>
        </div>
      ) : archive ? (
        <p className="mb-4 rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-500">
          Le dossier est archivé : il n'accepte plus de pièce.
        </p>
      ) : (
        <p className="mb-4 rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-500">
          Le dépôt de pièces n'est pas autorisé pour votre profil.
        </p>
      )}

      {loading ? (
        <Spinner className="py-6" />
      ) : documents.length === 0 ? (
        <p className="rounded-md bg-slate-50 px-3 py-4 text-sm text-slate-500">
          Aucune pièce jointe sur ce dossier.
        </p>
      ) : (
        /* Les pièces sont regroupées : une pièce et ses versions ensemble.
           Au sein d'un groupe, la version la plus récente vient en premier
           (ordre du serveur) : c'est elle qui est supprimable. */
        <div className="space-y-4">
          {groupes.map(([code, versions]) => (
            <section key={code || 'sans-piece'}>
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <Layers className="h-3.5 w-3.5 text-slate-400" />
                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {versions[0].piece_libelle || code || 'Pièce sans code'}
                </h4>
                {code && (
                  <Badge className="border-slate-200 bg-slate-50 text-slate-600">
                    {code}
                  </Badge>
                )}
                {versions.length > 1 && (
                  <span className="text-xs text-slate-400">
                    {versions.length} version{versions.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <ul className="divide-y divide-slate-100">
                {versions.map((doc) => (
                  <li key={doc.id} className="flex flex-wrap items-center gap-3 py-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                      <FileText className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {doc.nom_fichier}
                      </p>
                      <p className="truncate text-xs text-slate-400">
                        {[
                          poids(doc.taille),
                          doc.upload_par_nom
                            ? `déposé par ${doc.upload_par_nom}`
                            : doc.upload_par_username,
                          doc.created_at ? formatDateTime(doc.created_at) : null,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                      {doc.description && (
                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          {doc.description}
                        </p>
                      )}
                      {/* La version remplacée est nommée : c'est la trace de ce
                          qui avait été produit avant. */}
                      {doc.remplace_nom_fichier && (
                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          remplace : {doc.remplace_nom_fichier}
                          {doc.remplace_version ? ` (v${doc.remplace_version})` : ''}
                        </p>
                      )}
                      {doc.motif_remplacement && (
                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          Motif : {doc.motif_remplacement}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="border-slate-200 bg-slate-50 text-slate-600">
                        Version {doc.version ?? 1}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => telechargerDocument(doc)}
                        title="Télécharger la pièce"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                      {/* Toutes les versions sont supprimables : un doublon
                          ou un scan erroné doit pouvoir être retiré, même
                          s'il est plus ancien que la version courante. Le
                          journal du dossier conserve la trace. */}
                      {peutSupprimer(doc) && !archive && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setASupprimer(doc)}
                          className="text-red-600 hover:bg-red-50"
                          title="Supprimer la pièce"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={aSupprimer !== null}
        onClose={() => !suppressionEnCours && setASupprimer(null)}
        onConfirm={supprimerDocument}
        loading={suppressionEnCours}
        danger
        title="Supprimer la pièce jointe"
        message={`Supprimer « ${aSupprimer?.nom_fichier || ''} » (version ${aSupprimer?.version ?? 1}) ? Le fichier est retiré du serveur, y compris s'il s'agit d'un doublon ou d'une version antérieure. L'opération est tracée dans l'historique du dossier.`}
        confirmLabel="Supprimer"
      />
    </Card>
  );
}

export default DocumentsPanel;
