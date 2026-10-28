import { useState, useEffect } from 'react';
import { bordereauService } from '../../services/bordereauService.js';
import { divisionService } from '../../services/divisionService.js';
import { useNotification } from '../../hooks/useNotification.js';
import { Button } from '../ui/Button.jsx';
import { Select } from '../ui/Select.jsx';
import { Alert } from '../ui/Alert.jsx';
import { ReferenceInput, ObservationInput } from '../fields/index.jsx';

export function BordereauForm({ initial = null, onSaved, onCancel = null }) {
  const { toastSuccess, toastError } = useNotification();
  const [divisions, setDivisions] = useState([]);
  const [dossiersEligibles, setDossiersEligibles] = useState([]);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const isEdit = Boolean(initial?.id);
  const isBrouillon = !isEdit || initial?.statut === 'BROUILLON';

  const [form, setForm] = useState({
    division_id: initial?.division_id || '',
    observation: initial?.observation || '',
    dossiers: initial?.dossiers?.map((d) => ({ id: d.id, ordre: d.ordre })) || [],
  });

  useEffect(() => {
    divisionService.list().then((d) => setDivisions(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (form.division_id) {
      bordereauService.eligibles(form.division_id).then((d) => setDossiersEligibles(d)).catch(() => {});
    } else {
      setDossiersEligibles([]);
    }
  }, [form.division_id]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const setVal = (field) => (v) => setForm((f) => ({ ...f, [field]: v }));

  const handleDossiersChange = (newDossiers) => setForm((f) => ({ ...f, dossiers: newDossiers }));

  const canSave = form.division_id && (isBrouillon ? true : true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.division_id) {
      setError({ message: 'La division destinataire est obligatoire.' });
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        await bordereauService.update(initial.id, { division_id: Number(form.division_id), observation: form.observation });
        toastSuccess('Bordereau mis à jour.');
      } else {
        await bordereauService.create({
          division_id: Number(form.division_id),
          observation: form.observation,
          dossiers: form.dossiers,
        });
        toastSuccess('Bordereau créé.');
      }
      onSaved?.();
    } catch (err) {
      setError(err);
      toastError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const dossiersSelectionnes = form.dossiers.map((d) => {
    const found = dossiersEligibles.find((e) => e.id === d.id);
    return { ...d, numero: found?.numero, objet: found?.objet, statut_libelle: found?.statut_libelle };
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <Alert type="error">{error.message}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Division destinataire"
          required
          value={form.division_id}
          onChange={(e) => { setForm((f) => ({ ...f, division_id: e.target.value, dossiers: [] })); }}
        >
          <option value="">Sélectionner une division…</option>
          {divisions.map((d) => (
            <option key={d.id} value={d.id}>{d.nom}</option>
          ))}
        </Select>

        <ReferenceInput
          label="Référence"
          value={initial?.reference || (isEdit ? '' : 'Auto (BORD-ANNÉE-XXXXXX)')}
          disabled
        />
      </div>

      <ObservationInput
        label="Observation administrative"
        value={form.observation}
        onChange={setVal('observation')}
        placeholder="Note interne sur ce bordereau…"
      />

      {isBrouillon && (
        <section className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/60 p-4">
          <h4 className="text-sm font-semibold text-slate-700">Dossiers à transmettre</h4>
          <p className="text-xs text-slate-500">
            Sélectionnez les dossiers à inclure dans ce bordereau. Seuls les dossiers
            orientés (ORIENTÉ) de la division choisie et non encore transmis sont proposés.
          </p>

          {dossiersEligibles.length === 0 && (
            <p className="text-sm text-slate-500">Aucun dossier éligible pour cette division.</p>
          )}

          <div className="max-h-64 overflow-y-auto space-y-2">
            {dossiersEligibles.map((d) => {
              const isSelected = form.dossiers.some((s) => s.id === d.id);
              return (
                <label key={d.id} className="flex items-center gap-3 rounded-md border p-2 hover:bg-white transition-colors">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleDossiersChange([...form.dossiers, { id: d.id, ordre: form.dossiers.length }]);
                      } else {
                        handleDossiersChange(form.dossiers.filter((s) => s.id !== d.id));
                      }
                    }}
                    className="h-4 w-4 rounded border-slate-300 text-primary-600"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{d.numero}</p>
                    <p className="text-xs text-slate-500 truncate">{d.objet}</p>
                  </div>
                  <span className="text-xs text-slate-500 whitespace-nowrap">{d.statut_libelle}</span>
                </label>
              );
            })}
          </div>

          {form.dossiers.length > 0 && (
            <div className="pt-2 border-t border-slate-200">
              <p className="text-sm font-medium text-slate-700">Sélectionnés ({form.dossiers.length}) :</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {dossiersSelectionnes.map((d) => (
                  <span key={d.id} className="flex items-center gap-1 rounded-md bg-primary-50 text-primary-700 px-2 py-1 text-xs">
                    {d.numero}
                    <button
                      type="button"
                      onClick={() => handleDossiersChange(form.dossiers.filter((s) => s.id !== d.id))}
                      className="text-primary-600 hover:text-primary-800"
                      aria-label={`Retirer ${d.numero}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {!isBrouillon && initial?.dossiers?.length && (
        <section className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/60 p-4">
          <h4 className="text-sm font-semibold text-slate-700">Dossiers du bordereau ({initial.dossiers.length})</h4>
          <ul className="divide-y divide-slate-200">
            {initial.dossiers.map((d) => (
              <li key={d.id} className="flex items-center justify-between py-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800">{d.numero}</p>
                  <p className="text-xs text-slate-500 truncate">{d.objet}</p>
                </div>
                <span className="text-xs text-slate-500">{d.statut_libelle}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="sticky bottom-0 -mx-4 -mb-4 mt-3 flex flex-wrap justify-end gap-2 border-t border-slate-200 bg-white px-4 py-3 sm:-mx-5 sm:-mb-5 sm:px-5">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} className="w-full sm:w-auto">
            Annuler
          </Button>
        )}
        <Button type="submit" loading={saving} disabled={!canSave} className="w-full sm:w-auto">
          {isEdit ? 'Enregistrer' : 'Créer le bordereau'}
        </Button>
      </div>
    </form>
  );
}

export default BordereauForm;