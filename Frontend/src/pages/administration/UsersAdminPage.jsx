import { useState, useEffect, useCallback } from 'react';
import { Plus, KeyRound, UserCog } from 'lucide-react';
import { userService } from '../../services/userService.js';
import { roleService } from '../../services/roleService.js';
import { useNotification } from '../../hooks/useNotification.js';
import { Table } from '../../components/ui/Table.jsx';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Select } from '../../components/ui/Select.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import {
  UsernameInput,
  EmailInput,
  PasswordInput,
} from '../../components/fields/index.jsx';
import { usePagination } from '../../hooks/usePagination.js';
import { useAuth } from '../../hooks/useAuth.js';
import { AnimatedCard } from '../../components/ui/AnimatedCard.jsx';

export function UsersAdminPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');

  const totalPages = Math.ceil(users.length / pageSize);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const [us, rs] = await Promise.all([userService.list(), roleService.list()]);
      setUsers(Array.isArray(us) ? us : []);
      setRoles(Array.isArray(rs) ? rs : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  if (loading) return <Spinner label="Chargement des utilisateurs…" />;
  if (error) return <Alert type="error">{error.message}</Alert>;

  return (
    <AnimatedCard title="Utilisateurs" subtitle="Gestion des comptes et des rôles du personnel." delay={0}>
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Input
              label="Rechercher un utilisateur"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nom, email, rôle…"
            />
          </div>
          <Button onClick={() => setSelected(null)} variant="secondary">
            <Plus className="h-4 w-4" /> Nouvel utilisateur
          </Button>
        </div>
        <Table
          columns={[
            { key: 'username', label: 'Identifiant', render: (u) => <span className="font-medium">{u.username}</span> },
            { key: 'email', label: 'Email', render: (u) => <span className="text-sm text-slate-500">{u.email}</span> },
            { key: 'role', label: 'Rôle', render: (u) => <Badge className="border-primary-200 bg-primary-50 text-primary-700">{u.role_nom}</Badge> },
            { key: 'division', label: 'Division', render: (u) => <span className="text-slate-500">{u.division_nom || '—'}</span> },
            { key: 'statut', label: 'Statut', render: (u) => <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">Actif</Badge> },
          ]}
          data={users.slice((page - 1) * pageSize, page * pageSize)}
          loading={loading}
        />
        <div className="flex items-center justify-between">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      </div>
    </AnimatedCard>
  );
}

export default UsersAdminPage;