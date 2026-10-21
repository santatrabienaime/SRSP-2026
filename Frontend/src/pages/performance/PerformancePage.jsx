import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban, CheckCircle2, Archive, Clock, Hourglass,
  AlertTriangle, Timer, Percent, RefreshCw, TrendingUp,
} from 'lucide-react';
import { performanceService } from '../../services/performanceService.js';
import { useNotification } from '../../hooks/useNotification.js';
import { usePagination } from '../../hooks/usePagination.js';
import { AnimatedCard } from '../../components/ui/AnimatedCard.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Table } from '../../components/ui/Table.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { BarChart } from '../../components/charts/BarChart.jsx';
import { formatDateString } from '../../utils/formatDate.js';
import { formatStatus, statusBadgeClass } from '../../utils/formatStatus.js';

/**
 * Écran « Performance » — indicateurs de performance du service.
 *
 * Le module `/api/performance` existe côté serveur, mais n'était exposé par
 * aucun écran : la fonctionnalité était missing. Cet écran le rend visible.
 *
 * Deux règles structurent la page :
 *
 *  1. **Le périmètre est celui du serveur.** Aucun filtre de division, de
 *     division ou d'agent n'est envoyé : un chef de division ne voit que sa
 *     division, un agent que ses dossiers. L'écran affiche donc toujours la
 *     même chose pour tous, mais chacun y lit SON périmètre — ce qui est
 *     précisément l'intérêt de l'indicateur.
 *
 *  2. **Un tableau qui ne se charge pas n'efface pas les autres.** Chaque
 *     bloc est chargé séparément : si la répartition par agent échoue, les
 *     compteurs, les retards et l'évolution restent affichés, et le panneau
 *     fautif est signalé.
 */

/* Libellés courts des mois, pour l'axe des graphiques. */
const MOIS = [
  'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
  'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.',
];

/* '2026-03' → 'mars 2026'. */
function libelleMois(mois) {
  if (!mois) return '—';
  const [annee, numMois] = String(mois).split('-');
  const index = Number(numMois) - 1;
  if (!annee || !MOIS[index]) return String(mois);
  return `${MOIS[index]} ${annee}`;
}

/* Un délai moyen en jours, ou « — » quand il n'y a rien à mesurer. */
function delai(jours) {
  if (jours === null || jours === undefined || jours === '') return '—';
  const n = Number(jours);
  if (Number.isNaN(n)) return '—';
  return `${Number.isInteger(n) ? n : n.toFixed(1)} j`;
}

/* Un pourcentage en français, deux décimales au plus. */
function pourcent(valeur) {
  const n = Number(valeur ?? 0);
  if (Number.isNaN(n)) return '0 %';
  return `${n.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} %`;
}

/* Tri d'un tableau de lignes : numérique quand c'est possible, texte sinon. */
function trierLignes(lignes, key, dir) {
  const sens = dir === 'asc' ? 1 : -1;
  return [...lignes].sort((a, b) => {
    const va = a[key];
    const vb = b[key];
    if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * sens;
    return String(va ?? '').localeCompare(String(vb ?? ''), 'fr') * sens;
  });
}

/* Un clic sur une colonne déjà triée inverse le sens du tri.
   La clé est nommée `key` comme l'attend le composant Table, qui s'en sert
   pour marquer la colonne triée. */
function changerTri(tri, key) {
  if (tri.key === key) return { key, dir: tri.dir === 'asc' ? 'desc' : 'asc' };
  return { key, dir: 'asc' };
}

/* Couleurs des cartes KPI. Les classes sont écrites en clair : Tailwind
   analyse le source statiquement, une classe fabriquée à l'exécution
   (`bg-${ton}-600`) ne serait jamais engendrée. */
const TONS = {
  primary: { texte: 'text-blue-600', fond: 'bg-blue-100 text-blue-600' },
  emerald: { texte: 'text-emerald-600', fond: 'bg-emerald-100 text-emerald-600' },
  slate: { texte: 'text-slate-700', fond: 'bg-slate-100 text-slate-600' },
  amber: { texte: 'text-amber-600', fond: 'bg-amber-100 text-amber-600' },
  orange: { texte: 'text-orange-600', fond: 'bg-orange-100 text-orange-600' },
  red: { texte: 'text-red-600', fond: 'bg-red-100 text-red-600' },
  sky: { texte: 'text-sky-600', fond: 'bg-sky-100 text-sky-600' },
  violet: { texte: 'text-violet-600', fond: 'bg-violet-100 text-violet-600' },
};

