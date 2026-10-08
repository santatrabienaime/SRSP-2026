import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, FolderKanban, Info, FileText, History, MessageSquare, Calculator } from 'lucide-react';
import { useDossier } from '../../hooks/useDossier.js';
import { Badge } from '../ui/Badge.jsx';
import { Card } from '../ui/Card.jsx';
import { Spinner } from '../ui/Spinner.jsx';
import { Alert } from '../ui/Alert.jsx';
import { Button } from '../ui/Button.jsx';
import { DossierActions } from './DossierActions.jsx';
import { WorkflowTimeline } from './WorkflowTimeline.jsx';
import { TracabiliteTimeline } from './TracabiliteTimeline.jsx';
import { DepouillementChecklist } from './DepouillementChecklist.jsx';
import { Mandatement } from './Mandatement.jsx';
import { LiquidationPension } from './LiquidationPension.jsx';
import { DecompteAvance } from './DecompteAvance.jsx';
import { ControleDecompte } from './ControleDecompte.jsx';
import { CommentairesDossier } from './CommentairesDossier.jsx';
import { HistoriqueDossier } from './HistoriqueDossier.jsx';
import { dossierService } from '../../services/dossierService.js';
import { DocumentList } from '../document/DocumentList.jsx';
import { DocumentUpload } from '../document/DocumentUpload.jsx';
import { formatDateString, formatDateTime } from '../../utils/formatDate.js';
import { formatStatus, statusBadgeClass } from '../../utils/formatStatus.js';
import { historiqueService } from '../../services/historiqueService.js';
import { useApi } from '../../hooks/useApi.js';

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 py-2 last:border-0">
      <dt className="shrink-0 text-xs font-medium text-slate-500">{label}</dt>
      <dd className="text-right text-sm text-slate-700">{value || '—'}</dd>
    </div>
  );
}

/**
 * Détail complet d'un dossier, en onglets.
 *
 * Le document de traçabilité demande des onglets distincts (Informations,
 * Documents, Historique, Commentaires) : un historique noyé en bas d'une page
 * longue n'est plus consulté, et l'exigence « aucune action cachée » suppose
 * qu'elle soit visible.
 *
 * Les panneaux métier (liquidation, décompte, dépouillement) dépendent du type
 * de dossier et n'ont pas leur place dans les quatre onglets du document : ils
 * reçoivent un onglet « Calculs », présent seulement quand le type le justifie.
 * Aucun panneau n'est retiré — un dossier Pension garde ainsi sa liquidation
 * accessible en un clic.
 */
