import { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Pencil, KeyRound, Power, Trash2 } from 'lucide-react';
import { personnelService } from '../../services/personnelService.js';
import { usePagination } from '../../hooks/usePagination.js';
import { useNotification } from '../../hooks/useNotification.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { Table } from '../ui/Table.jsx';
import { Pagination } from '../ui/Pagination.jsx';
import { Button } from '../ui/Button.jsx';
import { Badge } from '../ui/Badge.jsx';
import { Modal } from '../ui/Modal.jsx';
import { Alert } from '../ui/Alert.jsx';
import { EmptyState } from '../ui/EmptyState.jsx';
import { ConfirmDialog } from '../ui/ConfirmDialog.jsx';
import { AutoCompleteInput, PasswordInput } from '../fields/index.jsx';
import { formatDateTime } from '../../utils/formatDate.js';
import { PersonnelForm } from './PersonnelForm.jsx';

/**
 * Personnel : une seule liste pour la fiche d'une personne et son compte.
 *
 * L'application tenait deux écrans — « Agents » et « Utilisateurs » — qui
 * décrivaient les mêmes personnes, l'un la fiche, l'autre la connexion. On y
 * créait un compte sans personne, on rattachait deux fiches au même compte, et
 * les deux écrans finissaient par afficher des emails différents. Ici, chaque
 * ligne est une personne, avec son accès, et tout s'écrit au même endroit :
 * créer, modifier, activer/désactiver, réinitialiser le mot de passe,
 * supprimer.
 */
