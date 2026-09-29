import { useState, useEffect, useCallback } from 'react';
import { BookUser, Plus } from 'lucide-react';
import { administratifService } from '../../services/administratifService.js';
import { referentielService } from '../../services/referentielService.js';
import { useNotification } from '../../hooks/useNotification.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { Table } from '../../components/ui/Table.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Select } from '../../components/ui/Select.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Alert } from '../../components/ui/Alert.jsx';

import { formatDateString } from '../../utils/formatDate.js';

const STATUTS = {
  EN_ATTENTE: { label: 'En attente', classe: 'border-amber-200 bg-amber-50 text-amber-700' },
  ACTIVE: { label: 'Active', classe: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  REJETEE: { label: 'Rejetée', classe: 'border-red-200 bg-red-50 text-red-700' },
};

const VIDE = {
  nom: '', prenom: '', cin: '', date_naissance: '', corps: '', grade: '',
  indice: '', date_entree: '', division_id: '', statut: 'EN_ATTENTE', observations: '',
};

/**
 * Immatriculation des fonctionnaires.
 *
 * Le numéro est généré par le serveur et n'est jamais saisi : un numéro saisi à
 * la main finit par se dupliquer, et l'agent verrait alors une erreur de
 * « doublon » sans comprendre pourquoi.
 *
 * La vérification du CIN est une aide, pas un garde : elle signale un
 * fonctionnaire déjà connu, sans bloquer la saisie. Bloquer empêcherait de
 * réimmatriculer quelqu'un dont la première fiche contenait une erreur.
 */
export function ImmatriculationsPage() {
  const { toastSuccess, toastError } = useNotification();
  const [rows, setRows] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [statut, setStatut] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(VIDE);
  const [erreurs, setErreurs] = useState({});
  const [cinConnu, setCinConnu] = useState(null);
  const debouncedSearch = useDebounce(search, 350);
  const debouncedCin = useDebounce(form.cin, 500);

  const charger = useCallback(async () => {
    try {
      setLoading(true);
      const data = await administratifService.immatriculations.lister({
        search: debouncedSearch || undefined,
        statut: statut || undefined,
      });
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      toastError(e.message);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statut, toastError]);

  useEffect(() => { charger(); }, [charger]);

  useEffect(() => {
    referentielService.get().then((r) => setDivisions(r.divisions || [])).catch(() => {});
  }, []);

  /* Interrogation du CIN pendant la saisie. Silence si aucun résultat : une
     requête par frappe pour rien est un appel réseau inutile. */
  useEffect(() => {
    const cin = (debouncedCin || '').replace(/[\s.-]/g, '');
    if (cin.length < 5 || cin.length > 20) { setCinConnu(null); return; }
    let actif = true;
    administratifService.immatriculations.verifierCIN(debouncedCin)
      .then((r) => { if (actif) setCinConnu(r?.existe ? r : null); })
      .catch(() => { if (actif) setCinConnu(null); });
    return () => { actif = false; };
  }, [debouncedCin]);

  const set = (champ) => (e) => setForm((f) => ({ ...f, [champ]: e.target.value }));

  const ouvrir = () => { setForm(VIDE); setErreurs({}); setCinConnu(null); setModal(true); };
  const fermer = () => { setModal(false); setErreurs({}); setCinConnu(null); };

  /** Validation locale : le serveur revérifie, mais bloquer ici évite l'aller-retour. */
  const valider = () => {
    const e = {};
    if (!form.nom.trim() || form.nom.trim().length < 2) e.nom = 'Le nom est requis (2 caractères minimum)';
    if (!form.prenom.trim() || form.prenom.trim().length < 2) e.prenom = 'Le prénom est requis (2 caractères minimum)';
    if (form.cin) {
      const compact = form.cin.replace(/[\s.-]/g, '');
      if (compact.length < 5 || compact.length > 20 || !/^[A-Za-z0-9]+$/.test(compact)) {
        e.cin = 'Le CIN doit comporter 5 à 20 caractères alphanumériques';
      }
    }
    if (form.date_naissance && form.date_entree && form.date_entree < form.date_naissance) {
      e.date_entree = "La date d'entrée ne peut pas précéder la naissance";
    }
    setErreurs(e);
    return Object.keys(e).length === 0;
  };

  const enregistrer = async () => {
    if (!valider()) return;
    setSaving(true);
    try {
      const cree = await administratifService.immatriculations.creer({
        ...form,
        indice: form.indice === '' ? null : Number(form.indice),
        division_id: form.division_id === '' ? null : Number(form.division_id),
        date_naissance: form.date_naissance || null,
        date_entree: form.date_entree || null,
      });
      toastSuccess(`Immatriculation ${cree.numero} créée.`);
      fermer();
      await charger();
    } catch (e) {
      toastError(e.details?.[0] || e.message);
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'numero', label: 'N° immatriculation', render: (r) => <span className="font-semibold text-slate-800">{r.numero}</span> },
    { key: 'nom', label: 'Fonctionnaire', render: (r) => <span className="text-slate-700">{r.nom} {r.prenom}</span> },
    { key: 'cin', label: 'CIN', render: (r) => <span className="text-slate-600">{r.cin || '—'}</span> },
    { key: 'grade', label: 'Grade / Indice', render: (r) => <span className="text-slate-600">{[r.grade, r.indice].filter((x) => x).join(' · ') || '—'}</span> },
    { key: 'division_nom', label: 'Division', render: (r) => <span className="text-slate-600">{r.division_nom || '—'}</span> },
    { key: 'date_entree', label: 'Entrée', render: (r) => <span className="whitespace-nowrap text-slate-500">{formatDateString(r.date_entree)}</span> },
    {
      key: 'statut',
      label: 'Statut',
      render: (r) => {
        const s = STATUTS[r.statut] || { label: r.statut, classe: 'border-slate-200 bg-slate-50 text-slate-600' };
        return <Badge className={s.classe}>{s.label}</Badge>;
      },
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-slate-800">
            <BookUser className="h-5 w-5 text-primary-600" /> Immatriculations
          </h1>
          <p className="text-sm text-slate-500">
            Le numéro est généré automatiquement à partir du corps et de l'année (ex. 2026-ADM-000001). Un CIN déjà connu est signalé, sans bloquer la saisie.
          </p>
        </div>
        <Button onClick={ouvrir}>
          <Plus className="h-4 w-4" /> Immatriculer
        </Button>
      </div>

      <Card title="Rechercher">
        <div className="grid gap-3 sm:grid-cols-3">
          <Input
            label="Recherche"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Numéro, nom, CIN, corps, grade…"
          />
          <Select label="Statut" value={statut} onChange={(e) => setStatut(e.target.value)}>
            <option value="">Tous</option>
            {Object.entries(STATUTS).map(([cle, s]) => (
              <option key={cle} value={cle}>{s.label}</option>
            ))}
          </Select>
        </div>
      </Card>

      <Card title={`Fonctionnaires (${rows.length})`}>
        <Table columns={columns} data={rows} loading={loading} emptyLabel="Aucune immatriculation." />
      </Card>

      <Modal
        open={modal}
        onClose={fermer}
        title="Immatriculer un fonctionnaire"
        footer={
          <>
            <Button variant="secondary" onClick={fermer}>Annuler</Button>
            <Button onClick={enregistrer} loading={saving}>Créer l'immatriculation</Button>
          </>
        }
      >
        <div className="space-y-4">
          {cinConnu?.existe && (
            <Alert type="warning" title="Ce CIN est déjà connu">
              <ul className="list-inside list-disc text-xs">
                {cinConnu.fiches.map((f) => (
                  <li key={f.id}>{f.numero} — {f.nom} {f.prenom} ({f.statut})</li>
                ))}
              </ul>
              <p className="mt-1 text-[11px]">
                Vous pouvez continuer : une réimmatriculation reste possible après une erreur de saisie.
              </p>
            </Alert>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Nom" required value={form.nom} onChange={set('nom')} error={erreurs.nom} placeholder="RAKOTO" />
            <Input label="Prénom" required value={form.prenom} onChange={set('prenom')} error={erreurs.prenom} placeholder="Jean" />
            <Input label="CIN" value={form.cin} onChange={set('cin')} error={erreurs.cin} placeholder="101 234 567 890" />
            <Input label="Date de naissance" type="date" value={form.date_naissance} onChange={set('date_naissance')} />
            <Input label="Corps" value={form.corps} onChange={set('corps')} placeholder="Administration" />
            <Input label="Grade" value={form.grade} onChange={set('grade')} placeholder="A2" />
            <Input label="Indice" type="number" value={form.indice} onChange={set('indice')} placeholder="450" />
            <Input label="Date d'entrée" type="date" value={form.date_entree} onChange={set('date_entree')} error={erreurs.date_entree} />
            <Select label="Division" value={form.division_id} onChange={set('division_id')}>
              <option value="">Aucune (service central)</option>
              {divisions.map((d) => <option key={d.id} value={d.id}>{d.nom}</option>)}
            </Select>
            <Select label="Statut" value={form.statut} onChange={set('statut')}>
              {Object.entries(STATUTS).map(([cle, s]) => <option key={cle} value={cle}>{s.label}</option>)}
            </Select>
          </div>

          <Input label="Observations" value={form.observations} onChange={set('observations')} placeholder="Précisions éventuelles" />
        </div>
      </Modal>
    </div>
  );
}

export default ImmatriculationsPage;
