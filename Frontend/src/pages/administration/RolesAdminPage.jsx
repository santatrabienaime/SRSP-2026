import { useState, useEffect, useCallback } from 'react';
import { Shield } from 'lucide-react';
import { roleService } from '../../services/roleService.js';
import { permissionService } from '../../services/permissionService.js';
import { useNotification } from '../../hooks/useNotification.js';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { Alert } from '../../components/ui/Alert.jsx';

const PERMISSION_GROUPS = [
  { label: 'Dossiers', perms: ['dossier.creer', 'dossier.modifier', 'dossier.supprimer'] },
  { label: 'Workflow', perms: ['dossier.affecter', 'dossier.traiter', 'dossier.verifier', 'dossier.valider', 'dossier.cloturer', 'dossier.archiver'] },
  { label: 'Administration', perms: ['user.gerer', 'role.gerer', 'division.gerer', 'agent.gerer', 'courrier.gerer'] },
];

/** Gestion des rôles et de la matrice RBAC par rôle. */
export function RolesAdminPage() {
  const { toastSuccess, toastError } = useNotification();
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [roleDetail, setRoleDetail] = useState(null);
  const [checkboxes, setCheckboxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [rs, ps] = await Promise.all([roleService.list(), permissionService.list()]);
      setRoles(Array.isArray(rs) ? rs : []);
      setPermissions(Array.isArray(ps) ? ps : []);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const selectRole = async (role) => {
    setSelected(role);
    setSaving(true);
    try {
      const detail = await roleService.get(role.id);
      setRoleDetail(detail);
      setCheckboxes((detail.permissions || []).map((p) => p.id));
    } catch (e) {
      setError(e);
    } finally {
      setSaving(false);
    }
  };

  const toggle = (id) =>
    setCheckboxes((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const savePermissions = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await roleService.setPermissions(selected.id, checkboxes);
      toastSuccess(`Permissions du rôle ${selected.nom} enregistrées.`);
      await selectRole(selected);
    } catch (e) {
      toastError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner label="Chargement des rôles…" />;
  if (error) return <Alert type="error">{error.message}</Alert>;

  const permMap = Object.fromEntries(permissions.map((p) => [p.id, p]));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Rôles &amp; permissions</h1>
        <p className="text-sm text-slate-500">Matrice RBAC : 13 postes SRSP, permissions par rôle.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Liste des rôles */}
        <Card title="Rôles (postes SRSP)">
          <ul className="divide-y divide-slate-100">
            {roles.map((r) => (
              <li key={r.id}>
                <button
                  onClick={() => selectRole(r)}
                  className={`flex w-full items-center justify-between gap-2 px-2 py-2.5 text-left hover:bg-slate-50 ${
                    selected?.id === r.id ? 'bg-primary-50/70' : ''
                  }`}
                >
                  <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Shield className="h-4 w-4 text-primary-500" />
                    {r.nom}
                  </span>
                  <Badge className="border-slate-200 bg-slate-50 text-slate-500">{r.nb_users} user(s)</Badge>
                </button>
              </li>
            ))}
          </ul>
        </Card>

        {/* Permissions du rôle sélectionné */}
        <Card
          title={selected ? `Permissions — ${selected.nom}` : 'Permissions'}
          subtitle={selected?.description || 'Sélectionnez un rôle à gauche.'}
          className="lg:col-span-2"
          actions={
            selected ? (
              <Button size="sm" onClick={savePermissions} loading={saving}>
                Enregistrer
              </Button>
            ) : null
          }
        >
          {!selected ? (
            <p className="py-10 text-center text-sm text-slate-400">
              Choisissez un rôle pour consulter et modifier ses permissions.
            </p>
          ) : (
            <div className="space-y-5">
              {PERMISSION_GROUPS.map((group) => (
                <div key={group.label}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {group.label}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {group.perms.map((permName) => {
                      const p = permissions.find((x) => x.nom === permName);
                      if (!p) return null;
                      const checked = checkboxes.includes(p.id);
                      return (
                        <label
                          key={p.id}
                          className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm ${
                            checked
                              ? 'border-primary-300 bg-primary-50/60 text-primary-800'
                              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="rounded border-slate-300 text-primary-600"
                            checked={checked}
                            onChange={() => toggle(p.id)}
                          />
                          <span className="font-mono text-xs">{p.nom}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
              {permissions
                .filter((p) => !PERMISSION_GROUPS.flatMap((g) => g.perms).includes(p.nom))
                .filter((p) => checkboxes.includes(p.id))
                .map((p) => (
                  <p key={p.id} className="text-xs text-slate-400">
                    Permission supplémentaire : <b>{p.nom}</b>
                  </p>
                ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default RolesAdminPage;