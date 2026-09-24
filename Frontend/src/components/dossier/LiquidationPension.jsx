import { useState, useEffect, useCallback } from 'react';
import { Calculator, Save, Loader2 } from 'lucide-react';
import { dossierService } from '../../services/dossierService.js';
import { useAuth } from '../../hooks/useAuth.js';
import { Card } from '../ui/Card.jsx';
import { Button } from '../ui/Button.jsx';
import { Input } from '../ui/Input.jsx';
import { Alert } from '../ui/Alert.jsx';
import { useNotification } from '../../hooks/useNotification.js';

const fmt = (n) =>
  new Intl.NumberFormat('fr-FR').format(Number(n || 0)) + ' Ar';

const field = 'w-full sm:w-40';

/**
 * Liquidation de pension (division Pension).
 * Pension nette = pension brute - retenues.
 */
export function LiquidationPension({ dossierId }) {
  const { hasPermission } = useAuth();
  const canEdit = hasPermission('liquider_pension');
  const toast = useNotification();

  const [data, setData] = useState(null);
  const [form, setForm] = useState({
    annees_service: '', indice_final: '',
    pension_brute: '', retenues: '', observation: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const l = await dossierService.getLiquidationPension(dossierId);
      setData(l);
      if (l) {
        setForm({
          annees_service: l.annees_service ?? '',
          indice_final: l.indice_final ?? '',
          pension_brute: l.pension_brute ?? '',
          retenues: l.retenues ?? '',
          observation: l.observation ?? '',
        });
      }
    } catch (e) { setError(e); } finally { setLoading(false); }
  }, [dossierId]);

  useEffect(() => { load(); }, [load]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // Aperçu du calcul pendant la saisie (le serveur reste la référence).
  const brute = Number(form.pension_brute || 0);
  const retenues = Number(form.retenues || 0);
  const netteApercu = Math.max(0, brute - retenues);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await dossierService.saveLiquidationPension(dossierId, {
        annees_service: Number(form.annees_service || 0),
        indice_final: form.indice_final ? Number(form.indice_final) : null,
        pension_brute: Number(form.pension_brute),
        retenues: Number(form.retenues),
        observation: form.observation,
      });
      setData(res);
      toast?.toastSuccess?.('Liquidation enregistrée.');
    } catch (err) {
      setError(err);
    } finally { setSaving(false); }
  };

  return (
    <Card
      title="Liquidation de pension"
      subtitle="Calcul de la pension brute, des retenues et de la pension nette"
    >
      {error && <Alert type="error" title="Calcul refusé">{error.message}</Alert>}

      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input label="Années de service" type="number" min="0" max="60"
                 value={form.annees_service} onChange={set('annees_service')}
                 disabled={!canEdit} className={field} />
          <Input label="Indice final" type="number"
                 value={form.indice_final} onChange={set('indice_final')}
                 disabled={!canEdit} className={field} />
          <Input label="Pension brute (Ar)" type="number" min="0"
                 value={form.pension_brute} onChange={set('pension_brute')}
                 disabled={!canEdit} className={field} />
          <Input label="Retenues (Ar)" type="number" min="0"
                 value={form.retenues} onChange={set('retenues')}
                 disabled={!canEdit} className={field} />
        </div>

        <div className="flex flex-wrap items-center gap-4 rounded-md bg-slate-50 px-4 py-3">
          <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Calculator className="h-4 w-4 text-primary-600" />
            Pension nette
          </span>
          <span className="text-lg font-bold text-primary-700">{fmt(netteApercu)}</span>
          {retenues > brute && (
            <span className="text-xs font-medium text-red-600">
              Les retenues dépassent la pension brute.
            </span>
          )}
        </div>

        {canEdit && (
          <>
            <Input label="Observation" value={form.observation}
                   onChange={set('observation')} />
            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {data ? 'Mettre à jour' : 'Enregistrer la liquidation'}
              </Button>
            </div>
          </>
        )}

        {data && (
          <p className="text-xs text-slate-400">
            Dernier calcul enregistré le{' '}
            {new Date(data.date_calcul).toLocaleString('fr-FR')}
            {data.agent ? ` par ${data.agent}` : ''}.
          </p>
        )}
      </form>
    </Card>
  );
}

export default LiquidationPension;
