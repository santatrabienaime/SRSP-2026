import { useState, useEffect, useCallback } from 'react';
import { Wallet, Plus, CheckCircle2, XCircle } from 'lucide-react';
import { administratifService } from '../../services/administratifService.js';
import { useNotification } from '../../hooks/useNotification.js';
import { Table } from '../../components/ui/Table.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Select } from '../../components/ui/Select.jsx';
import { Textarea } from '../../components/ui/Textarea.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Alert } from '../../components/ui/Alert.jsx';

const MODES = {
  VIREMENT: 'Virement',
  CHEQUE: 'Chèque',
  ESPECES: 'Espèces',
  MANDAT: 'Mandat',
};

const STATUTS = {
  EN_ATTENTE: { label: 'En attente', classe: 'border-amber-200 bg-amber-50 text-amber-700' },
  APPROUVE: { label: 'Approuvé', classe: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  REJETE: { label: 'Rejeté', classe: 'border-red-200 bg-red-50 text-red-700' },
};

const VIDE = { immatriculation_id: '', mode: 'VIREMENT', banque: '', compte_bancaire: '', motif: '', pieces_verifiees: false };

/**
 * Changements de mode de paiement.
 *
 * Le motif est obligatoire : c'est une décision qui change où va l'argent d'un
 * fonctionnaire, et une décision sans motif ne peut être ni expliquée plus tard
 * ni auditée.
 *
 * Un virement exige banque et compte. La règle est vérifiée côté serveur ET
 * affichée ici : sans elle, la Coordinatrice remplit le formulaire, l'envoie,
 * et n'apprend qu'après coup que sa saisie était incomplète.
 *
 * À l'approbation, les demandes en attente concurrentes de la même personne
 * sont automatiquement rejetées : sans cela, deux demandes approuvables
 * pourraient coexist et la première deviendrait muette, envoyant le virement
 * vers un compte périmé sans que personne ne s'en aperçoive.
 */
export function PaiementsPage() {
  const { toastSuccess, toastError } = useNotification();
  const [rows, setRows] = useState([]);
  const [immatriculations, setImmatriculations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statut, setStatut] = useState('EN_ATTENTE');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(VIDE);
  const [erreurs, setErreurs] = useState({});
  const [decision, setDecision] = useState(null);
  const [observations, setObservations] = useState('');
  const [piecesVerifiees, setPiecesVerifiees] = useState(false);

  const charger = useCallback(async () => {
    try {
      setLoading(true);
      setRows(await administratifService.paiements.lister({ statut: statut || undefined }));
    } catch (e) {
      toastError(e.message);
    } finally {
      setLoading(false);
    }
  }, [statut, toastError]);

  useEffect(() => { charger(); }, [charger]);

  useEffect(() => {
    administratifService.immatriculations.lister().then((l) => {
      setImmatriculations(Array.isArray(l) ? l : []);
    }).catch(() => {});
  }, []);

  const set = (champ) => (e) => setForm((f) => ({ ...f, [champ]: e.target.value }));
  const ouvrir = () => { setForm(VIDE); setErreurs({}); setModal(true); };

  const enregistrer = async () => {
    const e = {};
    if (!form.immatriculation_id) e.immatriculation_id = 'Choisissez un fonctionnaire';
    if (!form.motif.trim() || form.motif.trim().length < 5) {
      e.motif = 'Le motif est requis (5 caractères minimum)';
    }
    // Contrôle miroir du serveur : le voucher n'a pas de compte.
    if (form.mode === 'VIREMENT') {
      if (!form.compte_bancaire.trim()) e.compte_bancaire = 'Un virement exige un numéro de compte';
      if (!form.banque.trim()) e.banque = 'Un virement exige le nom de la banque';
    }
    setErreurs(e);
    if (Object.keys(e).length) return;

    setSaving(true);
    try {
      await administratifService.paiements.creer({
        ...form,
        immatriculation_id: Number(form.immatriculation_id),
        banque: form.banque || null,
        compte_bancaire: form.compte_bancaire || null,
        pieces_verifiees: form.pieces_verifiees,
      });
      toastSuccess('Demande de changement de paiement enregistrée.');
      setModal(false);
      await charger();
    } catch (err) {
      toastError(err.details?.[0] || err.message);
    } finally {
      setSaving(false);
    }
  };

  const traiter = async () => {
    if (!decision) return;
    // Le contrôle des pièces est obligatoire pour approuver (document 4.3).
    if (decision.statut === 'APPROUVE' && !piecesVerifiees) {
      toastError('Cochez « Pièces justificatives contrôlées » avant d\'approuver.');
      return;
    }
    setSaving(true);
    try {
      await administratifService.paiements.traiter(decision.id, decision.statut, observations);
      toastSuccess(decision.statut === 'APPROUVE'
        ? 'Changement approuvé. Les demandes concurrentes ont été rejetées.'
        : 'Changement rejeté.');
      setDecision(null);
      setObservations('');
      await charger();
    } catch (e) {
      toastError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const colonnes = [
    { key: 'numero', label: 'N° immatriculation', render: (r) => <span className="font-semibold text-slate-800">{r.numero}</span> },
    { key: 'nom', label: 'Fonctionnaire', render: (r) => <span className="text-slate-700">{r.nom} {r.prenom}</span> },
    { key: 'mode', label: 'Mode demandé', render: (r) => <span className="text-slate-700">{MODES[r.mode] || r.mode}</span> },
    { key: 'banque', label: 'Banque / Compte', render: (r) => <span className="text-slate-600">{r.compte_bancaire ? `${r.banque || '—'} · ${r.compte_bancaire}` : '—'}</span> },
    { key: 'motif', label: 'Motif', render: (r) => <p className="max-w-xs truncate text-slate-600">{r.motif}</p> },
    { key: 'pieces', label: 'Pièces', render: (r) => <span className={r.pieces_verifiees ? 'text-emerald-700' : 'text-slate-400'}>{r.pieces_verifiees ? 'Contrôlées' : 'Non contrôlées'}</span> },
    {
      key: 'statut',
      label: 'Statut',
      render: (r) => {
        const s = STATUTS[r.statut] || { label: r.statut, classe: 'border-slate-200 bg-slate-50 text-slate-600' };
        return <Badge className={s.classe}>{s.label}</Badge>;
      },
    },
    {
      key: 'actions',
      label: '',
      render: (r) => (r.statut === 'EN_ATTENTE' ? (
        <div className="flex gap-1">
          <Button size="sm" onClick={() => { setDecision({ ...r, statut: 'APPROUVE' }); setObservations(''); setPiecesVerifiees(false); }}>
            <CheckCircle2 className="h-3.5 w-3.5" /> Approuver
          </Button>
          <Button size="sm" variant="ghost" onClick={() => { setDecision({ ...r, statut: 'REJETE' }); setObservations(''); setPiecesVerifiees(false); }}>
            <XCircle className="h-3.5 w-3.5" /> Rejeter
          </Button>
        </div>
      ) : null),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-slate-800">
            <Wallet className="h-5 w-5 text-primary-600" /> Modes de paiement
          </h1>
          <p className="text-sm text-slate-500">
            Un fonctionnaire ne peut avoir qu'un mode de paiement actif à la fois.
          </p>
        </div>
        <Button onClick={ouvrir} disabled={immatriculations.length === 0}>
          <Plus className="h-4 w-4" /> Nouvelle demande
        </Button>
      </div>

      <Card title="Filtrer">
        <Select label="Statut" value={statut} onChange={(e) => setStatut(e.target.value)} className="sm:w-64">
          <option value="">Tous</option>
          {Object.entries(STATUTS).map(([cle, s]) => <option key={cle} value={cle}>{s.label}</option>)}
        </Select>
      </Card>

      <Card title={`Demandes (${rows.length})`}>
        <Table columns={colonnes} data={rows} loading={loading} emptyLabel="Aucune demande de changement de paiement." />
      </Card>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Nouvelle demande de changement de paiement"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(false)}>Annuler</Button>
            <Button onClick={enregistrer} loading={saving}>Enregistrer la demande</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select label="Fonctionnaire" required value={form.immatriculation_id} onChange={set('immatriculation_id')} error={erreurs.immatriculation_id}>
            <option value="">Sélectionner…</option>
            {immatriculations.map((i) => (
              <option key={i.id} value={i.id}>{i.nom} {i.prenom} — {i.numero}</option>
            ))}
          </Select>

          <Select label="Mode demandé" required value={form.mode} onChange={set('mode')}>
            {Object.entries(MODES).map(([cle, label]) => <option key={cle} value={cle}>{label}</option>)}
          </Select>

          {form.mode === 'VIREMENT' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Banque" required value={form.banque} onChange={set('banque')} error={erreurs.banque} placeholder="BNI" />
              <Input label="Numéro de compte" required value={form.compte_bancaire} onChange={set('compte_bancaire')} error={erreurs.compte_bancaire} placeholder="0000123456" />
            </div>
          )}

          <Textarea
            label="Motif"
            required
            rows={3}
            value={form.motif}
            onChange={set('motif')}
            error={erreurs.motif}
            placeholder="Précisez la raison du changement"
          />
        </div>
      </Modal>

      <Modal
        open={!!decision}
        onClose={() => setDecision(null)}
        title={decision?.statut === 'APPROUVE' ? 'Approuver le changement' : 'Rejeter le changement'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDecision(null)}>Annuler</Button>
            <Button onClick={traiter} loading={saving} variant={decision?.statut === 'APPROUVE' ? 'primary' : 'danger'}>
              Confirmer
            </Button>
          </>
        }
      >
        {decision && (
          <div className="space-y-4">
            <div className="rounded-md bg-slate-50 p-3 text-sm">
              <p className="font-semibold text-slate-800">{decision.nom} {decision.prenom}</p>
              <p className="text-slate-600">{decision.numero} — passage au {MODES[decision.mode]?.toLowerCase()}</p>
              <p className="mt-1 text-xs text-slate-500">Motif : {decision.motif}</p>
            </div>
            {decision.statut === 'APPROUVE' && (
              <Alert type="warning" title="Effet sur les autres demandes">
                Les autres demandes en attente de cette personne seront automatiquement
                rejetées, afin qu'une seule décision reste valable.
              </Alert>
            )}
            {decision.statut === 'APPROUVE' && (
              <label className="flex items-start gap-2 rounded-md border border-slate-200 p-3 text-sm">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 accent-primary-600"
                  checked={piecesVerifiees}
                  onChange={(e) => setPiecesVerifiees(e.target.checked)}
                />
                <span>
                  Pièces justificatives contrôlées
                  <span className="block text-[11px] text-slate-500">
                    Obligatoire pour approuver : l\'approbation est refusée par le serveur
                    sans ce contrôle.
                  </span>
                </span>
              </label>
            )}
            <Textarea
              label="Observations de traitement"
              rows={3}
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Précisions sur la décision"
            />
          </div>
        )}
      </Modal>
    </div>
  );
}

export default PaiementsPage;