/* Les huit indicateurs globaux, dans l'ordre de lecture. */
const KPI = [
  { cle: 'total_dossiers', label: 'Total des dossiers', sub: 'Tous statuts confondus', icon: FolderKanban, ton: 'primary' },
  { cle: 'dossiers_clotures', label: 'Clôturés', sub: 'Dossiers terminés', icon: CheckCircle2, ton: 'emerald' },
  { cle: 'dossiers_archives', label: 'Archivés', sub: 'Classés en archives', icon: Archive, ton: 'slate' },
  { cle: 'dossiers_en_cours', label: 'En cours', sub: 'En cours de traitement', icon: Clock, ton: 'amber' },
  { cle: 'dossiers_en_attente', label: 'En attente', sub: 'En attente de complément', icon: Hourglass, ton: 'orange' },
  { cle: 'dossiers_a_corriger', label: 'À corriger', sub: 'Correction demandée', icon: AlertTriangle, ton: 'red' },
  { cle: 'delai_moyen_traitement', label: 'Délai moyen', sub: 'Réception → clôture', icon: Timer, ton: 'sky', format: 'jours' },
  { cle: 'taux_traitement', label: 'Taux de traitement', sub: 'Clôturés ou archivés', icon: Percent, ton: 'violet', format: 'pourcent' },
];

/* Valeur affichée d'un KPI, mise en forme selon son type. */
function valeurKpi(kpi, stats) {
  const brut = stats?.[kpi.cle];
  if (kpi.format === 'jours') return delai(brut);
  if (kpi.format === 'pourcent') return pourcent(brut);
  const n = Number(brut ?? 0);
  return Number.isNaN(n) ? 0 : n;
}

/* Retard : la gravité se lit sur le nombre de jours dépassés. */
function badgeRetard(jours) {
  const n = Number(jours) || 0;
  if (n > 30) return 'bg-red-100 text-red-800 border-red-300';
  if (n > 7) return 'bg-orange-100 text-orange-800 border-orange-300';
  return 'bg-amber-100 text-amber-800 border-amber-300';
}