export function PersonnelList() {
  const { toastSuccess, toastError } = useNotification();

  const [personnel, setPersonnel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  // Modale fiche + compte.
  const [editant, setEditant] = useState(null); // null = fermée, {} = création, { id… } = édition
  const [reset, setReset] = useState(null); // { id, nom, username }
  const [nouveauMdp, setNouveauMdp] = useState('');
  const [confirm, setConfirm] = useState(null); // { action, personne }

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await personnelService.list();
      setPersonnel(Array.isArray(rows) ? rows : []);
      setError(null);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { Promise.resolve().then(load); }, [load]);

  /* Le filtre s'applique avant la pagination : la page affichée correspond
     toujours au résultat cherché. */
  const filtres = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return personnel;
    return personnel.filter((p) =>
      [p.nom, p.prenom, p.matricule, p.username, p.role_nom, p.fonction_libelle, p.division_nom, p.email]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [personnel, debouncedSearch]);

  const pagination = usePagination(filtres, 10);

  const suggestions = useMemo(
    () => personnel.map((p) => `${p.nom} ${p.prenom}`),
    [personnel]
  );

  const ouvrirCreation = () => setEditant({});
  const ouvrirEdition = (p) => setEditant(p);

  const reinitialiser = async () => {
    setSaving(true);
    try {
      await personnelService.resetPassword(reset.id, nouveauMdp);
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
        const r = await personnelService.remove(confirm.personne.id);
        toastSuccess(r?.message || 'Personne supprimée.');
      } else {
        await personnelService.toggle(confirm.personne.id);
        toastSuccess(
          confirm.personne.actif ? 'Personne désactivée.' : 'Personne réactivée.'
        );
      }
      setConfirm(null);
      await load();
    } catch (e) {
      toastError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const colonnes = [
    {
      key: 'personne',
      label: 'Personne',
      render: (p) => (
        <span className="font-medium text-slate-800">{p.nom} {p.prenom}</span>
      ),
    },
    {
      key: 'matricule',
      label: 'N° matricule',
      render: (p) =>
        p.matricule ? (
          <Badge className="border-slate-200 bg-slate-50">{p.matricule}</Badge>
        ) : (
          <span className="text-sm text-slate-400">—</span>
        ),
    },
    {
      key: 'fonction',
      label: 'Fonction',
      render: (p) => <span className="text-sm text-slate-600">{p.fonction_libelle || '—'}</span>,
    },
    {
      key: 'division',
      label: 'Division',
      render: (p) => <span className="text-sm text-slate-600">{p.division_nom || '—'}</span>,
    },
    {
      key: 'compte',
      label: 'Compte',
      render: (p) =>
        p.compte_id ? (
          <span className="flex flex-col gap-0.5">
            <span className="text-sm text-slate-700">{p.username}</span>
            <Badge className="border-primary-200 bg-primary-50 text-primary-700">
              {p.role_nom || '—'}
            </Badge>
          </span>
        ) : (
          <Badge className="border-amber-200 bg-amber-50 text-amber-700">Sans compte</Badge>
        ),
    },
    {
      key: 'actif',
      label: 'Statut',
      render: (p) =>
        p.actif ? (
          <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">Active</Badge>
        ) : (
          <Badge className="border-slate-200 bg-slate-100 text-slate-600">Désactivée</Badge>
        ),
    },
    {
      key: 'derniere_connexion',
      label: 'Dernière connexion',
      render: (p) => (
        <span className="text-sm text-slate-500">
          {p.compte_id
            ? p.derniere_connexion
              ? formatDateTime(p.derniere_connexion)
              : 'Jamais'
            : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (p) => (
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            title="Modifier la fiche et le compte"
            aria-label={`Modifier ${p.nom} ${p.prenom}`}
            onClick={() => ouvrirEdition(p)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          {p.compte_id && (
            <Button
              size="sm"
              variant="ghost"
              title="Réinitialiser le mot de passe"
              aria-label={`Réinitialiser le mot de passe de ${p.username}`}
              onClick={() => {
                setReset({ id: p.id, nom: `${p.nom} ${p.prenom}`, username: p.username });
                setNouveauMdp('');
              }}
            >
              <KeyRound className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            title={p.actif ? 'Désactiver la personne' : 'Activer la personne'}
            aria-label={`${p.actif ? 'Désactiver' : 'Activer'} ${p.nom} ${p.prenom}`}
            onClick={() => setConfirm({ action: 'toggle', personne: p })}
          >
            <Power className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-red-600 hover:bg-red-50"
            title="Supprimer"
            aria-label={`Supprimer ${p.nom} ${p.prenom}`}
            onClick={() => setConfirm({ action: 'supprimer', personne: p })}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {error && (
        <Alert type="error" title="Impossible de charger le personnel">
          {error.message || String(error)}
        </Alert>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <AutoCompleteInput
            label="Rechercher une personne"
            value={search}
            onChange={setSearch}
            suggestions={suggestions}
            showCounter={false}
            placeholder="Nom, matricule, identifiant, division…"
          />
        </div>
        <Button onClick={ouvrirCreation} variant="secondary">
          <Plus className="h-4 w-4" /> Nouvelle personne
        </Button>
      </div>

      <Table
        columns={colonnes}
        data={pagination.currentItems}
        loading={loading}
        emptyLabel="Aucune personne"
      />

      {!loading && personnel.length === 0 && (
        <EmptyState
          title="Aucune personne"
          message="Créez la première fiche : sa division et son compte de connexion se saisissent dans le même formulaire."
        />
      )}

      <Pagination pagination={pagination} />

      {/* Pas de pied de page : le formulaire porte sa propre barre d'actions,
          collée en bas de la zone visible. */}
      <Modal
        open={editant !== null}
        onClose={() => setEditant(null)}
        title={editant?.id ? `Modifier ${editant.nom} ${editant.prenom}` : 'Nouvelle personne'}
        size="lg"
      >
        <PersonnelForm
          key={editant?.id ?? 'nouvelle'}
          initial={editant?.id ? editant : null}
          onCancel={() => setEditant(null)}
          onSaved={() => {
            setEditant(null);
            load();
          }}
        />
      </Modal>

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
      </Modal>

      <ConfirmDialog
        open={confirm !== null}
        onClose={() => !saving && setConfirm(null)}
        onConfirm={confirmer}
        loading={saving}
        danger={confirm?.action === 'supprimer'}
        title={
          confirm?.action === 'supprimer' ? 'Supprimer la personne' : 'Modifier le statut'
        }
        message={
          confirm?.action === 'supprimer'
            ? `Supprimer ${confirm?.personne?.nom} ${confirm?.personne?.prenom} ? Sa fiche et son compte de connexion seront supprimés. Une personne déjà citée par des dossiers sera désactivée au lieu d'être supprimée.`
            : confirm?.personne?.actif
              ? `Désactiver ${confirm?.personne?.nom} ${confirm?.personne?.prenom} ? Sa fiche et son compte de connexion seront désactivés : elle ne pourra plus se connecter.`
              : `Réactiver ${confirm?.personne?.nom} ${confirm?.personne?.prenom} et son compte de connexion ?`
        }
        confirmLabel={confirm?.action === 'supprimer' ? 'Supprimer' : 'Confirmer'}
      />
    </div>
  );
}

export default PersonnelList;
