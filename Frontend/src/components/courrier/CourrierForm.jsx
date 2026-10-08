import { useEffect, useState } from 'react';
import { courrierService } from '../../services/courrierService.js';
import { referentielService } from '../../services/referentielService.js';
import { divisionService } from '../../services/divisionService.js';
import { dossierService } from '../../services/dossierService.js';
import { useNotification } from '../../hooks/useNotification.js';
import { Button } from '../ui/Button.jsx';
import { Input } from '../ui/Input.jsx';
import { Select } from '../ui/Select.jsx';
import { Alert } from '../ui/Alert.jsx';
import { TextAreaInput } from '../fields/index.jsx';

/** Formulaire de création d'un courrier entrant/sortant. */
export function CourrierForm({ onSaved }) {
  const { toastSuccess, toastError } = useNotification();
  const [types, setTypes] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [dossiers, setDossiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    type_id: '',
    sens: 'ENTRANT',
    expediteur: '',
    destinataire: '',
    objet: '',
    division_id: '',
    dossier_id: '',
  });

  useEffect(() => {
    Promise.all([
      referentielService.get(),
      divisionService.list(),
      dossierService.list({ statut: undefined, limit: 100 }),
    ])
      .then(([ref, divs, doss]) => {
        setTypes(ref.types_courriers || []);
        setDivisions(Array.isArray(divs) ? divs : []);
        setDossiers(Array.isArray(doss) ? doss : []);
        setLoading(false);
      })
      .catch((e) => {
        setError(e);
        setLoading(false);
      });
  }, []);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  /** Setter pour les composants de champ (valeur formatée). */
  const setVal = (field) => (v) => setForm((f) => ({ ...f, [field]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.type_id || !form.objet) {
      setError({ message: 'Le type et l’objet sont obligatoires.' });
      return;
    }
    setSaving(true);
    try {
      const created = await courrierService.create({
        type_id: Number(form.type_id),
        sens: form.sens,
        expediteur: form.expediteur || null,
        destinataire: form.destinataire || null,
        objet: form.objet,
        division_id: form.division_id ? Number(form.division_id) : null,
        dossier_id: form.dossier_id ? Number(form.dossier_id) : null,
      });
      toastSuccess(`Courrier ${created.numero} créé.`);
      onSaved?.(created.id);
    } catch (err) {
      setError(err);
      toastError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="py-10 text-center text-sm text-slate-400">Chargement…</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <Alert type="error" title="Impossible de créer le courrier">{error.message}</Alert>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Type de courrier" required value={form.type_id} onChange={set('type_id')}>
          <option value="">Sélectionner…</option>
          {types.map((t) => (
            <option key={t.id} value={t.id}>{t.libelle}</option>
          ))}
        </Select>
        <Select label="Sens" required value={form.sens} onChange={set('sens')}>
          <option value="ENTRANT">Entrant</option>
          <option value="SORTANT">Sortant</option>
        </Select>
      </div>

      <TextAreaInput
        label="Objet"
        required
        rows={2}
        maxLength={255}
        value={form.objet}
        onChange={(v) => setVal('objet')(v.charAt(0).toUpperCase() + v.slice(1))}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Expéditeur" maxLength={255} value={form.expediteur} onChange={set('expediteur')} placeholder={form.sens === 'ENTRANT' ? 'Qui envoie ?' : 'Service émetteur'} />
        <Input label="Destinataire" maxLength={255} value={form.destinataire} onChange={set('destinataire')} placeholder={form.sens === 'SORTANT' ? 'À qui ?' : 'Service destinataire'} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Division" value={form.division_id} onChange={set('division_id')}>
          <option value="">Aucune</option>
          {divisions.map((d) => (
            <option key={d.id} value={d.id}>{d.nom}</option>
          ))}
        </Select>
        <Select label="Dossier lié" value={form.dossier_id} onChange={set('dossier_id')}>
          <option value="">Aucun</option>
          {dossiers.slice(0, 100).map((d) => (
            <option key={d.id} value={d.id}>{d.numero}</option>
          ))}
        </Select>
      </div>

      <Button type="submit" loading={saving}>Créer le courrier</Button>
    </form>
  );
}

export default CourrierForm;