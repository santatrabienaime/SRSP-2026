import { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, KeyRound, Pencil, Power, Trash2 } from 'lucide-react';
import { userService } from '../../services/userService.js';
import { roleService } from '../../services/roleService.js';
import { useNotification } from '../../hooks/useNotification.js';
import { Table } from '../../components/ui/Table.jsx';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Select } from '../../components/ui/Select.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import {
  UsernameInput,
  EmailInput,
  PasswordInput,
} from '../../components/fields/index.jsx';
import { usePagination } from '../../hooks/usePagination.js';
import { formatDateTime } from '../../utils/formatDate.js';
import { AnimatedCard } from '../../components/ui/AnimatedCard.jsx';

/** Formulaire vierge de création d'un compte. */
const FORM_VIDE = { username: '', email: '', password: '', role_id: '', actif: true };

/**
 * Gestion des comptes : CRUD complet (créer, modifier, activer/désactiver,
 * réinitialiser le mot de passe, supprimer) + recherche et pagination.
 *
 * L'identifiant n'est pas modifiable : il sert de clé de connexion et de
 * référence dans le journal d'audit ; le renommer romprait la traçabilité.
 */
export function UsersAdminPage() {
  const { toastSuccess, toastError } = useNotification();

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  // Modale création / modification.
  const [modal, setModal] = useState(null); // { mode: 'create' | 'edit', id? }
  const [form, setForm] = useState(FORM_VIDE);
  // Modale de réinitialisation de mot de passe.
  const [reset, setReset] = useState(null); // { id, username }
  const [nouveauMdp, setNouveauMdp] = useState('');
  // Confirmation avant un acte sensible (suppression, bascule du compte).
  const [confirm, setConfirm] = useState(null); // { action, user }

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const [us, rs] = await Promise.all([userService.list(), roleService.list()]);
      setUsers(Array.isArray(us) ? us : []);
      setRoles(Array.isArray(rs) ? rs : []);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { Promise.resolve().then(loadUsers); }, [loadUsers]);

  /* La recherche était saisie mais jamais appliquée : le filtre se fait ici,
     avant la pagination, pour que la page affichée corresponde au résultat. */
  const usersFiltres = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      [u.username, u.email, u.role_nom]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [users, search]);

  const pagination = usePagination(usersFiltres, 10);

  const ouvrirCreation = () => {
    setForm(FORM_VIDE);
    setModal({ mode: 'create' });
  };

  const ouvrirEdition = (u) => {
    setForm({
      username: u.username,
      email: u.email || '',
      password: '',
      role_id: u.role_id || '',
      actif: Boolean(u.actif),
    });
    setModal({ mode: 'edit', id: u.id });
  };

  const enregistrer = async () => {
    setSaving(true);
    try {
      if (modal.mode === 'create') {
        await userService.create({
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
          role_id: Number(form.role_id),
        });
        toastSuccess('Utilisateur créé.');
      } else {
        await userService.update(modal.id, {
          email: form.email.trim(),
          role_id: Number(form.role_id),
          actif: form.actif ? 1 : 0,
        });
        toastSuccess('Utilisateur mis à jour.');
      }
      setModal(null);
      await loadUsers();
    } catch (e) {
      toastError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const reinitialiser = async () => {
    setSaving(true);
    try {
      await userService.resetPassword(reset.id, nouveauMdp);
      toastSuccess('Mot de passe réinitialisé.');
      setReset(null);
      setNouveauMdp('');
    } catch (e) {
      toastError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const confirmer = async () => {
    setSaving(true);
    try {
      if (confirm.action === 'supprimer') {
        const r = await userService.remove(confirm.user.id);
        toastSuccess(r?.message || 'Utilisateur supprimé.');
      } else {
        await userService.toggle(confirm.user.id);
        toastSuccess('Statut du compte modifié.');
      }
      setConfirm(null);
      await loadUsers();
    } catch (e) {
      toastError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner label="Chargement des utilisateurs…" />;
  if (error) return <Alert type="error">{error.message}</Alert>;

  const creationValide =
    form.username.trim().length >= 3 &&
    Boolean(form.email.trim()) &&
    Boolean(form.password) &&
    Boolean(form.role_id);

  const colonnes = [
    {
      key: 'username',
      label: 'Identifiant',
      render: (u) => <span className="font-medium text-slate-800">{u.username}</span>,
    },
    {
      key: 'email',
      label: 'Email',
      render: (u) => <span className="text-sm text-slate-500">{u.email || '—'}</span>,
    },
    {
      key: 'role',
      label: 'Rôle',
      render: (u) => (
        <Badge className="border-primary-200 bg-primary-50 text-primary-700">
          {u.role_nom || '—'}
        </Badge>
      ),
    },
    {
      key: 'actif',
      label: 'Statut',
      render: (u) =>
        Number(u.actif) ? (
          <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">Actif</Badge>
        ) : (
          <Badge className="border-slate-200 bg-slate-100 text-slate-600">Désactivé</Badge>
        ),
    },
    {
      key: 'derniere_connexion',
      label: 'Dernière connexion',
      render: (u) => (
        <span className="text-sm text-slate-500">
          {u.derniere_connexion ? formatDateTime(u.derniere_connexion) : 'Jamais'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (u) => (
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            title="Modifier"
            aria-label={`Modifier ${u.username}`}
            onClick={() => ouvrirEdition(u)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            title="Réinitialiser le mot de passe"
            aria-label={`Réinitialiser le mot de passe de ${u.username}`}
            onClick={() => { setReset({ id: u.id, username: u.username }); setNouveauMdp(''); }}
          >
            <KeyRound className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            title={Number(u.actif) ? 'Désactiver' : 'Activer'}
            aria-label={`${Number(u.actif) ? 'Désactiver' : 'Activer'} ${u.username}`}
            onClick={() => setConfirm({ action: 'toggle', user: u })}
          >
            <Power className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-red-600 hover:bg-red-50"
            title="Supprimer"
            aria-label={`Supprimer ${u.username}`}
            onClick={() => setConfirm({ action: 'supprimer', user: u })}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AnimatedCard title="Utilisateurs" subtitle="Gestion des comptes et des rôles du personnel." delay={0}>
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Input
              label="Rechercher un utilisateur"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Identifiant, email, rôle…"
            />
          </div>
          <Button onClick={ouvrirCreation} variant="secondary">
            <Plus className="h-4 w-4" /> Nouvel utilisateur
          </Button>
        </div>

        <Table columns={colonnes} data={pagination.currentItems} loading={loading} emptyLabel="Aucun utilisateur" />

        <Pagination pagination={pagination} />

        {/* Création / modification */}
        <Modal
          open={modal !== null}
          onClose={() => !saving && setModal(null)}
          title={modal?.mode === 'create' ? 'Nouvel utilisateur' : "Modifier l'utilisateur"}
          footer={
            <>
              <Button variant="secondary" onClick={() => setModal(null)} disabled={saving}>
                Annuler
              </Button>
              <Button
                onClick={enregistrer}
                loading={saving}
                disabled={modal?.mode === 'create' && !creationValide}
              >
                {modal?.mode === 'create' ? 'Créer' : 'Enregistrer'}
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            {modal?.mode === 'create' ? (
              <UsernameInput
                label="Identifiant"
                required
                value={form.username}
                onChange={(v) => setForm((f) => ({ ...f, username: v }))}
                placeholder="prenom.nom"
              />
            ) : (
              <div>
                <p className="text-xs font-medium text-slate-500">Identifiant</p>
                <p className="mt-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                  {form.username}
                </p>
              </div>
            )}

            <EmailInput
              label="Email"
              required
              value={form.email}
              onChange={(v) => setForm((f) => ({ ...f, email: v }))}
            />

            <Select
              label="Rôle"
              required
              value={form.role_id}
              onChange={(e) => setForm((f) => ({ ...f, role_id: e.target.value }))}
            >
              <option value="">Sélectionner…</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.nom}</option>
              ))}
            </Select>

            {modal?.mode === 'create' ? (
              <PasswordInput
                label="Mot de passe"
                required
                value={form.password}
                onChange={(v) => setForm((f) => ({ ...f, password: v }))}
              />
            ) : (
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.actif}
                  onChange={(e) => setForm((f) => ({ ...f, actif: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300"
                />
                Compte actif
              </label>
            )}
          </div>
        </Modal>

        {/* Réinitialisation du mot de passe */}
        <Modal
          open={reset !== null}
          onClose={() => !saving && setReset(null)}
          title={`Réinitialiser le mot de passe — ${reset?.username || ''}`}
          size="sm"
          footer={
            <>
              <Button variant="secondary" onClick={() => setReset(null)} disabled={saving}>
                Annuler
              </Button>
              <Button onClick={reinitialiser} loading={saving} disabled={!nouveauMdp}>
                Réinitialiser
              </Button>
            </>
          }
        >
          <PasswordInput
            label="Nouveau mot de passe"
            required
            value={nouveauMdp}
            onChange={setNouveauMdp}
          />
          <p className="mt-2 text-xs text-slate-500">
            Au moins 8 caractères, dont une majuscule, une minuscule, un chiffre et un caractère spécial.
          </p>
        </Modal>

        {/* Confirmation (suppression / bascule) */}
        <ConfirmDialog
          open={confirm !== null}
          onClose={() => !saving && setConfirm(null)}
          onConfirm={confirmer}
          loading={saving}
          danger={confirm?.action === 'supprimer'}
          title={confirm?.action === 'supprimer' ? "Supprimer l'utilisateur" : 'Modifier le statut'}
          message={
            confirm?.action === 'supprimer'
              ? `Supprimer définitivement le compte ${confirm?.user?.username} ? Cette action est irréversible.`
              : `${Number(confirm?.user?.actif) ? 'Désactiver' : 'Activer'} le compte ${confirm?.user?.username} ?`
          }
          confirmLabel={confirm?.action === 'supprimer' ? 'Supprimer' : 'Confirmer'}
        />
      </div>
    </AnimatedCard>
  );
}

export default UsersAdminPage;
