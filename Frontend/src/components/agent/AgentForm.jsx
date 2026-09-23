import { useState, useEffect } from 'react';
import { agentService } from '../../services/agentService.js';
import { referentielService } from '../../services/referentielService.js';
import { divisionService } from '../../services/divisionService.js';
import { userService } from '../../services/userService.js';
import { useNotification } from '../../hooks/useNotification.js';
import { Button } from '../ui/Button.jsx';
import { Input } from '../ui/Input.jsx';
import { Select } from '../ui/Select.jsx';
import { Alert } from '../ui/Alert.jsx';

/** Formulaire de création / édition d'un agent. */
export function AgentForm({ initial = null, onSaved }) {
  const { toastSuccess, toastError } = useNotification();
  const [fonctions, setFonctions] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    user_id: initial?.user_id || '',
    nom: initial?.nom || '',
    prenom: initial?.prenom || '',
    matricule: initial?.matricule || '',
    fonction_id: initial?.fonction_id || '',
    division_id: initial?.division_id || '',
    email: initial?.email || '',
    telephone: initial?.telephone || '',
    actif: initial ? Boolean(initial.actif) : true,
  });

  useEffect(() => {
    Promise.all([referentielService.get(), divisionService.list(), userService.list()])
      .then(([ref, divs, us]) => {
        setFonctions(ref.fonctions || []);
        setDivisions(Array.isArray(divs) ? divs : []);
        setUsers(Array.isArray(us) ? us : []);
        setLoading(false);
      })
      .catch((e) => {
        setError(e);
        setLoading(false);
      });
  }, []);

  const set = (field) => (e) => {
    const v = field === 'actif' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: v }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.nom || !form.prenom) {
      setError({ message: 'Nom et prénom sont obligatoires.' });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        user_id: form.user_id ? Number(form.user_id) : null,
        nom: form.nom,
        prenom: form.prenom,
        matricule: form.matricule || null,
        fonction_id: form.fonction_id ? Number(form.fonction_id) : null,
        division_id: form.division_id ? Number(form.division_id) : null,
        email: form.email || null,
        telephone: form.telephone || null,
        actif: form.actif,
      };
      if (initial) {
        await agentService.update(initial.id, payload);
        toastSuccess('Agent mis à jour.');
      } else {
        await agentService.create(payload);
        toastSuccess('Agent créé.');
      }
      onSaved?.();
    } catch (err) {
      setError(err);
      toastError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="py-8 text-center text-sm text-slate-400">Chargement…</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert type="error">{error.message}</Alert>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Nom" required value={form.nom} onChange={set('nom')} />
        <Input label="Prénom" required value={form.prenom} onChange={set('prenom')} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Matricule" value={form.matricule} onChange={set('matricule')} />
        <Select label="Fonction" value={form.fonction_id} onChange={set('fonction_id')}>
          <option value="">Aucune</option>
          {fonctions.map((f) => (
            <option key={f.id} value={f.id}>{f.libelle}</option>
          ))}
        </Select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Division" value={form.division_id} onChange={set('division_id')}>
          <option value="">Aucune</option>
          {divisions.map((d) => (
            <option key={d.id} value={d.id}>{d.nom}</option>
          ))}
        </Select>
        <Select label="Compte utilisateur lié" value={form.user_id} onChange={set('user_id')}>
          <option value="">Aucun</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.username} ({u.role_nom})</option>
          ))}
        </Select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Email" type="email" value={form.email} onChange={set('email')} />
        <Input label="Téléphone" value={form.telephone} onChange={set('telephone')} />
      </div>
      {initial && (
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={form.actif} onChange={set('actif')} className="rounded border-slate-300 text-primary-600" />
          Agent actif
        </label>
      )}
      <Button type="submit" loading={saving}>
        {initial ? 'Enregistrer' : 'Créer l’agent'}
      </Button>
    </form>
  );
}

export default AgentForm;