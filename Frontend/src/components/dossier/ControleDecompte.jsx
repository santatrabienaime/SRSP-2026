import { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, ThumbsUp, Undo2, Loader2 } from 'lucide-react';
import { dossierService } from '../../services/dossierService.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useNotification } from '../../hooks/useNotification.js';
import { Card } from '../ui/Card.jsx';
import { Button } from '../ui/Button.jsx';
import { Textarea } from '../ui/Textarea.jsx';
import { Alert } from '../ui/Alert.jsx';
import { Badge } from '../ui/Badge.jsx';

const CHECKS = [
  { key: 'calculs_verifies', label: 'Calculs vérifiés' },
  { key: 'pieces_justificatives', label: 'Pièces justificatives présentes' },
  { key: 'certificat_cessation', label: 'Certificat de cessation valide' },
];

/** Contrôle du décompte par le Chef de Division Solde (controler_decomptes). */
export function ControleDecompte({ dossierId }) {
  const { hasPermission } = useAuth();
  const canControl = hasPermission('controler_decomptes');
  const toast = useNotification();

  const [historique, setHistorique] = useState([]);
  const [checks, setChecks] = useState({});
  const [observation, setObservation] = useState('');
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setHistorique(await dossierService.getControleDecompte(dossierId) || []);
    } catch (e) { setError(e); }
  }, [dossierId]);

  useEffect(() => { load(); }, [load]);

  const decide = async (decision) => {
    setSaving(true);
    setError(null);
    try {
      await dossierService.saveControleDecompte(dossierId, {
        decision, observation, ...checks,
      });
      setChecks({});
      setObservation('');
      await load();
      toast?.toastSuccess?.(
        decision === 'APPROUVE' ? 'Décompte approuvé.' : 'Décompte retourné.'
      );
    } catch (e) { setError(e); } finally { setSaving(false); }
  };

  const dernier = historique[0];

  return (
    <Card
      title="Contrôle du décompte"
      subtitle="Vérification avant validation par le Chef de Service"
      actions={
        dernier && (
          <Badge className={dernier.decision === 'APPROUVE'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
            : 'border-amber-200 bg-amber-50 text-amber-700'}>
            {dernier.decision === 'APPROUVE' ? 'Approuvé' : 'Retourné'}
          </Badge>
        )
      }
    >
      {error && <Alert type="error" title="Contrôle refusé">{error.message}</Alert>}

      {canControl && (
        <div className="space-y-4">
          <ul className="space-y-2">
            {CHECKS.map((c) => (
              <li key={c.key}>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={!!checks[c.key]}
                    onChange={(e) =>
                      setChecks((s) => ({ ...s, [c.key]: e.target.checked }))}
                    className="h-4 w-4 rounded border-slate-300 text-primary-600"
                  />
                  {c.label}
                </label>
              </li>
            ))}
          </ul>

          <Textarea
            label="Observation"
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
            placeholder="Obligatoire pour un retour"
            rows={3}
          />

          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={saving}
              onClick={() => decide('RETOURNE')}
            >
              <Undo2 className="h-4 w-4" /> Retourner pour correction
            </Button>
            <Button type="button" disabled={saving} onClick={() => decide('APPROUVE')}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsUp className="h-4 w-4" />}
              Approuver
            </Button>
          </div>
        </div>
      )}

      {!canControl && (
        <p className="text-sm text-slate-400">
          Seul le Chef de Division Solde peut contrôler un décompte.
        </p>
      )}

      {historique.length > 0 && (
        <div className="mt-4 border-t border-slate-100 pt-3">
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5" /> Contrôles effectués
          </p>
          <ul className="space-y-2">
            {historique.map((c) => (
              <li key={c.id} className="text-sm">
                <span className={c.decision === 'APPROUVE'
                  ? 'font-semibold text-emerald-700'
                  : 'font-semibold text-amber-700'}>
                  {c.decision === 'APPROUVE' ? 'Approuvé' : 'Retourné'}
                </span>
                {c.observation ? ` — ${c.observation}` : ''}
                <span className="ml-2 text-xs text-slate-400">
                  {new Date(c.date_controle).toLocaleString('fr-FR')}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

export default ControleDecompte;
