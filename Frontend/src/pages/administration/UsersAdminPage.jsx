import { useState, useEffect, useCallback } from 'react';
import { Plus, KeyRound, UserCog } from 'lucide-react';
import { userService } from '../../services/userService.js';
import { roleService } from '../../services/roleService.js';
import { useNotification } from '../../hooks/useNotification.js';
import { Table } from '../../components/ui/Table.jsx';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Select } from '../../components/ui/Select.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { usePagination } from '../../hooks/usePagination.js';
import { useAuth } from '../../hooks/useAuth.js';
import { formatDateTime } from '../../utils/formatDate.js';

export function UsersAdminPage() {
  const { user: me } = useAuth();
  const { toastSuccess, toastError } = useNotification();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [resetTarget, setResetTarget] = useState(null);
  const [resetPwd, setResetPwd] = useState('');
  const [form, setForm] = useState({ username: '', email: '', password: '', role_id: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [us, rs] = await Promise.all([userService.list(), roleService.list()]);
      setUsers(Array.isArray(us) ? us : []);
      setRoles(Array.isArray(rs) ? rs : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const pagination = usePagination(users, 10);

  const openCreate = () => {
    setEditing(null);
    setForm({ username: '', email: '', password: '', role_id: '' });
    setError(null);
    setOpen(true);
  };

  const openEdit = (u) => {
    setEditing(u);
    setForm({ username: u.username, email: u.email, password: '', role_id: u.role_id || '' });
    setError(null);
    setOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.username || !form.email || !form.role_id || (!editing && !form.password)) {
      setError({ message: 'Champs obligatoires : identifiant, email, rôle et mot de passe (à la création).' });
      return;
    }
    if (!editing && form.password.length < 8) {
      setError({ message: 'Le mot de passe doit contenir au moins 8 caractères.' });
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await userService.update(editing.id, {
          email: form.email,
          role_id: Number(form.role_id),
          actif: editing.actif,
        });
        toastSuccess('Utilisateur mis à jour.');
      } else {
        await userService.create({
          username: form.username,
          email: form.email,
          password: form.password,
          role_id: Number(form.role_id),
        });
        toastSuccess('Utilisateur créé.');
      }
      setOpen(false);
      await load();
    } catch (err) {
      setError(err);
      toastError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!resetPwd || resetPwd.length < 8) {
      toastError('Le nouveau mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    try {
      await userService.resetPassword(resetTarget.id, resetPwd);
      toastSuccess('Mot de passe réinitialisé.');
      setResetTarget(null);
      setResetPwd('');
    } catch (e) {
      toastError(e.message);
    }
  };

  const columns = [
    { key: 'username', label: 'Identifiant', render: (r) => <span className="font-medium text-slate-700">{r.username}</span> },
    { key: 'email', label: 'Email' },
    {
      key: 'role_nom',
      label: 'Rôle',
      render: (r) => <Badge className="border-primary-200 bg-primary-50 text-primary-700">{r.role_nom}</Badge>,
    },
    {
      key: 'actif',
      label: 'Statut',
      render: (r) =>
        r.actif ? (
          <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">Actif</Badge>
        ) : (
          <Badge className="border-slate-200 bg-slate-100 text-slate-500">Inactif</Badge>
        ),
    },
    { key: 'derniere_connexion', label: 'Dernière connexion', render: (r) => (r.derniere_connexion ? formatDateTime(r.derniere_connexion) : '—') },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => openEdit(r)} title="Modifier">
            <UserCog className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setResetTarget(r)} title="Réinitialiser le mot de passe">
            <KeyRound className="h-4 w-4 text-amber-600" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Utilisateurs</h1>
          <p className="text-sm text-slate-500">Gestion des comptes et des rôles (RBAC v2.0).</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Nouvel utilisateur
        </Button>
      </div>

      <Card>
        <Table columns={columns} data={pagination.currentItems} loading={loading} />
        <Pagination pagination={pagination} className="mt-4" />
      </Card>

      {/* Création / édition */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? `Modifier ${editing.username}` : 'Nouvel utilisateur'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Annuler</Button>
            <Button type="submit" form="user-form" loading={saving}>Enregistrer</Button>
          </>
        }
      >
        <form id="user-form" onSubmit={handleSubmit} className="space-y-4">
          {error && <Alert type="error">{error.message}</Alert>}
          <Input label="Identifiant" required disabled={Boolean(editing)} value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} />
          <Input label="Email" required type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          {!editing && (
            <Input label="Mot de passe" required type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} hint="8 caractères minimum" />
          )}
          <Select label="Rôle" required value={form.role_id} onChange={(e) => setForm((f) => ({ ...f, role_id: e.target.value }))}>
            <option value="">Sélectionner…</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>{r.nom}</option>
            ))}
          </Select>
          {editing?.id === me?.id && (
            <p className="text-xs text-amber-600">Attention : modification de votre propre compte.</p>
          )}
        </form>
      </Modal>

      {/* Réinitialisation */}
      <Modal
        open={resetTarget !== null}
        onClose={() => setResetTarget(null)}
        title={`Réinitialiser le mot de passe — ${resetTarget?.username}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setResetTarget(null)}>Annuler</Button>
            <Button variant="danger" onClick={handleReset}>Réinitialiser</Button>
          </>
        }
      >
        <Input
          label="Nouveau mot de passe"
          type="password"
          value={resetPwd}
          onChange={(e) => setResetPwd(e.target.value)}
          hint="8 caractères minimum — communiquez-le à l'utilisateur"
          autoFocus
        />
      </Modal>
    </div>
  );
}

export default UsersAdminPage;