export function DossierDetail({ id }) {
  const { dossier, loading, error, refresh } = useDossier(id);
  const location = useLocation();
  const [refreshKey, setRefreshKey] = useState(0);
  const [onglet, setOnglet] = useState('infos');

  const historique = useApi(
    () => (id ? historiqueService.list({ dossier_id: id }) : Promise.resolve({ actions: [] })),
    [id, refreshKey]
  );

  // Traçabilité fine : actes métier (affectations, traitements, vérifications…)
  const tracabilite = useApi(
    () => (id ? dossierService.getTracabilite(id) : Promise.resolve([])),
    [id, refreshKey]
  );

  /* Une notification peut ouvrir la fiche sur une ancre (#commentaires,
     #documents, #liquidation-pension…). En onglets, l'ancre seule ne
     suffirait pas : la section visée resterait masquée. On ouvre donc l'onglet
     correspondant, sinon l'utilisateur atterrirait sur une fiche qui ne montre
     pas ce que la notification lui annonçait. */
  const ONGLETS_PAR_ANCRE = {
    commentaires: 'commentaires',
    documents: 'documents',
    historique: 'historique',
    liquidation: 'calculs',
    'liquidation-pension': 'calculs',
    'decompte-avance': 'calculs',
    'controle-decompte': 'calculs',
    calculs: 'calculs',
  };

  useEffect(() => {
    const ancre = (location.hash || '').replace('#', '');
    if (!ancre) return;
    const cible = ONGLETS_PAR_ANCRE[ancre];
    if (cible) Promise.resolve().then(() => setOnglet(cible));
  }, [location.hash]);

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

  /* Les quatre onglets du document, plus « Calculs » qui n'existe que pour les
     types qui ont des panneaux financiers. Un onglet vide serait un clic qui ne
     mène nulle part. */
  const TYPES_AVEC_CALCULS = ['PENSION', 'SOLDE', 'SECOURS'];
  const nombreActions = historique.data?.actions?.length || 0;
  const onglets = [
    { cle: 'infos', label: 'Informations', icon: Info },
    ...(TYPES_AVEC_CALCULS.includes(dossier.type_code)
      ? [{ cle: 'calculs', label: 'Calculs', icon: Calculator }]
      : []),
    { cle: 'documents', label: 'Documents', icon: FileText },
    { cle: 'historique', label: 'Historique', icon: History },
    { cle: 'commentaires', label: 'Commentaires', icon: MessageSquare },
  ];

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

      {/* Barre d'onglets. Rendue seulement s'il y a quelque chose à montrer :
          sans panneau métier, l'onglet « Calculs » n'existe pas. */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex flex-wrap gap-1" role="tablist">
          {onglets.map((o) => {
            const Icon = o.icon;
            const actif = onglet === o.cle;
            return (
              <button
                key={o.cle}
                type="button"
                role="tab"
                aria-selected={actif}
                onClick={() => setOnglet(o.cle)}
                className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                  actif
                    ? 'border-primary-600 text-primary-700'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                {o.label}
                {o.cle === 'historique' && nombreActions > 0 && (
                  <span className="rounded-full bg-slate-100 px-1.5 text-[10px] font-semibold text-slate-600">
                    {nombreActions}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Onglet Informations */}
      {onglet === 'infos' && (
        <div className="grid gap-5 lg:grid-cols-3">
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

          <Card title="Workflow du dossier">
            <WorkflowTimeline statut={dossier.statut_code} />
            <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-[11px] text-amber-700">
              Règle forte : un dossier en « correction demandée » doit repasser par le
              traitement avant toute validation.
            </p>
          </Card>
        </div>
      )}

      {/* Onglet Calculs — selon le type de dossier.
          Les identifiants servent d'ancre : une notification de contrôle du
          décompte ramène directement au panneau concerné. */}
      {onglet === 'calculs' && (
        <div className="space-y-5">
          {dossier.type_code === 'PENSION' && (
            <div id="liquidation-pension" className="scroll-mt-20">
              <LiquidationPension dossierId={dossier.id} />
            </div>
          )}
          {dossier.type_code === 'SOLDE' && (
            <>
              <div id="decompte-avance" className="scroll-mt-20">
                <DecompteAvance dossierId={dossier.id} />
              </div>
              <div id="controle-decompte" className="scroll-mt-20">
                <ControleDecompte dossierId={dossier.id} />
              </div>
            </>
          )}
          {dossier.type_code === 'SECOURS' && (
            <>
              <DepouillementChecklist dossierId={dossier.id} />
              <Mandatement dossierId={dossier.id} />
            </>
          )}
        </div>
      )}

      {/* Onglet Documents */}
      {onglet === 'documents' && (
        <div id="documents" className="scroll-mt-20">
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
        </div>
      )}

      {/* Onglet Historique : le journal des actions, puis les actes métier.
          Les deux répondent à la même question — qui a fait quoi, quand — et
          les laisser côte à côte évite d'en consulter un seul. */}
      {onglet === 'historique' && (
        <div className="space-y-5">
          <Card
            title="Journal des actions"
            subtitle="Chaque action, avec son auteur, sa date et son heure exactes"
          >
            {historique.error ? (
              <Alert type="warning" title="Historique indisponible">
                {historique.error.message}
              </Alert>
            ) : (
              <HistoriqueDossier
                actions={historique.data?.actions || []}
                dossierId={dossier.id}
                dureeTraitement={historique.data?.duree_traitement}
                loading={historique.loading}
              />
            )}
          </Card>

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
        </div>
      )}

      {/* Onglet Commentaires (article 2.8) */}
      {onglet === 'commentaires' && (
        <div id="commentaires" className="scroll-mt-20">
          <CommentairesDossier dossierId={dossier.id} />
        </div>
      )}
    </div>
  );
}

export default DossierDetail;