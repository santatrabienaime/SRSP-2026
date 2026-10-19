import { useState, useEffect } from 'react';
import { personnelService } from '../../services/personnelService.js';
import { roleService } from '../../services/roleService.js';
import { referentielService } from '../../services/referentielService.js';
import { divisionService } from '../../services/divisionService.js';
import { useNotification } from '../../hooks/useNotification.js';
import { Button } from '../ui/Button.jsx';
import { Select } from '../ui/Select.jsx';
import { Alert } from '../ui/Alert.jsx';
import {
  NameInput,
  FirstNameInput,
  MatriculeInput,
  EmailInput,
  PhoneInput,
  UsernameInput,
  PasswordInput,
} from '../fields/index.jsx';

/**
 * Formulaire d'une personne : sa fiche et, si elle en a un, son compte de
 * connexion.
 *
 * Les deux étaient auparavant saisis dans deux écrans différents : l'identité
 * d'un côté, l'accès de l'autre, si bien que l'email de la personne existait en
 * double et que rien ne reliait une fiche à son compte. Un seul formulaire les
 * tient ensemble et empêche les états intermédiaires (une fiche sans personne
 * joignable, un compte sans division).
 */
export function PersonnelForm({ initial = null, onSaved, onCancel = null }) {
  const { toastSuccess, toastError } = useNotification();
  const [roles, setRoles] = useState([]);
  const [fonctions, setFonctions] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const aCompte = Boolean(initial?.compte_id);

  const [form, setForm] = useState({
    nom: initial?.nom || '',
    prenom: initial?.prenom || '',
    matricule: initial?.matricule || '',
    fonction_id: initial?.fonction_id || '',
    division_id: initial?.division_id || '',
    email: initial?.email || '',
    telephone: initial?.telephone || '',
    actif: initial ? Boolean(initial.actif) : true,
    // Une personne créée ici est un membre du service : elle a un accès par
    // défaut. La case se décoche pour les agents sans compte (terrain). En
    // modification, elle ne peut que constater l'existant : un compte ne se
    // retire pas d'une personne qui s'en sert pour se connecter.
    creerCompte: initial ? aCompte : true,
    username: initial?.username || '',
    compteEmail: initial?.compte_email || '',
    role_id: initial?.role_id || '',
    password: '',
    compteActif: initial?.compte_actif === undefined || initial?.compte_actif === null
      ? true
      : Boolean(initial.compte_actif),
  });

  useEffect(() => {
    roleService.list().then((r) => setRoles(Array.isArray(r) ? r : [])).catch(() => {});
    divisionService.list().then((d) => setDivisions(Array.isArray(d) ? d : [])).catch(() => {});
    referentielService
      .get()
      .then((ref) => setFonctions(ref.fonctions || []))
      .catch(() => {});
  }, []);

  /* Les composants de champ renvoient la valeur formatée, les champs bruts un
     événement : le même accesseur accepte les deux. */
  const set = (field) => (source) => {
    const v =
      field === 'actif' || field === 'compteActif' || field === 'creerCompte'
        ? source.target.checked
        : source && source.target
          ? source.target.value
          : source;
    setForm((f) => ({ ...f, [field]: v }));
  };

  // Un compte à créer seulement quand il n'en existe pas encore : le retirer à
  // une personne qui se connecte la priverait de son accès sans le dire.
  const creerUnCompte = !aCompte && form.creerCompte;

  const manquants = [];
  if (!form.nom.trim()) manquants.push('le nom');
  if (!form.prenom.trim()) manquants.push('le prénom');
  if (creerUnCompte) {
    if (form.username.trim().length < 3) manquants.push("l'identifiant (3 caractères minimum)");
    if (!form.compteEmail.trim()) manquants.push("l'email de connexion");
    if (!form.role_id) manquants.push('le rôle');
    if (!form.password) manquants.push('le mot de passe');
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (manquants.length > 0) {
      setError({ message: `À compléter : ${manquants.join(', ')}.` });
      return;
    }

    const payload = {
      nom: form.nom.trim(),
      prenom: form.prenom.trim(),
      matricule: form.matricule.trim() || null,
      fonction_id: form.fonction_id ? Number(form.fonction_id) : null,
      division_id: form.division_id ? Number(form.division_id) : null,
      email: form.email.trim() || null,
      telephone: form.telephone.trim() || null,
      actif: form.actif ? 1 : 0,
    };

    if (aCompte) {
      payload.compte_email = form.compteEmail.trim();
      payload.role_id = Number(form.role_id);
      payload.compte_actif = form.compteActif ? 1 : 0;
    } else if (creerUnCompte) {
      payload.creer_compte = true;
      payload.username = form.username.trim();
      payload.compte_email = form.compteEmail.trim();
      payload.role_id = Number(form.role_id);
      payload.password = form.password;
    }

    setSaving(true);
    try {
      if (initial) {
        await personnelService.update(initial.id, payload);
        toastSuccess('Personne mise à jour.');
      } else {
        await personnelService.create(payload);
        toastSuccess(
          creerUnCompte ? 'Personne et compte créés.' : 'Personne créée.'
        );
      }
      onSaved?.();
    } catch (err) {
      setError(err);
      toastError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const titreSection = 'text-xs font-semibold uppercase tracking-wide text-slate-400';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <Alert type="error">{error.message}</Alert>}

      {/* ── Identité ─────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h4 className={titreSection}>Identité</h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <NameInput label="Nom" required autoFocus value={form.nom} onChange={set('nom')} />
          <FirstNameInput label="Prénom" required value={form.prenom} onChange={set('prenom')} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <MatriculeInput
            label="N° matricule"
            value={form.matricule}
            onChange={set('matricule')}
            hint="2 à 10 caractères, lettres et chiffres (ex. SRSP-013)."
          />
          <Select
            label="Fonction"
            success={Boolean(form.fonction_id)}
            successMessage="Fonction rattachée."
            value={form.fonction_id}
            onChange={set('fonction_id')}
          >
            <option value="">Aucune</option>
            {fonctions.map((f) => (
              <option key={f.id} value={f.id}>{f.libelle}</option>
            ))}
          </Select>
        </div>
        <Select
          label="Division"
          success={Boolean(form.division_id)}
          successMessage="Division rattachée."
          hint="La division ouvre les dossiers de cette matière et délimite ce que la personne voit."
          value={form.division_id}
          onChange={set('division_id')}
        >
          <option value="">Aucune</option>
          {divisions.map((d) => (
            <option key={d.id} value={d.id}>{d.nom}</option>
          ))}
        </Select>
        <div className="grid gap-4 sm:grid-cols-2">
          <EmailInput
            label="Email de contact"
            value={form.email}
            onChange={set('email')}
            hint="Laissez vide pour reprendre l'email de connexion."
          />
          <PhoneInput label="Téléphone" value={form.telephone} onChange={set('telephone')} />
        </div>
        {initial && (
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.actif}
              onChange={set('actif')}
              className="h-4 w-4 rounded border-slate-300 text-primary-600"
            />
            Personne active
          </label>
        )}
      </section>

      {/* ── Compte de connexion ──────────────────────────────────── */}
      <section className="space-y-4 rounded-lg border border-slate-200 bg-slate-50/60 p-4">
        <h4 className={titreSection}>Compte de connexion</h4>

        {aCompte ? (
          <>
            <div>
              <p className="text-xs font-medium text-slate-500">Identifiant</p>
              <p className="mt-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                {form.username}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                L'identifiant sert de clé de connexion et de référence dans le
                journal d'audit : il ne se modifie pas. Il se réinitialise par
                le mot de passe.
              </p>
            </div>
            <EmailInput
              label="Email de connexion"
              required
              value={form.compteEmail}
              onChange={set('compteEmail')}
            />
            <Select
              label="Rôle"
              required
              success={Boolean(form.role_id)}
              successMessage="Rôle attribué."
              value={form.role_id}
              onChange={set('role_id')}
            >
              <option value="">Sélectionner…</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.nom}</option>
              ))}
            </Select>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.compteActif}
                onChange={set('compteActif')}
                className="h-4 w-4 rounded border-slate-300 text-primary-600"
              />
              Compte actif (autorise la connexion)
            </label>
          </>
        ) : (
          <>
            <label className="flex items-start gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.creerCompte}
                onChange={set('creerCompte')}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary-600"
              />
              <span>
                Créer un compte de connexion pour cette personne
                <span className="block text-xs text-slate-400">
                  Décochez pour une personne sans accès à l'application (agent de
                  terrain). Le compte pourra être ajouté plus tard.
                </span>
              </span>
            </label>

            {creerUnCompte && (
              <>
                <UsernameInput
                  label="Identifiant"
                  required
                  value={form.username}
                  onChange={set('username')}
                  placeholder="prenom.nom"
                />
                <EmailInput
                  label="Email de connexion"
                  required
                  value={form.compteEmail}
                  onChange={set('compteEmail')}
                />
                <Select
                  label="Rôle"
                  required
                  success={Boolean(form.role_id)}
                  successMessage="Rôle attribué."
                  value={form.role_id}
                  onChange={set('role_id')}
                >
                  <option value="">Sélectionner…</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>{r.nom}</option>
                  ))}
                </Select>
                <PasswordInput
                  label="Mot de passe"
                  required
                  value={form.password}
                  onChange={set('password')}
                />
              </>
            )}
          </>
        )}
      </section>

      {/* Barre d'actions collée en bas : le formulaire est long, on garde
          toujours sous les yeux ce qui reste à faire. */}
      <div className="sticky bottom-0 -mx-4 -mb-4 mt-3 flex flex-wrap justify-end gap-2 border-t border-slate-200 bg-white px-4 py-3 sm:-mx-5 sm:-mb-5 sm:px-5">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} className="w-full sm:w-auto">
            Annuler
          </Button>
        )}
        <Button type="submit" loading={saving} className="w-full sm:w-auto">
          {initial ? 'Enregistrer' : creerUnCompte ? 'Créer la personne et le compte' : 'Créer la personne'}
        </Button>
      </div>
    </form>
  );
}

export default PersonnelForm;
