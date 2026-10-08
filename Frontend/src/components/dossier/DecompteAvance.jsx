import { useState, useEffect, useCallback } from 'react';
import { Calculator, Save, Loader2 } from 'lucide-react';
import { dossierService } from '../../services/dossierService.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useNotification } from '../../hooks/useNotification.js';
import { Card } from '../ui/Card.jsx';
import { Button } from '../ui/Button.jsx';
import { Input } from '../ui/Input.jsx';
import { Alert } from '../ui/Alert.jsx';
import { AmountInput, NumberInput } from '../fields/index.jsx';

const fmt = (n) =>
  new Intl.NumberFormat('fr-FR').format(parseMontant(n)) + ' Ar';
const field = 'w-full sm:w-40';

/** Extrait la valeur numérique d'un montant formaté (« 1 500 000 »). */
function parseMontant(v) {
  return Number(String(v || '').replace(/\D/g, '') || 0);
}

/**
 * Décompte d'avance (division Solde).
 * net à payer = salaire mensuel - retenue mensuelle
 * reste à rembourser = avance demandée - (retenue × mois déjà remboursés)
 */
export function DecompteAvance({ dossierId }) {
  const { hasPermission } = useAuth();
  const canEdit = hasPermission('calculer_avances');
  const toast = useNotification();

  const [data, setData] = useState(null);
  const [form, setForm] = useState({
    salaire_mensuel: '', indice: '', echelon: '',
    avance_demandee: '', retenue_mensuelle: '',
    duree_mois: '', mois_rembourses: '', observation: '',
  });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const d = await dossierService.getDecompteAvance(dossierId);
      setData(d);
      if (d) {
        setForm({
          salaire_mensuel: d.salaire_mensuel ?? '',
          indice: d.indice ?? '',
          echelon: d.echelon ?? '',
          avance_demandee: d.avance_demandee ?? '',
          retenue_mensuelle: d.retenue_mensuelle ?? '',
          duree_mois: d.duree_mois ?? '',
          mois_rembourses: d.mois_rembourses ?? '',
          observation: d.observation ?? '',
        });
      }
    } catch (e) { setError(e); }
  }, [dossierId]);

  useEffect(() => { Promise.resolve().then(load); }, [load]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  /** Setter pour les composants de champ (valeur formatée). */
  const setVal = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const salaire = parseMontant(form.salaire_mensuel);
  const retenue = parseMontant(form.retenue_mensuelle);
  const avance = parseMontant(form.avance_demandee);
  const mois = Number(form.mois_rembourses || 0);
  const net = Math.max(0, salaire - retenue);
  const reste = Math.max(0, avance - retenue * mois);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await dossierService.saveDecompteAvance(dossierId, {
        salaire_mensuel: parseMontant(form.salaire_mensuel),
        indice: form.indice === '' ? null : Number(form.indice),
        echelon: form.echelon === '' ? null : Number(form.echelon),
        avance_demandee: parseMontant(form.avance_demandee),
        retenue_mensuelle: parseMontant(form.retenue_mensuelle),
        duree_mois: Number(form.duree_mois),
        mois_rembourses: Number(form.mois_rembourses),
        observation: form.observation,
      });
      setData(res);
      toast?.toastSuccess?.('Décompte enregistré.');
    } catch (err) { setError(err); } finally { setSaving(false); }
  };

  return (
    <Card
      title="Décompte d'avance"
      subtitle="Calcul du net à payer ce mois et du reste à rembourser"
    >
      {error && <Alert type="error" title="Calcul refusé">{error.message}</Alert>}

      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <AmountInput label="Salaire mensuel (Ar)"
                 value={form.salaire_mensuel} onChange={setVal('salaire_mensuel')}
                 disabled={!canEdit} className={field} />
          <NumberInput label="Indice"
                 value={form.indice} onChange={setVal('indice')}
                 disabled={!canEdit} className={field} />
          <NumberInput label="Échelon"
                 value={form.echelon} onChange={setVal('echelon')}
                 disabled={!canEdit} className={field} />
          <AmountInput label="Avance demandée (Ar)"
                 value={form.avance_demandee} onChange={setVal('avance_demandee')}
                 disabled={!canEdit} className={field} />
          <AmountInput label="Retenue mensuelle (Ar)"
                 value={form.retenue_mensuelle} onChange={setVal('retenue_mensuelle')}
                 disabled={!canEdit} className={field} />
          <NumberInput label="Durée (mois)" min={1} max={60}
                 value={form.duree_mois} onChange={setVal('duree_mois')}
                 disabled={!canEdit} className={field} />
          <NumberInput label="Mois déjà remboursés" min={0}
                 value={form.mois_rembourses} onChange={setVal('mois_rembourses')}
                 disabled={!canEdit} className={field} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-md bg-slate-50 px-4 py-3">
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Calculator className="h-4 w-4 text-primary-600" />
              Net à payer ce mois
            </span>
            <span className="text-lg font-bold text-primary-700">{fmt(net)}</span>
          </div>
          <div className="flex items-center justify-between rounded-md bg-slate-50 px-4 py-3">
            <span className="text-sm font-semibold text-slate-700">Reste à rembourser</span>
            <span className="text-lg font-bold text-amber-700">{fmt(reste)}</span>
          </div>
        </div>

        {canEdit && (
          <>
            <Input label="Observation" maxLength={1000}
                   value={form.observation}
                   onChange={set('observation')} />
            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {data ? 'Mettre à jour' : 'Enregistrer le décompte'}
              </Button>
            </div>
          </>
        )}

        {data && (
          <p className="text-xs text-slate-400">
            Dernier calcul enregistré le{' '}
            {new Date(data.date_calcul).toLocaleString('fr-FR')}.
          </p>
        )}
      </form>
    </Card>
  );
}

export default DecompteAvance;
