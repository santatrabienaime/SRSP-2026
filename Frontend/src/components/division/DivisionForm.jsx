import { useState, useEffect } from 'react';
import { divisionService } from '../../services/divisionService.js';
import { agentService } from '../../services/agentService.js';
import { referentielService } from '../../services/referentielService.js';
import { useNotification } from '../../hooks/useNotification.js';
import { Button } from '../ui/Button.jsx';
import { Select } from '../ui/Select.jsx';
import { Alert } from '../ui/Alert.jsx';
import { ReferenceInput, TitleTextInput } from '../fields/index.jsx';

/** Formulaire de création / édition d'une division. */
export function DivisionForm({ initial = null, onSaved }) {
  const { toastSuccess, toastError } = useNotification();
  const [agents, setAgents] = useState([]);
  const [typesDossiers, setTypesDossiers] = useState([]);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    code: initial?.code || '',
    nom: initial?.nom || '',
    /* Une division traite un seul type de dossier : cette liaison est
       obligatoire en base, donc demandée dès la création. */
    type_dossier_id: initial?.type_dossier_id || '',
    responsable_id: initial?.responsable_id || '',
    actif: initial ? Boolean(initial.actif) : true,
  });

  useEffect(() => {
    agentService
      .list()
      .then((a) => setAgents(Array.isArray(a) ? a : []))
      .catch(() => { /* liste indisponible : le champ reste vide */ });
    referentielService
      .typesDossiers()
      .then((t) => setTypesDossiers(Array.isArray(t) ? t : []))
      .catch(() => { /* liste indisponible : le champ reste vide */ });
  }, []);

  /* Les composants de champ renvoient la valeur formatée, les champs bruts un
     événement : le même accesseur accepte les deux. */
  const set = (field) => (source) => {
    const v =
      field === 'actif'
        ? source.target.checked
        : source && source.target
          ? source.target.value
          : source;
    setForm((f) => ({ ...f, [field]: v }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.code || !form.nom || !form.type_dossier_id) {
      setError({ message: 'Code, nom et type de dossier sont obligatoires.' });
      return;
    }
    setSaving(true);
    const commun = {
      code: form.code,
      nom: form.nom,
      type_dossier_id: Number(form.type_dossier_id),
      responsable_id: form.responsable_id ? Number(form.responsable_id) : null,
    };
    try {
      if (initial) {
        await divisionService.update(initial.id, { ...commun, actif: form.actif });
        toastSuccess('Division mise à jour.');
      } else {
        await divisionService.create(commun);
        toastSuccess('Division créée.');
      }
      onSaved?.();
    } catch (err) {
      setError(err);
      toastError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert type="error">{error.message}</Alert>}
      <div className="grid gap-4 sm:grid-cols-2">
        <ReferenceInput
          label="Code"
          required
          value={form.code}
          onChange={set('code')}
          hint="Lettres majuscules, chiffres et tirets (ex. VISAS)."
          placeholder="VISAS"
          maxLength={20}
        />
        <TitleTextInput
          label="Nom"
          required
          value={form.nom}
          onChange={set('nom')}
          placeholder="Division Visas"
        />
      </div>
      <Select
        label="Type de dossier"
        required
        success={Boolean(form.type_dossier_id)}
        successMessage="Type rattaché."
        value={form.type_dossier_id}
        onChange={set('type_dossier_id')}
      >
        <option value="">Sélectionner…</option>
        {typesDossiers.map((t) => (
          <option key={t.id} value={t.id}>{t.libelle || t.code}</option>
        ))}
      </Select>
      <Select
        label="Responsable"
        value={form.responsable_id}
        onChange={set('responsable_id')}
      >
        <option value="">Aucun</option>
        {agents.map((a) => (
          <option key={a.id} value={a.id}>{a.nom} {a.prenom}</option>
        ))}
      </Select>
      {initial && (
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={form.actif} onChange={set('actif')} className="rounded border-slate-300 text-primary-600" />
          Division active
        </label>
      )}
      <Button type="submit" loading={saving}>
        {initial ? 'Enregistrer' : 'Créer la division'}
      </Button>
    </form>
  );
}

export default DivisionForm;
