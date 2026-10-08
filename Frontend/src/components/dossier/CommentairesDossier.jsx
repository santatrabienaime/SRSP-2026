import { useState, useEffect, useCallback } from 'react';
import { MessagesSquare, Send, Trash2, Loader2 } from 'lucide-react';
import { dossierService } from '../../services/dossierService.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useNotification } from '../../hooks/useNotification.js';
import { Card } from '../ui/Card.jsx';
import { Button } from '../ui/Button.jsx';
import { Alert } from '../ui/Alert.jsx';
import { Spinner } from '../ui/Spinner.jsx';
import { TextAreaInput } from '../fields/index.jsx';
import { formatDateTime } from '../../utils/formatDate.js';

/**
 * Commentaires internes du dossier (article 2.8).
 * Simple échange de texte entre agents — pas de mention, pas de notification
 * dédiée : le commentaire reste un propos laissé sur le dossier.
 */
export function CommentairesDossier({ dossierId }) {
  const { user } = useAuth();
  const { toastSuccess, toastError } = useNotification();

  const [liste, setListe] = useState([]);
  const [texte, setTexte] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  /* Contrôle de saisie du commentaire (§7.1) : 3 à 1000 caractères. */
  const commentaireErreur = (() => {
    if (!texte) return null;
    if (texte.trim().length < 3) return 'Minimum 3 caractères';
    if (texte.length > 1000) return 'Maximum 1000 caractères';
    return null;
  })();

  const charger = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setListe(await dossierService.getCommentaires(dossierId) || []);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [dossierId]);

  useEffect(() => { Promise.resolve().then(charger); }, [charger]);

  const envoyer = async (e) => {
    e.preventDefault();
    if (!texte.trim()) return;
    if (commentaireErreur) return;
    setSaving(true);
    setError(null);
    try {
      await dossierService.addCommentaire(dossierId, texte);
      setTexte('');
      await charger();
      toastSuccess?.('Commentaire ajouté.');
    } catch (err) {
      setError(err);
      toastError?.(err.message);
    } finally {
      setSaving(false);
    }
  };

  const supprimer = async (id) => {
    try {
      await dossierService.deleteCommentaire(dossierId, id);
      await charger();
    } catch (err) {
      setError(err);
    }
  };

  return (
    <Card
      title="Commentaires internes"
      subtitle="Échanges entre agents sur ce dossier"
      actions={<MessagesSquare className="h-4 w-4 text-slate-400" />}
    >
      {error && <Alert type="error" title="Commentaire">{error.message}</Alert>}

      <form onSubmit={envoyer} className="mb-4 space-y-2">
        <TextAreaInput
          value={texte}
          onChange={setTexte}
          error={commentaireErreur}
          maxLength={1000}
          rows={3}
          placeholder="Écrire un commentaire…"
        />
        <div className="flex items-center justify-end">
          <Button
            type="submit"
            loading={saving}
            disabled={!texte.trim() || Boolean(commentaireErreur)}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Publier
          </Button>
        </div>
      </form>

      {loading ? (
        <Spinner className="py-4" />
      ) : liste.length === 0 ? (
        <p className="py-4 text-center text-sm text-slate-400">
          Aucun commentaire pour le moment.
        </p>
      ) : (
        <ul className="space-y-3">
          {liste.map((c) => (
            <li key={c.id} className="rounded-md border border-slate-200 p-3">
              <div className="mb-1 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-700">
                  {c.email || c.username}
                  {c.auteur_id === user?.id && (
                    <span className="ml-2 text-xs font-normal text-slate-400">(vous)</span>
                  )}
                </p>
                <span className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">
                    {formatDateTime(c.date_creation)}
                  </span>
                  {c.auteur_id === user?.id && (
                    <button
                      type="button"
                      onClick={() => supprimer(c.id)}
                      title="Supprimer ce commentaire"
                      className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </span>
              </div>
              <p className="whitespace-pre-wrap text-sm text-slate-600">{c.contenu}</p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export default CommentairesDossier;
