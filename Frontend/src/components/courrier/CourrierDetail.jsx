import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import { courrierService } from '../../services/courrierService.js';
import { useNotification } from '../../hooks/useNotification.js';
import { Badge } from '../ui/Badge.jsx';
import { Card } from '../ui/Card.jsx';
import { Button } from '../ui/Button.jsx';
import { Select } from '../ui/Select.jsx';
import { Spinner } from '../ui/Spinner.jsx';
import { Alert } from '../ui/Alert.jsx';
import { DocumentList } from '../document/DocumentList.jsx';
import { DocumentUpload } from '../document/DocumentUpload.jsx';
import { formatDateTime } from '../../utils/formatDate.js';

const SENS_BADGE = {
  ENTRANT: 'border-sky-200 bg-sky-50 text-sky-700',
  SORTANT: 'border-violet-200 bg-violet-50 text-violet-700',
};

const COURRIER_STATUTS = ['RECU', 'TRANSMIS', 'TRAITE', 'CLASSE'];

export function CourrierDetail({ id }) {
  const { toastSuccess, toastError } = useNotification();
  const [courrier, setCourrier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setCourrier(await courrierService.get(id));
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleStatut = async (e) => {
    try {
      await courrierService.updateStatut(id, e.target.value);
      toastSuccess('Statut du courrier mis à jour.');
      await load();
    } catch (err) {
      toastError(err.message);
    }
  };

  if (loading) return <Spinner label="Chargement du courrier…" />;
  if (error) return <Alert type="error">{error.message}</Alert>;
  if (!courrier) return <Alert type="warning">Courrier introuvable.</Alert>;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link to="/courriers">
            <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /> Retour</Button>
          </Link>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
            <Mail className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-lg font-bold text-slate-800">{courrier.numero}</h1>
            <div className="mt-0.5 flex items-center gap-2">
              <Badge className={SENS_BADGE[courrier.sens] || 'border-slate-200'}>
                {courrier.sens === 'ENTRANT' ? 'Entrant' : 'Sortant'}
              </Badge>
              <Badge className="border-blue-200 bg-blue-50 text-blue-700">{courrier.statut}</Badge>
            </div>
          </div>
        </div>
        <div className="w-44">
          <Select label="Changer le statut" value={courrier.statut} onChange={handleStatut}>
            {COURRIER_STATUTS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
        </div>
      </div>

      <Card title="Informations">
        <dl className="grid gap-x-8 sm:grid-cols-2">
          <div className="flex justify-between border-b border-slate-100 py-2">
            <dt className="text-xs font-medium text-slate-500">Type</dt>
            <dd className="text-sm text-slate-700">{courrier.type_libelle || '—'}</dd>
          </div>
          <div className="flex justify-between border-b border-slate-100 py-2">
            <dt className="text-xs font-medium text-slate-500">Objet</dt>
            <dd className="text-sm text-slate-700">{courrier.objet}</dd>
          </div>
          <div className="flex justify-between border-b border-slate-100 py-2">
            <dt className="text-xs font-medium text-slate-500">Expéditeur</dt>
            <dd className="text-sm text-slate-700">{courrier.expediteur || '—'}</dd>
          </div>
          <div className="flex justify-between border-b border-slate-100 py-2">
            <dt className="text-xs font-medium text-slate-500">Destinataire</dt>
            <dd className="text-sm text-slate-700">{courrier.destinataire || '—'}</dd>
          </div>
          <div className="flex justify-between border-b border-slate-100 py-2">
            <dt className="text-xs font-medium text-slate-500">Division</dt>
            <dd className="text-sm text-slate-700">{courrier.division_nom || '—'}</dd>
          </div>
          <div className="flex justify-between border-b border-slate-100 py-2">
            <dt className="text-xs font-medium text-slate-500">Créé le</dt>
            <dd className="text-sm text-slate-700">{formatDateTime(courrier.created_at)}</dd>
          </div>
          {courrier.dossier_id && (
            <div className="sm:col-span-2 flex justify-between py-2">
              <dt className="text-xs font-medium text-slate-500">Dossier lié</dt>
              <dd>
                <Link to={`/dossiers/${courrier.dossier_id}`} className="text-sm font-semibold text-primary-600 hover:underline">
                  Voir le dossier #{courrier.dossier_id}
                </Link>
              </dd>
            </div>
          )}
        </dl>
      </Card>

      <Card
        title="Documents joint"
        actions={<DocumentUpload courrierId={courrier.id} onUploaded={() => setRefreshKey((k) => k + 1)} />}
      >
        <DocumentList key={`docs-${refreshKey}`} courrierId={courrier.id} />
      </Card>
    </div>
  );
}

export default CourrierDetail;