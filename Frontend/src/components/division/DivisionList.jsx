import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { divisionService } from '../../services/divisionService.js';
import { usePagination } from '../../hooks/usePagination.js';
import { useNotification } from '../../hooks/useNotification.js';
import { Table } from '../ui/Table.jsx';
import { Pagination } from '../ui/Pagination.jsx';
import { Button } from '../ui/Button.jsx';
import { Badge } from '../ui/Badge.jsx';
import { EmptyState } from '../ui/EmptyState.jsx';
import { Alert } from '../ui/Alert.jsx';
import { ConfirmDialog } from '../ui/ConfirmDialog.jsx';
import { DivisionForm } from './DivisionForm.jsx';
import { Modal } from '../ui/Modal.jsx';

/**
 * Liste des divisions : création, modification et suppression.
 *
 * La modification réutilise le formulaire de création (`DivisionForm`) avec
 * l'objet de la ligne : le formulaire sait déjà basculer en mode édition, et
 * une division se définit par un code, un nom, un responsable et un état.
 */
export function DivisionList() {
  const { toastSuccess, toastError } = useNotification();
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [edition, setEdition] = useState(null);
  const [aSupprimer, setASupprimer] = useState(null);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const rows = await divisionService.list();
      setDivisions(Array.isArray(rows) ? rows : []);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(load);
  }, [load]);

  const pagination = usePagination(divisions, 10);

  const ouvrirCreation = () => {
    setEdition(null);
    setOpen(true);
  };

  const ouvrirEdition = (division) => {
    setEdition(division);
    setOpen(true);
  };

  const supprimer = async () => {
    setSuppressionEnCours(true);
    try {
      await divisionService.remove(aSupprimer.id);
      toastSuccess('Division supprimée.');
      setASupprimer(null);
      await load();
    } catch (e) {
      toastError(e.message);
    } finally {
      setSuppressionEnCours(false);
    }
  };

  const columns = [
    { key: 'code', label: 'Code', render: (r) => <Badge className="border-slate-200 bg-slate-50">{r.code}</Badge> },
    { key: 'nom', label: 'Division', render: (r) => <span className="font-medium text-slate-700">{r.nom}</span> },
    {
      key: 'responsable',
      label: 'Responsable',
      render: (r) =>
        r.responsable_nom ? `${r.responsable_nom} ${r.responsable_prenom || ''}` : '—',
    },
    {
      key: 'actif',
      label: 'Statut',
      render: (r) =>
        r.actif ? (
          <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">Active</Badge>
        ) : (
          <Badge className="border-slate-200 bg-slate-100 text-slate-500">Inactive</Badge>
        ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            title="Modifier"
            aria-label={`Modifier ${r.nom}`}
            onClick={() => ouvrirEdition(r)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-red-600 hover:bg-red-50"
            title="Supprimer"
            aria-label={`Supprimer ${r.nom}`}
            onClick={() => setASupprimer(r)}
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
        <Alert type="error" title="Impossible de charger les divisions">
          {error.message || String(error)}
        </Alert>
      )}
      <div className="flex justify-end">
        <Button onClick={ouvrirCreation}>
          <Plus className="h-4 w-4" /> Nouvelle division
        </Button>
      </div>
      {(loading || divisions.length > 0) && (
        <Table columns={columns} data={pagination.currentItems} loading={loading} />
      )}
      {!loading && divisions.length === 0 && (
        <EmptyState title="Aucune division" message="Créez la première division." />
      )}
      <Pagination pagination={pagination} />

      {/* Pas de pied de page ici : le formulaire porte lui-même sa barre
          d'actions (« Annuler » et « Créer la division »), collée en bas de la
          zone visible. Une deuxième barre ferait doublon. */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={edition ? `Modifier la division ${edition.nom}` : 'Nouvelle division'}
      >
        {/* La clé force la reconstruction du formulaire : sans elle, passer
            d'une division à une autre conserverait les valeurs de la première. */}
        <DivisionForm
          key={edition?.id ?? 'nouvelle'}
          initial={edition}
          onCancel={() => setOpen(false)}
          onSaved={() => {
            setOpen(false);
            load();
          }}
        />
      </Modal>

      <ConfirmDialog
        open={aSupprimer !== null}
        onClose={() => !suppressionEnCours && setASupprimer(null)}
        onConfirm={supprimer}
        loading={suppressionEnCours}
        danger
        title="Supprimer la division"
        message={`Supprimer la division ${aSupprimer?.nom || ''} ? Les dossiers rattachés empêcheront la suppression.`}
        confirmLabel="Supprimer"
      />
    </div>
  );
}

export default DivisionList;
