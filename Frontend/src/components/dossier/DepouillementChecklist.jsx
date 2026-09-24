import { useState, useEffect, useCallback } from 'react';
import { CircleCheck, CircleX, Loader2 } from 'lucide-react';
import { dossierService } from '../../services/dossierService.js';
import { useAuth } from '../../hooks/useAuth.js';
import { Card } from '../ui/Card.jsx';
import { Spinner } from '../ui/Spinner.jsx';
import { Alert } from '../ui/Alert.jsx';
import { Badge } from '../ui/Badge.jsx';
import { formatDateTime } from '../../utils/formatDate.js';

/**
 * Dépouillement des pièces d'un dossier de secours (cahier § Secours).
 * 6 pièces obligatoires : acte de décès, acte de mariage, NSC, NDiv,
 * CIN du défunt, CIN du bénéficiaire.
 */
export function DepouillementChecklist({ dossierId }) {
  const { hasPermission, hasAnyPermission } = useAuth();
  const canControl = hasAnyPermission(['depouiller_pieces', 'gerer_ordonnancement', 'preparer_mandatement']);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setData(await dossierService.getDepouillement(dossierId));
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [dossierId]);

  useEffect(() => {
    load();
  }, [load]);

  const toggle = async (piece, presente, observation) => {
    setSaving(piece.code);
    try {
      const next = await dossierService.saveDepouillement(dossierId, {
        piece: piece.code,
        presente,
        observation,
      });
      setData(next);
    } catch (e) {
      setError(e);
    } finally {
      setSaving(null);
    }
  };

  if (loading) return <Spinner className="py-6" />;
  if (error) {
    return (
      <Alert type="warning" title="Dépouillement indisponible">
        {error.message}
      </Alert>
    );
  }
  if (!data || !data.pieces?.length) return null;

  const { resume } = data;

  return (
    <Card
      title="Dépouillement des pièces"
      subtitle={`${resume.presentes}/${resume.total} pièces présentes`}
      actions={
        <Badge className={resume.complet
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
          : 'border-amber-200 bg-amber-50 text-amber-700'}>
          {resume.complet ? 'Complet' : `${resume.manquantes} manquante(s)`}
        </Badge>
      }
    >
      {resume.manquantes > 0 && (
        <p className="mb-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Pièces manquantes : {resume.pieces_manquantes.join(', ')}
        </p>
      )}

      <ul className="space-y-2">
        {data.pieces.map((piece) => (
          <li
            key={piece.code}
            className="flex items-center gap-3 rounded-md border border-slate-200 px-3 py-2"
          >
            {piece.presente ? (
              <CircleCheck className="h-5 w-5 shrink-0 text-emerald-600" />
            ) : (
              <CircleX className="h-5 w-5 shrink-0 text-red-400" />
            )}

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-700">{piece.libelle}</p>
              {piece.date_controle && (
                <p className="text-xs text-slate-400">
                  Contrôlée le {formatDateTime(piece.date_controle)}
                  {piece.agent ? ` par ${piece.agent}` : ''}
                </p>
              )}
              {piece.observation && (
                <p className="text-xs text-slate-500">{piece.observation}</p>
              )}
            </div>

            {canControl && (
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => toggle(piece, true)}
                  disabled={saving === piece.code}
                  className="rounded-md border border-emerald-300 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                >
                  {saving === piece.code ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Présente'}
                </button>
                <button
                  type="button"
                  onClick={() => toggle(piece, false)}
                  disabled={saving === piece.code}
                  className="rounded-md border border-red-300 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                >
                  Manquante
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}

export default DepouillementChecklist;
