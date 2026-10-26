import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, FolderKanban, Info, History, MessageSquare, FileText, Download, Printer, Paperclip, Stamp, ArrowRightLeft, Calculator, Mail, TriangleAlert, ClipboardCheck } from 'lucide-react';
import { useDossier } from '../../hooks/useDossier.js';
import { useTempsReel } from '../../hooks/useTempsReel.js';
import { useAuth } from '../../hooks/useAuth.js';
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
import { HistoriqueDossier } from './HistoriqueDossier.jsx';
import { CommentairesDossier } from './CommentairesDossier.jsx';
import { DocumentsPanel } from './DocumentsPanel.jsx';
import { VisaPanel } from './VisaPanel.jsx';
import { ProchaineAction } from './ProchaineAction.jsx';
import { TransmissionsPanel } from './TransmissionsPanel.jsx';
import { SecoursPanel } from './SecoursPanel.jsx';
import { OperationPanel } from './OperationPanel.jsx';
import { CorrespondancesPanel } from './CorrespondancesPanel.jsx';
import { SignalementsPanel } from './SignalementsPanel.jsx';
import { dossierService } from '../../services/dossierService.js';
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
  const { dossier, loading, error, refresh, recharger } = useDossier(id);
  const { hasAnyPermission } = useAuth();
  const { abonner } = useTempsReel();
  const location = useLocation();
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const [onglet, setOnglet] = useState('infos');
  /* Action ouverte dans la barre d'actions. Elle est pilotée depuis
     l'extérieur : le bloc « À faire ensuite » ouvre l'action qu'il annonce,
     et l'agent n'a plus qu'un clic à faire. */
  const [actionOuverte, setActionOuverte] = useState(null);

  /* Correspondance entre le code d'action du serveur et la clé du
     formulaire de la barre d'actions. */
  const CORRESPONDANCE_ACTION = {
    ORIENTER: 'orienter',
    AFFECTER: 'affecter',
    TRAITER: 'traiter',
    SOUMETTRE: 'verifier',
    CORRIGER: 'traiter',
    RELANCER: 'complement',
    VERIFIER: 'valider',
    SIGNER: 'signer',
    CLOTURER: 'cloturer',
    ARCHIVER: 'archiver',
    PUBLIER: 'publier',
  };

  const ouvrirActionDemandee = (code) => {
    const cle = CORRESPONDANCE_ACTION[code];
    if (cle) setActionOuverte(cle);
  };

  const historique = useApi(
    () => (id ? historiqueService.list({ dossier_id: id }) : Promise.resolve({ actions: [] })),
    [id, refreshKey]
  );

  // Traçabilité fine : actes métier (affectations, traitements, vérifications…)
  const tracabilite = useApi(
    () => (id ? dossierService.getTracabilite(id) : Promise.resolve([])),
    [id, refreshKey]
  );

  /* Pièces requises du dossier : elles servent à rattacher un fichier déposé
     à la pièce qu'il satisfait. */
  const depouillement = useApi(
    () => (id ? dossierService.getDepouillement(id) : Promise.resolve(null)),
    [id, refreshKey]
  );
  const piecesDossier = [
    ...(depouillement.data?.depouillement || []),
    ...(depouillement.data?.archivage || []),
  ];

  /* Temps réel : si le dossier change d'état pendant qu'on le lit — un
     autre agent le soumet, le chef de division le valide — la fiche doit
     le refléter sans rechargement. Le journal et la traçabilité suivent,
     sinon la fiche montrerait un statut neuf et un journal périmé. */
  useEffect(() => {
    return abonner('dossier', (evenement) => {
      if (evenement?.dossier_id && Number(evenement.dossier_id) !== Number(id)) return;
      setRefreshKey((k) => k + 1);
      recharger();
    });
  }, [abonner, id, recharger]);

  const ONGLETS_PAR_ANCRE = {
    commentaires: 'commentaires',
    documents: 'documents',
    historique: 'historique',
  };

  const downloadFicheReception = async (forceDownload = false) => {
    try {
      const blob = await dossierService.ficheReceptionPDF(dossier.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `recepisse-${dossier.numero}.pdf`;
      document.body.appendChild(link);
      if (forceDownload) {
        link.click();
      } else {
        // Ouvrir dans un nouvel onglet pour impression
        window.open(url, '_blank');
      }
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(url), 60000);
    } catch (err) {
      console.error('Erreur téléchargement fiche réception:', err);
      alert('Impossible de générer la fiche de réception.');
    }
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
  const nombreActions = historique.data?.actions?.length || 0;

  /* Onglets de la fiche dossier : les quatre onglets du document (Informations,
     Documents, Historique, Commentaires), plus les panneaux métier réservés au
     type de dossier. Un onglet vide serait un clic qui ne mène nulle part :
     le panneau VISA n'apparaît que pour un dossier VISA, le panneau Secours
     que pour un dossier Secours.

     Les données d'opération et les correspondances appartiennent aux
     divisions qui portent une opération : Solde et Pensions pour les
     premières, Pensions et Secours pour les secondes. Le dossier Visa n'en a
     pas, et son onglet ne s'y ouvre pas. Le Secours garde son panneau
     propre : ses cinq étapes du mandat y sont décrites, et une donnée
     d'opération s'y ajouterait sans rien lui apprendre.

     Solde et Pensions n'ont ni panneau VISA ni panneau Secours : leur
     contrôle des pièces obligatoires vivait donc nulle part, alors que ces
     pièces bloquent la validation. L'onglet « Pièces » leur donne l'écran
     qui manquait. */
  const divisionsAvecOperation = ['SOLDE', 'PENSION'];
  const divisionsAvecCorrespondances = ['PENSION', 'SECOURS'];
  const divisionsAvecPieces = ['SOLDE', 'PENSION'];

  const onglets = [
    { cle: 'infos', label: 'Informations', icon: Info },
    { cle: 'documents', label: 'Documents', icon: Paperclip },
    ...(divisionsAvecPieces.includes(dossier.type_code)
      ? [{ cle: 'pieces', label: 'Pièces', icon: ClipboardCheck }]
      : []),
    { cle: 'transmissions', label: 'Transmissions', icon: ArrowRightLeft },
    ...(divisionsAvecOperation.includes(dossier.type_code)
      ? [{ cle: 'operation', label: 'Opération', icon: Calculator }]
      : []),
    ...(divisionsAvecCorrespondances.includes(dossier.type_code)
      ? [{ cle: 'correspondances', label: 'Correspondances', icon: Mail }]
      : []),
    { cle: 'historique', label: 'Historique', icon: History },
    { cle: 'commentaires', label: 'Commentaires', icon: MessageSquare },
    ...(dossier.type_code === 'VISA'
      ? [{ cle: 'visa', label: 'VISA', icon: Stamp }]
      : []),
    ...(dossier.type_code === 'SECOURS'
      ? [{ cle: 'secours', label: 'Secours', icon: FileText }]
      : []),
    /* La remontée des dossiers bloqués est un onglet de la fiche : la
       difficulté, son auteur et sa résolution se lisent là où se lit le
       dossier. L'onglet est réservé à ceux qui peuvent le tenir — le chef de
       division qui signale, le chef de service qui tranche, la coordination
       qui suit. Un agent n'a pas à voir un onglet qu'il ne peut pas ouvrir. */
    ...(hasAnyPermission(['signaler_dossier', 'traiter_signalement', 'consulter_signalements'])
      ? [{ cle: 'signalements', label: 'Signalements', icon: TriangleAlert }]
      : []),
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
              <p className="text-xs text-slate-500">
                {dossier.type_libelle}
                {dossier.matricule ? ` · Matricule : ${dossier.matricule}` : ''}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => downloadFicheReception()} title="Imprimer / Télécharger la fiche de réception">
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Fiche réception</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => downloadFicheReception(true)} title="Télécharger la fiche de réception (PDF)">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">PDF</span>
          </Button>
          <Badge className={statusClass}>{formatStatus(dossier.statut_code)}</Badge>
          <Badge className="border-amber-200 bg-amber-50 text-amber-700">
            {dossier.priorite_libelle}
          </Badge>
        </div>
      </div>

      {/* Actions workflow */}
      <Card className="bg-slate-50/60">
        <DossierActions
          dossier={dossier}
          onDone={refresh}
          onDeleted={() => navigate('/dossiers')}
          actionDemandee={actionOuverte}
          onActionDemandee={setActionOuverte}
        />
      </Card>

      {/* « À faire ensuite » : la prochaine action et l'acteur qui doit
          l'accomplir. Placé au-dessus de la barre d'actions : c'est
          l'information que l'agent cherche en premier. */}
      <ProchaineAction dossierId={dossier.id} onAction={ouvrirActionDemandee} />

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
              <InfoRow label="N° matricule" value={dossier.matricule} />
              <InfoRow label="Division" value={dossier.division_nom} />
              <InfoRow label="Date de réception" value={formatDateString(dossier.date_reception)} />
              <InfoRow label="Agent responsable" value={dossier.agent_nom ? `${dossier.agent_nom} ${dossier.agent_prenom || ''}` : null} />
              <InfoRow label="Date de clôture" value={dossier.date_cloture ? formatDateTime(dossier.date_cloture) : null} />
              <InfoRow label="Date d'archivage" value={dossier.date_archivage ? formatDateTime(dossier.date_archivage) : null} />
              {/* L'ancienneté est affichée telle quelle, sans jugement : le
                  dossier n'est jamais qualifié « en retard » ici. */}
              <InfoRow
                label="Ancienneté"
                value={dossier.age_jours === undefined || dossier.age_jours === null
                  ? null
                  : dossier.age_jours === 0
                    ? 'Reçu aujourd’hui'
                    : `Reçu il y a ${dossier.age_jours} jour(s)`}
              />
            </dl>
            {dossier.observation && (
              <p className="mt-3 rounded-md bg-slate-50 p-3 text-sm text-slate-600">
                <span className="font-semibold">Observation : </span>
                {dossier.observation}
              </p>
            )}

            {/* Archivage : la référence d'archive et l'emplacement de
                conservation. Le cahier des functionalities demande de
                conserver ces trois informations avec le dossier. */}
            {dossier.reference_archivage && (
              <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Archivage
                </p>
                <dl className="mt-1.5 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-500">Référence d’archive</dt>
                    <dd className="font-medium text-slate-800">
                      {dossier.reference_archivage}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-500">Archivé le</dt>
                    <dd className="text-slate-700">
                      {dossier.date_archivage_registre
                        ? formatDateTime(dossier.date_archivage_registre)
                        : formatDateString(dossier.date_archivage)}
                    </dd>
                  </div>
                  {dossier.emplacement_physique && (
                    <div className="flex justify-between gap-2">
                      <dt className="text-slate-500">Emplacement physique</dt>
                      <dd className="text-slate-700">{dossier.emplacement_physique}</dd>
                    </div>
                  )}
                  {dossier.localisation_numerique && (
                    <div className="flex justify-between gap-2">
                      <dt className="text-slate-500">Localisation numérique</dt>
                      <dd className="truncate text-slate-700">
                        {dossier.localisation_numerique}
                      </dd>
                    </div>
                  )}
                  {dossier.archive_par_username && (
                    <div className="flex justify-between gap-2">
                      <dt className="text-slate-500">Archivé par</dt>
                      <dd className="text-slate-700">{dossier.archive_par_username}</dd>
                    </div>
                  )}
                </dl>
              </div>
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

      {/* Onglet Documents : les pièces jointes du dossier. */}
      {onglet === 'documents' && (
        <DocumentsPanel
          dossierId={dossier.id}
          dossierStatut={dossier.statut_code}
          pieces={piecesDossier}
        />
      )}

      {/* Onglet Pièces : le dépouillement des pièces obligatoires des
          dossiers Solde et Pensions. Sans cet écran, le chef de division ne
          pourrait jamais constater les pièces qui bloquent la validation. */}
      {onglet === 'pieces' && (
        <Card
          title="Contrôle des pièces"
          subtitle="Présente, absente, rejetée ou non applicable, avec motif"
        >
          <DepouillementChecklist dossierId={dossier.id} />
        </Card>
      )}

      {/* Onglet Transmissions : l'historique des passages d'un service à
          l'autre, avec le bordereau qui les porte. */}
      {onglet === 'transmissions' && (
        <Card
          title="Transmissions"
          subtitle="Bordereaux par lesquels ce dossier a circulé"
        >
          <TransmissionsPanel dossierId={dossier.id} />
        </Card>
      )}

      {/* Onglet Opération : les données propres à l'opération du dossier —
          référence, période, montant et sa source — et le contrôle qui les
          atteste. */}
      {onglet === 'operation' && (
        <OperationPanel dossier={dossier} />
      )}

      {/* Onglet Correspondances : les lettres et notifications envoyées pour
          ce dossier, et le suivi de leur transmission jusqu'au central. */}
      {onglet === 'correspondances' && (
        <CorrespondancesPanel dossierId={dossier.id} />
      )}

      {/* Onglet VISA : métadonnées, signature, exception, complément et
          contrôle des pièces. Présent seulement pour un dossier VISA. */}
      {onglet === 'visa' && <VisaPanel dossier={dossier} />}

      {/* Onglet Signalements : la difficulté remontée et sa résolution. */}
      {onglet === 'signalements' && (
        <SignalementsPanel dossierId={dossier.id} onChanged={refresh} />
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

      {/* Onglet Commentaires internes (article 2.8) */}
      {onglet === 'commentaires' && (
        <div className="space-y-5">
          <CommentairesDossier dossierId={dossier.id} />
        </div>
      )}

      {/* Onglet Secours : dépouillement, mandatement et les cinq étapes du
          mandat (visa du contrôle financier, références, émargement,
          signature, cachet). */}
      {onglet === 'secours' && (
        <div className="space-y-5">
          <Card title="Dépouillement">
            <DepouillementChecklist dossierId={dossier.id} />
          </Card>
          <Card title="Mandatement">
            <Mandatement dossierId={dossier.id} />
          </Card>
          <SecoursPanel dossierId={dossier.id} onRefresh={recharger} />
        </div>
      )}
    </div>
  );
}

export default DossierDetail;
