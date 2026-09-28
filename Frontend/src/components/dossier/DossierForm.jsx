import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { dossierService } from '../../services/dossierService.js';
import { referentielService } from '../../services/referentielService.js';
import { divisionService } from '../../services/divisionService.js';
import { Button } from '../ui/Button.jsx';
import { Input } from '../ui/Input.jsx';
import { Select } from '../ui/Select.jsx';
import { Textarea } from '../ui/Textarea.jsx';
import { Alert } from '../ui/Alert.jsx';
import { todayISO } from '../../utils/formatDate.js';
import { useNotification } from '../../hooks/useNotification.js';
import { CheckCircle2 } from 'lucide-react';

/**
 * Formulaire de création / modification d'un dossier.
 *  - initial : dossier existant (mode édition) ou null (mode création)
 *  - onSaved  : callback(createdId) après enregistrement
 */
export function DossierForm({ initial = null, onSaved }) {
  const navigate = useNavigate();
  const { toastSuccess, toastError } = useNotification();

  const [referentiel, setReferentiel] = useState({ types_dossiers: [], priorites: [], statuts: [] });
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    type_id: initial?.type_id ?? '',
    objet: initial?.objet ?? '',
    demandeur: initial?.demandeur ?? '',
    matricule: initial?.matricule ?? '',
    date_reception: initial?.date_reception
      ? String(initial.date_reception).slice(0, 10)
      : todayISO(),
    division_id: initial?.division_id ?? '',
    priorite_id: initial?.priorite_id ?? '',
    observation: initial?.observation ?? '',
  });

  // Routage automatique : la division affichée découle du type choisi.
  // L'utilisateur ne la saisit plus (spécification « Routage automatique »).
  const divisionDuType = useMemo(() => {
    if (!form.type_id || !divisions.length) return null;
    return divisions.find((d) => d.type_dossier_id === Number(form.type_id)) || null;
  }, [form.type_id, divisions]);

  useEffect(() => {
    Promise.all([referentielService.get(), divisionService.list()])
      .then(([ref, divs]) => {
        setReferentiel(ref);
        setDivisions(Array.isArray(divs) ? divs : []);
        setLoading(false);
      })
      .catch((e) => {
        setError(e);
        setLoading(false);
      });
  }, []);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.type_id || !form.objet || !form.demandeur || !form.date_reception || !form.priorite_id) {
      setError({ message: 'Veuillez remplir tous les champs obligatoires.' });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        type_id: Number(form.type_id),
        objet: form.objet,
        demandeur: form.demandeur,
        matricule: form.matricule || null,
        date_reception: form.date_reception,
        priorite_id: Number(form.priorite_id),
        observation: form.observation || null,
        date_limite: form.date_limite || null,
      };
      if (initial) {
        await dossierService.update(initial.id, payload);
        toastSuccess('Dossier mis à jour.');
        onSaved?.(initial.id);
      } else {
        const created = await dossierService.create(payload);
        toastSuccess(`Dossier ${created.numero} créé et enregistré.`);
        onSaved?.(created.id);
      }
    } catch (err) {
      setError(err);
      toastError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="py-10 text-center text-sm text-slate-400">Chargement du formulaire…</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <Alert type="error" title="Impossible d'enregistrer">
          {error.message}
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Type de dossier"
          required
          value={form.type_id}
          onChange={set('type_id')}
          disabled={Boolean(initial)}
        >
          <option value="">Sélectionner…</option>
          {referentiel.types_dossiers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.libelle}
            </option>
          ))}
        </Select>

        {/* Routage automatique : la division découle du type (règle 1). */}
        <div>
          <p className="mb-1 block text-sm font-medium text-slate-700">
            Division affectée
          </p>
          <div
            className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${
              divisionDuType
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-dashed border-slate-300 bg-slate-50 text-slate-400'
            }`}
          >
            {divisionDuType ? (
              <>
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span className="font-semibold">{divisionDuType.nom}</span>
              </>
            ) : (
              <span>Choisir un type pour déterminer la division</span>
            )}
          </div>
          {divisionDuType && !initial && (
            <p className="mt-1 text-[11px] text-slate-500">
              Le dossier sera automatiquement orienté vers cette division.
            </p>
          )}
        </div>

        <Select
          label="Priorité"
          required
          value={form.priorite_id}
          onChange={set('priorite_id')}
        >
          <option value="">Sélectionner…</option>
          {referentiel.priorites.map((p) => (
            <option key={p.id} value={p.id}>
              {p.libelle}
            </option>
          ))}
        </Select>
      </div>

      <Textarea
        label="Objet"
        required
        rows={3}
        value={form.objet}
        onChange={set('objet')}
        placeholder="Objet de la demande…"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Demandeur"
          required
          value={form.demandeur}
          onChange={set('demandeur')}
          placeholder="Nom et prénom du demandeur"
        />
        <Input
          label="Matricule"
          value={form.matricule}
          onChange={set('matricule')}
          placeholder="Matricule (optionnel)"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Input
          label="Date de réception"
          required
          type="date"
          value={form.date_reception}
          onChange={set('date_reception')}
        />
        <Input
          label="Date limite (optionnel)"
          type="date"
          value={form.date_limite || ''}
          onChange={set('date_limite')}
        />
        <div className="sm:pt-6">
          <Button type="submit" loading={saving} className="w-full">
            {initial ? 'Enregistrer les modifications' : 'Créer le dossier'}
          </Button>
        </div>
      </div>

      <Textarea
        label="Observation"
        value={form.observation}
        onChange={set('observation')}
        placeholder="Observations éventuelles…"
      />
    </form>
  );
}

export default DossierForm;