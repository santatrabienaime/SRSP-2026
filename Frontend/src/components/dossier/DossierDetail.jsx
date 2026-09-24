import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FolderKanban, Paperclip, History } from 'lucide-react';
import { useDossier } from '../../hooks/useDossier.js';
import { Badge } from '../ui/Badge.jsx';
import { Card } from '../ui/Card.jsx';
import { Spinner } from '../ui/Spinner.jsx';
import { Alert } from '../ui/Alert.jsx';
import { Button } from '../ui/Button.jsx';
import { DossierActions } from './DossierActions.jsx';
import { WorkflowTimeline } from './WorkflowTimeline.jsx';
import { TracabiliteTimeline } from './TracabiliteTimeline.jsx';
import { dossierService } from '../../services/dossierService.js';
import { DocumentList } from '../document/DocumentList.jsx';
import { DocumentUpload } from '../document/DocumentUpload.jsx';
import { formatDateString, formatDateTime } from '../../utils/formatDate.js';
import { formatStatus, statusBadgeClass } from '../../utils/formatStatus.js';
import { historiqueService } from '../../services/historiqueService.js';
import { useApi } from '../../hooks/useApi.js';
import { useAuth } from '../../hooks/useAuth.js';

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 py-2 last:border-0">
      <dt className="shrink-0 text-xs font-medium text-slate-500">{label}</dt>
      <dd className="text-right text-sm text-slate-700">{value || '—'}</dd>
    </div>
  );
}

/** Détail complet d'un dossier : infos, workflow, documents, historique. */
export function DossierDetail({ id }) {
  const { dossier, loading, error, refresh } = useDossier(id);
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  const historique = useApi(
    () => (id ? historiqueService.list({ dossier_id: id }) : Promise.resolve([])),
    [id, refreshKey]
  );

  // Traçabilité fine : actes métier (affectations, traitements, vérifications…)
  const tracabilite = useApi(
    () => (id ? dossierService.getTracabilite(id) : Promise.resolve([])),
    [id, refreshKey]
  );

  if (loading) return <Spinner label="Chargement du dossier…" />;
  if (error) {
    return (
      <Alert type="error" title="Erreur de chargement">
        {error.message}
      </Alert>
    );
  }
  if (!dossier) return <Alert type="warning">Dossier introuvable.</Alert>;

  const statusClass = statusBadgeClass(dossier.statut_code);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link to="/dossiers">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" /> Retour
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
              <FolderKanban className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-lg font-bold text-slate-800">{dossier.numero}</h1>
              <p className="text-xs text-slate-500">{dossier.type_libelle}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={statusClass}>{formatStatus(dossier.statut_code)}</Badge>
          <Badge className="border-amber-200 bg-amber-50 text-amber-700">
            {dossier.priorite_libelle}
          </Badge>
        </div>
      </div>

      {/* Actions workflow */}
      <Card className="bg-slate-50/60">
        <DossierActions dossier={dossier} onDone={refresh} />
      </Card>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Infos */}
        <Card title="Informations" className="lg:col-span-2">
          <dl className="grid gap-x-8 sm:grid-cols-2">
            <InfoRow label="Objet" value={dossier.objet} />
            <InfoRow label="Demandeur" value={dossier.demandeur} />
            <InfoRow label="Matricule" value={dossier.matricule} />
            <InfoRow label="Division" value={dossier.division_nom} />
            <InfoRow label="Date de réception" value={formatDateString(dossier.date_reception)} />
            <InfoRow label="Agent responsable" value={dossier.agent_nom ? `${dossier.agent_nom} ${dossier.agent_prenom || ''}` : null} />
            <InfoRow label="Date de clôture" value={dossier.date_cloture ? formatDateTime(dossier.date_cloture) : null} />
            <InfoRow label="Date d'archivage" value={dossier.date_archivage ? formatDateTime(dossier.date_archivage) : null} />
          </dl>
          {dossier.observation && (
            <p className="mt-3 rounded-md bg-slate-50 p-3 text-sm text-slate-600">
              <span className="font-semibold">Observation : </span>
              {dossier.observation}
            </p>
          )}
        </Card>

        {/* Workflow */}
        <Card title="Workflow du dossier">
          <WorkflowTimeline statut={dossier.statut_code} />
          <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-[11px] text-amber-700">
            Règle forte : un dossier en « correction demandée » doit repasser par le
            traitement avant toute validation.
          </p>
        </Card>
      </div>

      {/* Traçabilité des actes métier */}
      <Card
        title="Traçabilité des actes"
        subtitle="Qui a affecté, traité, vérifié ou validé ce dossier"
      >
        {tracabilite.loading ? (
          <Spinner className="py-6" />
        ) : tracabilite.error ? (
          <Alert type="warning" title="Traçabilité indisponible">
            {tracabilite.error.message}
          </Alert>
        ) : (
          <TracabiliteTimeline actes={tracabilite.data || []} />
        )}
      </Card>

      {/* Documents */}
      <Card
        title="Documents"
        subtitle="Pièces jointes et justificatifs du dossier"
        actions={
          <DocumentUpload
            dossierId={dossier.id}
            dossierNumero={dossier.numero}
            onUploaded={() => setRefreshKey((k) => k + 1)}
          />
        }
      >
        <DocumentList key={refreshKey} dossierId={dossier.id} />
      </Card>

      {/* Historique */}
      <Card title="Historique des actions">
        {historique.loading ? (
          <Spinner className="py-6" />
        ) : historique.data && historique.data.length > 0 ? (
          <ul className="space-y-3">
            {historique.data.map((h) => (
              <li key={h.id} className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary-400" />
                <div className="min-w-0">
                  <p className="text-sm text-slate-700">
                    <span className="font-semibold">{h.action.replace(/_/g, ' ')}</span>
                    {h.details ? ` — ${h.details}` : ''}
                  </p>
                  <p className="text-xs text-slate-400">
                    {h.username || user?.username} · {formatDateTime(h.date_action)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-6 text-center text-sm text-slate-400">Aucune action enregistrée.</p>
        )}
      </Card>
    </div>
  );
}

export default DossierDetail;