export function PerformancePage() {
  const { toastSuccess, toastError } = useNotification();

  const [stats, setStats] = useState(null);
  const [enRetard, setEnRetard] = useState([]);
  const [parDivision, setParDivision] = useState([]);
  const [parAgent, setParAgent] = useState([]);
  const [evolution, setEvolution] = useState([]);
  /* Erreur par bloc : un tableau qui échoue ne doit pas effacer les autres. */
  const [erreurs, setErreurs] = useState({});
  const [loading, setLoading] = useState(true);

  const [triRetard, setTriRetard] = useState({ key: 'jours_retard', dir: 'desc' });
  const [triDivision, setTriDivision] = useState({ key: 'total', dir: 'desc' });
  const [triAgent, setTriAgent] = useState({ key: 'total', dir: 'desc' });

  /**
   * Charge les cinq blocs. Chacun est isolé : un échec est signalé, les
   * autres s'affichent quand même. Renvoie la liste des blocs en échec.
   */
  const charger = useCallback(async () => {
    setLoading(true);
    setErreurs({});
    try {
      const [s, r, dv, ag, ev] = await Promise.allSettled([
        performanceService.stats(),
        performanceService.enRetard(),
        performanceService.parDivision(),
        performanceService.parAgent(),
        performanceService.evolution(),
      ]);

      const reussi = (x) => x.status === 'fulfilled';
      const enDefaut = {};

      if (reussi(s)) {
        setStats(s.value || {});
      } else {
        enDefaut.stats = s.reason?.message || 'Erreur inconnue.';
      }

      if (reussi(r)) {
        setEnRetard(Array.isArray(r.value) ? r.value : []);
      } else {
        enDefaut.enRetard = r.reason?.message || 'Erreur inconnue.';
      }

      if (reussi(dv)) {
        setParDivision(Array.isArray(dv.value) ? dv.value : []);
      } else {
        enDefaut.parDivision = dv.reason?.message || 'Erreur inconnue.';
      }

      if (reussi(ag)) {
        setParAgent(Array.isArray(ag.value) ? ag.value : []);
      } else {
        enDefaut.parAgent = ag.reason?.message || 'Erreur inconnue.';
      }

      if (reussi(ev)) {
        setEvolution(Array.isArray(ev.value) ? ev.value : []);
      } else {
        enDefaut.evolution = ev.reason?.message || 'Erreur inconnue.';
      }

      setErreurs(enDefaut);
      return Object.keys(enDefaut);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { Promise.resolve().then(charger); }, [charger]);

  /* Actualisation manuelle : le résultat est confirmé par un toast, pour
     que l'utilisateur sache que l'écran a bien été rafraîchi. */
  const actualiser = useCallback(async () => {
    const enDefaut = await charger();
    if (enDefaut.length === 0) {
      toastSuccess('Les indicateurs de performance ont été actualisés.');
    } else {
      toastError(
        `Actualisation partielle : ${enDefaut.length} bloc(s) n'ont pas pu être chargés.`
      );
    }
  }, [charger, toastSuccess, toastError]);

  /* Les lignes triées, puis paginées. Pour les agents, le nom affiché est
     calculé une fois : c'est aussi la clé de tri de la colonne « Agent ». */
  const retardTriees = useMemo(
    () => trierLignes(enRetard, triRetard.key, triRetard.dir),
    [enRetard, triRetard]
  );
  const divisionTriees = useMemo(
    () => trierLignes(parDivision, triDivision.key, triDivision.dir),
    [parDivision, triDivision]
  );
  const agentTries = useMemo(() => {
    const lignes = parAgent.map((a) => ({
      ...a,
      agent: `${a.agent_prenom || ''} ${a.agent_nom || ''}`.trim() || '—',
    }));
    return trierLignes(lignes, triAgent.key, triAgent.dir);
  }, [parAgent, triAgent]);

  const paginationRetard = usePagination(retardTriees, 10);
  const paginationDivision = usePagination(divisionTriees, 10);
  const paginationAgent = usePagination(agentTries, 10);

  /* Données des graphiques d'évolution : le mois devient un libellé lisible. */
  const evolutionGraphique = useMemo(
    () => evolution.map((e) => ({
      label: libelleMois(e.mois),
      total: Number(e.total) || 0,
      clotures: Number(e.clotures) || 0,
    })),
    [evolution]
  );

  /* Rien n'a pu être chargé : l'écran est réellement vide, on le dit. */
  const toutEnEchec = Object.keys(erreurs).length === 5;

  const colonnesRetard = [
    {
      key: 'numero',
      label: 'N° dossier',
      sortable: true,
      render: (r) => (
        <Link to={`/dossiers/${r.id}`} className="font-semibold text-primary-600 hover:underline">
          {r.numero}
        </Link>
      ),
    },
    {
      key: 'objet',
      label: 'Objet / type',
      sortable: true,
      render: (r) => (
        <div className="max-w-xs">
          <p className="truncate font-medium text-slate-700">{r.objet || '—'}</p>
          <p className="truncate text-xs text-slate-500">{r.type || '—'}</p>
        </div>
      ),
    },
    {
      key: 'division',
      label: 'Division',
      sortable: true,
      render: (r) => r.division || '—',
    },
    {
      key: 'agent',
      label: 'Agent responsable',
      sortable: true,
      render: (r) => r.agent || '—',
    },
    {
      key: 'date_limite',
      label: 'Date limite',
      sortable: true,
      render: (r) => formatDateString(r.date_limite),
    },
    {
      key: 'jours_retard',
      label: 'Jours de retard',
      sortable: true,
      render: (r) => (
        <Badge className={badgeRetard(r.jours_retard)}>
          {Number(r.jours_retard) || 0} j
        </Badge>
      ),
    },
    {
      key: 'statut',
      label: 'Statut',
      render: (r) => (
        <Badge className={statusBadgeClass(r.statut)}>
          {r.statut_libelle || formatStatus(r.statut)}
        </Badge>
      ),
    },
  ];

  const colonnesDivision = [
    { key: 'division', label: 'Division', sortable: true, render: (r) => r.division || '—' },
    { key: 'total', label: 'Total', sortable: true },
    { key: 'clotures', label: 'Clôturés', sortable: true },
    { key: 'archives', label: 'Archivés', sortable: true },
    { key: 'en_cours', label: 'En cours', sortable: true },
    {
      key: 'delai_moyen',
      label: 'Délai moyen',
      sortable: true,
      render: (r) => delai(r.delai_moyen),
    },
  ];

  const colonnesAgent = [
    {
      key: 'agent',
      label: 'Agent',
      sortable: true,
      render: (r) => r.agent,
    },
    { key: 'division', label: 'Division', sortable: true, render: (r) => r.division || '—' },
    { key: 'total', label: 'Total', sortable: true },
    { key: 'clotures', label: 'Clôturés', sortable: true },
    { key: 'archives', label: 'Archivés', sortable: true },
    {
      key: 'delai_moyen',
      label: 'Délai moyen',
      sortable: true,
      render: (r) => delai(r.delai_moyen),
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner label="Chargement des indicateurs de performance…" />
      </div>
    );
  }

  if (toutEnEchec) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Performance</h1>
        <Alert type="error" title="Indicateurs de performance indisponibles">
          <p>Le serveur n'a pas pu fournir les indicateurs de performance.</p>
          <button
            type="button"
            onClick={actualiser}
            className="mt-3 rounded-md bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700"
          >
            Réessayer
          </button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            Performance
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Vitesse de traitement et suivi des échéances — sur votre périmètre
            uniquement.
          </p>
        </div>
        <button
          type="button"
          onClick={actualiser}
          className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <RefreshCw className="h-4 w-4" />
          Actualiser
        </button>
      </div>

      {/* Indicateurs globaux */}
      {erreurs.stats ? (
        <Alert type="error" title="Indicateurs indisponibles">
          {erreurs.stats}
        </Alert>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {KPI.map((kpi, index) => {
            const ton = TONS[kpi.ton];
            return (
              <AnimatedCard
                key={kpi.cle}
                delay={index * 60}
                type="slide-in-up"
                title={kpi.label}
                subtitle={kpi.sub}
                Icon={kpi.icon}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className={`text-2xl font-bold ${ton.texte} dark:text-slate-100`}>
                    {valeurKpi(kpi, stats)}
                  </p>
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${ton.fond}`}>
                    <kpi.icon className="h-5 w-5" />
                  </div>
                </div>
              </AnimatedCard>
            );
          })}
        </div>
      )}

      {/* Dossiers en retard : l'information la plus utile, elle vient donc
          juste après les compteurs. */}
      <Card
        title="Dossiers en retard"
        subtitle="Échéance dépassée, dossier non clôturé ni archivé."
        actions={
          enRetard.length > 0 ? (
            <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
              {enRetard.length} dossier{enRetard.length > 1 ? 's' : ''}
            </span>
          ) : null
        }
      >
        {erreurs.enRetard ? (
          <Alert type="error" title="Liste des dossiers en retard indisponible">
            {erreurs.enRetard}
          </Alert>
        ) : (
          <>
            <Table
              columns={colonnesRetard}
              data={paginationRetard.currentItems}
              sort={triRetard}
              onSort={(cle) => setTriRetard((t) => changerTri(t, cle))}
              emptyLabel="Aucun dossier en retard."
            />
            <Pagination pagination={paginationRetard} className="mt-3 justify-end" />
          </>
        )}
      </Card>

      {/* Évolution sur douze mois */}
      <Card
        title="Évolution sur douze mois"
        subtitle="Dossiers reçus et dossiers sortis du circuit (clôturés ou archivés)."
        actions={<TrendingUp className="h-4 w-4 text-slate-400" />}
      >
        {erreurs.evolution ? (
          <Alert type="error" title="Évolution indisponible">
            {erreurs.evolution}
          </Alert>
        ) : evolutionGraphique.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400">
            Aucune donnée pour ce périmètre sur les douze derniers mois.
          </p>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Dossiers reçus
              </p>
              <BarChart
                data={evolutionGraphique}
                nameKey="label"
                dataKey="total"
                color="#2563eb"
                height={260}
              />
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Dossiers clôturés ou archivés
              </p>
              <BarChart
                data={evolutionGraphique}
                nameKey="label"
                dataKey="clotures"
                color="#10b981"
                height={260}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Performance par division et par agent */}
      <div className="grid gap-5 xl:grid-cols-2">
        <Card
          title="Performance par division"
          subtitle="Volumes et délai moyen de traitement."
        >
          {erreurs.parDivision ? (
            <Alert type="error" title="Répartition par division indisponible">
              {erreurs.parDivision}
            </Alert>
          ) : (
            <>
              <Table
                columns={colonnesDivision}
                data={paginationDivision.currentItems}
                sort={triDivision}
                onSort={(cle) => setTriDivision((t) => changerTri(t, cle))}
                emptyLabel="Aucune donnée pour ce périmètre."
              />
              <Pagination pagination={paginationDivision} className="mt-3 justify-end" />
            </>
          )}
        </Card>

        <Card
          title="Performance par agent"
          subtitle="Charge de travail et rapidité de chaque agent du périmètre."
        >
          {erreurs.parAgent ? (
            <Alert type="error" title="Répartition par agent indisponible">
              {erreurs.parAgent}
            </Alert>
          ) : (
            <>
              <Table
                columns={colonnesAgent}
                data={paginationAgent.currentItems}
                sort={triAgent}
                onSort={(cle) => setTriAgent((t) => changerTri(t, cle))}
                emptyLabel="Aucune donnée pour ce périmètre."
              />
              <Pagination pagination={paginationAgent} className="mt-3 justify-end" />
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

export default PerformancePage;
