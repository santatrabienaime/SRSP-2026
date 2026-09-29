import { useState, useEffect, useCallback } from 'react';
import { FileCheck2, Plus, CheckCircle2, XCircle } from 'lucide-react';
import { administratifService } from '../../services/administratifService.js';
import { useNotification } from '../../hooks/useNotification.js';
import { Table } from '../../components/ui/Table.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Select } from '../../components/ui/Select.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { formatDateString } from '../../utils/formatDate.js';

const STATUTS = {
  A_INSERER: { label: 'À insérer', classe: 'border-amber-200 bg-amber-50 text-amber-700' },
  INSERE: { label: 'Inséré', classe: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  REJETE: { label: 'Rejeté', classe: 'border-red-200 bg-red-50 text-red-700' },
};

const VIDE = {
  immatriculation_id: '', matricule_augure: '', situation_familiale: '',
  adresse: '', telephone: '', date_naissance: '', indice_base: '', salaire_base: '', observations: '',
};

/**
 * Insertions Augure.
 *
 * Augure est le logiciel de la fonction publique : ce que la Coordinatrice saisit
 * ici est ce qu'elle devra y ressaisir. L'écran sert donc de préparation et de
 * suivi, pas de substitution — d'où la distinction entre « à insérer » et
 * « inséré », et le fait que marquer « inséré » enregistre QUI l'a fait et QUAND.
 *
 * Une personne ne peut avoir qu'une fiche d'insertion : le serveur refuse la
 * seconde en 409, et l'interface le dit plutôt que d'échouer sur une erreur.
 */
export function AugurePage() {
  const { toastSuccess, toastError } = useNotification();
  const [rows, setRows] = useState([]);
  const [immatriculations, setImmatriculations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statut, setStatut] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(VIDE);
  const [erreurs, setErreurs] = useState({});

  const charger = useCallback(async () => {
    try {
      setLoading(true);
      setRows(await administratifService.augure.lister({ statut: statut || undefined }));
    } catch (e) {
      toastError(e.message);
    } finally {
      setLoading(false);
    }
  }, [statut, toastError]);

  useEffect(() => { charger(); }, [charger]);

  const ouvrir = () => { setForm(VIDE); setErreurs({}); setModal(true); };
  const set = (champ) => (e) => setForm((f) => ({ ...f, [champ]: e.target.value }));

  const enregistrer = async () => {
    const e = {};
    if (!form.immatriculation_id) e.immatriculation_id = 'Choisissez un fonctionnaire';
    if (form.telephone && !/^[+0-9\s.-]{6,30}$/.test(form.telephone)) {
      e.telephone = 'Téléphone : uniquement chiffres, espaces et + . -';
    }
    if (form.salaire_base !== '' && Number(form.salaire_base) <= 0) {
      e.salaire_base = 'Le salaire doit être positif';
    }
    setErreurs(e);
    if (Object.keys(e).length) return;

    setSaving(true);
    try {
      await administratifService.augure.creer({
        ...form,
        immatriculation_id: Number(form.immatriculation_id),
        indice_base: form.indice_base === '' ? null : Number(form.indice_base),
        salaire_base: form.salaire_base === '' ? null : Number(form.salaire_base),
        date_naissance: form.date_naissance || null,
      });
      toastSuccess('Insertion Augure préparée.');
      setModal(false);
      await charger();
    } catch (err) {
      // 409 = cette personne a déjà une fiche. Le dire en clair évite que
      // l'agent croie à une panne.
      toastError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const marquer = async (ligne, nouveau) => {
    try {
      await administratifService.augure.modifier(ligne.id, {
        statut: nouveau,
        ...(nouveau === 'INSERE' ? { matricule_augure: ligne.matricule_augure } : {}),
      });
      toastSuccess(nouveau === 'INSERE' ? 'Insertion marquée comme faite.' : 'Insertion rejetée.');
      await charger();
    } catch (e) {
      toastError(e.message);
    }
  };

  // Seules les personnes sans fiche peuvent être choisies : proposer celles
  // qui en ont déjà une ne ferait qu'amener à un refus.
  const dejaPresentes = new Set(rows.map((r) => r.immatriculation_id));
  const choix = immatriculations.filter((i) => !dejaPresentes.has(i.id));

  const colonnes = [
    { key: 'numero', label: 'N° immatriculation', render: (r) => <span className="font-semibold text-slate-800">{r.numero}</span> },
    { key: 'nom', label: 'Fonctionnaire', render: (r) => <span className="text-slate-700">{r.nom} {r.prenom}</span> },
    { key: 'matricule_augure', label: 'Matricule Augure', render: (r) => <span className="text-slate-600">{r.matricule_augure || '—'}</span> },
    { key: 'indice_base', label: 'Indice', render: (r) => <span className="text-slate-600">{r.indice_base || '—'}</span> },
    { key: 'salaire_base', label: 'Salaire de base', render: (r) => <span className="text-slate-600">{r.salaire_base ? Number(r.salaire_base).toLocaleString('fr-FR') : '—'}</span> },
    { key: 'date_naissance', label: 'Naissance', render: (r) => <span className="whitespace-nowrap text-slate-500">{formatDateString(r.date_naissance)}</span> },
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
      render: (r) => (r.statut === 'A_INSERER' ? (
        <div className="flex gap-1">
          <Button size="sm" onClick={() => marquer(r, 'INSERE')}>
            <CheckCircle2 className="h-3.5 w-3.5" /> Inséré
          </Button>
          <Button size="sm" variant="ghost" onClick={() => marquer(r, 'REJETE')}>
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
            <FileCheck2 className="h-5 w-5 text-primary-600" /> Insertions Augure
          </h1>
          <p className="text-sm text-slate-500">
            Préparation des saisies à reporter dans Augure. Une personne ne peut avoir qu'une fiche.
          </p>
        </div>
        <Button onClick={ouvrir} disabled={choix.length === 0}>
          <Plus className="h-4 w-4" /> Préparer une insertion
        </Button>
      </div>

      <Card title="Filtrer">
        <Select label="Statut" value={statut} onChange={(e) => setStatut(e.target.value)} className="sm:w-64">
          <option value="">Tous</option>
          {Object.entries(STATUTS).map(([cle, s]) => <option key={cle} value={cle}>{s.label}</option>)}
        </Select>
      </Card>

      <Card title={`Fiches (${rows.length})`}>
        <Table columns={colonnes} data={rows} loading={loading} emptyLabel="Aucune fiche d'insertion." />
      </Card>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Préparer une insertion Augure"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(false)}>Annuler</Button>
            <Button onClick={enregistrer} loading={saving}>Enregistrer</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="Fonctionnaire"
            required
            value={form.immatriculation_id}
            onChange={set('immatriculation_id')}
            error={erreurs.immatriculation_id}
          >
            <option value="">Sélectionner…</option>
            {choix.map((i) => (
              <option key={i.id} value={i.id}>{i.nom} {i.prenom} — {i.numero}</option>
            ))}
          </Select>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Matricule Augure" value={form.matricule_augure} onChange={set('matricule_augure')} placeholder="AUG-7788" />
            <Input label="Situation familiale" value={form.situation_familiale} onChange={set('situation_familiale')} placeholder="Marié" />
            <Input label="Date de naissance" type="date" value={form.date_naissance} onChange={set('date_naissance')} />
            <Input label="Téléphone" value={form.telephone} onChange={set('telephone')} error={erreurs.telephone} placeholder="032 12 345 67" />
            <Input label="Indice de base" type="number" value={form.indice_base} onChange={set('indice_base')} placeholder="450" />
            <Input label="Salaire de base" type="number" value={form.salaire_base} onChange={set('salaire_base')} error={erreurs.salaire_base} placeholder="850000" />
          </div>

          <Input label="Adresse" value={form.adresse} onChange={set('adresse')} placeholder="Manakara" />
        </div>
      </Modal>
    </div>
  );
}

export default AugurePage;
