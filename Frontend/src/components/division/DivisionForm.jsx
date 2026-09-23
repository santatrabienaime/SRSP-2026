import { useState, useEffect } from 'react';
import { divisionService } from '../../services/divisionService.js';
import { agentService } from '../../services/agentService.js';
import { useNotification } from '../../hooks/useNotification.js';
import { Button } from '../ui/Button.jsx';
import { Input } from '../ui/Input.jsx';
import { Select } from '../ui/Select.jsx';
import { Alert } from '../ui/Alert.jsx';

/** Formulaire de création / édition d'une division. */
export function DivisionForm({ initial = null, onSaved }) {
  const { toastSuccess, toastError } = useNotification();
  const [agents, setAgents] = useState([]);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    code: initial?.code || '',
    nom: initial?.nom || '',
    responsable_id: initial?.responsable_id || '',
    actif: initial ? Boolean(initial.actif) : true,
  });

  useEffect(() => {
    agentService
      .list()
      .then((a) => setAgents(Array.isArray(a) ? a : []))
      .catch(() => {});
  }, []);

  const set = (field) => (e) => {
    const v = field === 'actif' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: v }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.code || !form.nom) {
      setError({ message: 'Code et nom sont obligatoires.' });
      return;
    }
    setSaving(true);
    try {
      if (initial) {
        await divisionService.update(initial.id, {
          code: form.code,
          nom: form.nom,
          responsable_id: form.responsable_id ? Number(form.responsable_id) : null,
          actif: form.actif,
        });
        toastSuccess('Division mise à jour.');
      } else {
        await divisionService.create({ code: form.code, nom: form.nom });
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
        <Input label="Code" required value={form.code} onChange={set('code')} placeholder="ex. VISAS" />
        <Input label="Nom" required value={form.nom} onChange={set('nom')} placeholder="ex. Division Visas" />
      </div>
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