import { useState, useEffect, useCallback } from 'react';
import {
  Printer, Stamp, Banknote, Plus, Trash2, Loader2, CheckCircle2,
} from 'lucide-react';
import { dossierService } from '../../services/dossierService.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useNotification } from '../../hooks/useNotification.js';
import { Card } from '../ui/Card.jsx';
import { Button } from '../ui/Button.jsx';
import { Input } from '../ui/Input.jsx';
import { Alert } from '../ui/Alert.jsx';
import { Badge } from '../ui/Badge.jsx';

const fmt = (n) => new Intl.NumberFormat('fr-FR').format(Number(n || 0)) + ' Ar';

const ETATS = {
  BROUILLON: 'Brouillon',
  A_ORDONNANCER: 'À ordonnancer',
  ORDONNANCE: 'Ordonnancé',
  LIQUIDE: 'Liquidé',
};

const vide = { nom: '', prenom: '', lien: '', quote_part: '', montant: '' };

/** Mandatement du dossier de secours (Chef de Division Secours). */
export function Mandatement({ dossierId }) {
  const { hasPermission, hasAnyPermission } = useAuth();
  const canPrepare = hasPermission('preparer_mandatement');
  const canOrder = hasPermission('gerer_ordonnancement');
  const toast = useNotification();

  const [data, setData] = useState(null);
  const [montantTotal, setMontantTotal] = useState('');
  const [beneficiaires, setBeneficiaires] = useState([]);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const m = await dossierService.getMandatement(dossierId);
      setData(m);
      if (m) {
        setMontantTotal(m.montant_total ?? '');
        setBeneficiaires(m.beneficiaires || []);
      }
    } catch (e) { setError(e); }
  }, [dossierId]);

  useEffect(() => { load(); }, [load]);

  // Contrôle de cohérence affiché avant envoi (le serveur revérifie).
  const sommeQuotes = beneficiaires.reduce(
    (s, b) => s + (Number(b.quote_part) || 0), 0
  );
  const sommeMontants = beneficiaires.reduce(
    (s, b) => s + (Number(b.montant) || 0), 0
  );
  const quotesOk = Math.abs(sommeQuotes - 100) < 0.01;
  const montantsOk = Number(montantTotal) === sommeMontants;

  const setBenef = (i, key) => (e) =>
    setBeneficiaires((list) =>
      list.map((b, idx) => (idx === i ? { ...b, [key]: e.target.value } : b))
    );

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await dossierService.saveMandatement(dossierId, {
        montant_total: Number(montantTotal),
        beneficiaires: beneficiaires.map((b) => ({
          nom: b.nom,
          prenom: b.prenom,
          lien: b.lien,
          quote_part: Number(b.quote_part),
          montant: Number(b.montant),
        })),
      });
      setData(res);
      toast?.toastSuccess?.('Mandatement enregistré.');
    } catch (e) { setError(e); } finally { setSaving(false); }
  };

  const print = async (code) => {
    try {
      setData(await dossierService.marquerPieceMandatement(dossierId, code));
    } catch (e) { setError(e); }
  };

  const transition = async (etat) => {
    setError(null);
    try {
      const res = etat === 'ORDONNANCE'
        ? await dossierService.ordonnancerMandatement(dossierId)
        : await dossierService.liquiderMandatement(dossierId);
      setData(res);
      toast?.toastSuccess?.(etat === 'ORDONNANCE' ? 'Mandatement ordonnancé.' : 'Mandatement liquidé.');
    } catch (e) { setError(e); }
  };

  return (
    <Card
      title="Mandatement"
      subtitle="Bénéficiaires, pièces à imprimer et chaîne d'ordonnancement"
      actions={
        data && (
          <Badge className={data.etat === 'LIQUIDE'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
            : 'border-sky-200 bg-sky-50 text-sky-700'}>
            {ETATS[data.etat] || data.etat}
          </Badge>
        )
      }
    >
      {error && <Alert type="error" title="Action refusée">{error.message}</Alert>}

      {canPrepare ? (
        <div className="space-y-4">
          <Input
            label="Montant total du secours (Ar)"
            type="number" min="0"
            value={montantTotal}
            onChange={(e) => setMontantTotal(e.target.value)}
          />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Bénéficiaires
              </h4>
              <Button
                type="button" size="sm" variant="secondary"
                onClick={() => setBeneficiaires((l) => [...l, { ...vide }])}
              >
                <Plus className="h-3.5 w-3.5" /> Ajouter
              </Button>
            </div>

            {beneficiaires.length === 0 && (
              <p className="text-sm text-slate-400">Aucun bénéficiaire enregistré.</p>
            )}

            {beneficiaires.map((b, i) => (
              <div key={i} className="grid gap-2 rounded-md border border-slate-200 p-2 sm:grid-cols-6">
                <Input className="sm:col-span-2" label="Nom" value={b.nom} onChange={setBenef(i, 'nom')} />
                <Input label="Prénom" value={b.prenom} onChange={setBenef(i, 'prenom')} />
                <Input label="Lien" value={b.lien} onChange={setBenef(i, 'lien')} />
                <Input label="Quote-part %" type="number" min="0" max="100"
                       value={b.quote_part} onChange={setBenef(i, 'quote_part')} />
                <Input label="Montant (Ar)" type="number" min="0"
                       value={b.montant} onChange={setBenef(i, 'montant')} />
                <div className="flex items-end pb-1">
                  <Button
                    type="button" size="sm" variant="ghost"
                    onClick={() => setBeneficiaires((l) => l.filter((_, idx) => idx !== i))}
                    title="Retirer ce bénéficiaire"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}

            {beneficiaires.length > 0 && (
              <div className="flex flex-wrap gap-4 rounded-md bg-slate-50 px-3 py-2 text-sm">
                <span className={quotesOk ? 'text-emerald-700' : 'text-red-600'}>
                  Quotes-parts : {sommeQuotes} %
                  {quotesOk ? ' ✓' : ' (doivent totaliser 100 %)'}
                </span>
                <span className={montantsOk ? 'text-emerald-700' : 'text-red-600'}>
                  Somme : {fmt(sommeMontants)} / {fmt(montantTotal)}
                  {montantsOk ? ' ✓' : ' (incompatible)'}
                </span>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                type="button" onClick={save} disabled={saving}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Stamp className="h-4 w-4" />}
                Enregistrer le mandatement
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-400">
          Seul le Chef de Division Secours peut préparer le mandatement.
        </p>
      )}

      {data?.pieces?.length > 0 && (
        <div className="mt-5 border-t border-slate-100 pt-4">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Pièces du mandatement
          </h4>
          <ul className="grid gap-2 sm:grid-cols-2">
            {data.pieces.map((p) => (
              <li key={p.code}
                  className="flex items-center justify-between gap-2 rounded-md border border-slate-200 px-3 py-2">
                <span className="flex items-center gap-2 text-sm text-slate-700">
                  {p.imprimee
                    ? <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    : <Printer className="h-4 w-4 text-slate-400" />}
                  {p.libelle}
                </span>
                {canPrepare && !p.imprimee && (
                  <Button type="button" size="sm" variant="secondary"
                          onClick={() => print(p.code)}>
                    Générer
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {canOrder && data && data.etat !== 'LIQUIDE' && (
        <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
          {data.etat !== 'ORDONNANCE' && (
            <Button type="button" onClick={() => transition('ORDONNANCE')}>
              <Stamp className="h-4 w-4" /> Ordonnancer
            </Button>
          )}
          {data.etat === 'ORDONNANCE' && (
            <Button type="button" onClick={() => transition('LIQUIDE')}>
              <Banknote className="h-4 w-4" /> Liquider
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}

export default Mandatement;
