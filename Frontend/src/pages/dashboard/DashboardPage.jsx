import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban, CheckCircle2, Clock, AlertTriangle, ArrowRight,
  UserCheck, Send, ShieldCheck, Stamp, Archive, PencilRuler, Inbox, Info,
} from 'lucide-react';
import { dashboardService } from '../../services/dashboardService.js';
import { dossierService } from '../../services/dossierService.js';
import { useAuth } from '../../hooks/useAuth.js';
import { StatCard } from '../../components/ui/StatCard.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { DossierChart } from '../../components/dashboard/DossierChart.jsx';
import { DivisionChart } from '../../components/dashboard/DivisionChart.jsx';
import { EvolutionChart } from '../../components/dashboard/EvolutionChart.jsx';
import { AnimatedCard } from '../../components/ui/AnimatedCard.jsx';
import { formatDateString } from '../../utils/formatDate.js';
import { formatStatus, statusBadgeClass } from '../../utils/formatStatus.js';
import { configRole } from './dashboardRoles.js';

/**
 * Récupère une valeur numérique depuis une réponse serveur.
 * Gère le cas où la valeur est un objet { count: X } ou directement un nombre.
 */
function extractValue(val) {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'object' && val.count !== undefined) return val.count;
  return typeof val === 'number' ? val : parseInt(val, 10) || 0;
}

/**
 * Tableau de bord — deux régimes, un seul écran.
 *
 *  - Rôles couverts par la spec UI-DASHBOARDS V2.0 (lot pilote : Chef de
 *    Service, Secrétaire, Chef BAAF, Coordonnatrice) : titre, KPIs, actions
 *    rapides et graphiques viennent de `dashboardRoles.js`, tous adossés à
 *    des données réelles.
 *  - Autres rôles : le tri par périmètre (agent / division / global)
 *    existant, inchangé. Le périmètre est décidé côté serveur : un agent ne
 *    voit que ses dossiers, un chef de division les siens.
 */

function kpiPour(perimetre, s, files) {
  if (perimetre === 'AGENT') {
    return [
      { icon: FolderKanban, label: 'Mes dossiers', value: extractValue(s?.total), tone: 'primary', sub: 'Dont affectés' },
      { icon: PencilRuler, label: 'À traiter', value: extractValue(files?.aTraiter), tone: 'amber', sub: 'Affectés, pas commencés' },
      { icon: Clock, label: 'En cours', value: extractValue(files?.enCours), tone: 'sky', sub: 'Traitement en cours' },
      { icon: AlertTriangle, label: 'À corriger', value: extractValue(files?.aCorriger), tone: 'red', sub: 'Retournés par le chef' },
      { icon: Send, label: 'À soumettre', value: extractValue(files?.aValider), tone: 'violet', sub: 'Soumis à vérification' },
      { icon: CheckCircle2, label: 'Terminés', value: extractValue(files?.termines), tone: 'emerald', sub: 'Signés ou clôturés' },
    ];
  }

  if (perimetre === 'DIVISION') {
    return [
      { icon: FolderKanban, label: 'Dossiers de la division', value: extractValue(s?.total), tone: 'primary', sub: 'Tous statuts' },
      { icon: UserCheck, label: 'À affecter', value: extractValue(files?.aAffecter), tone: 'amber', sub: 'Enregistrés ou orientés' },
      { icon: ShieldCheck, label: 'À vérifier', value: extractValue(files?.aVerifier), tone: 'violet', sub: 'Soumis par les agents' },
      { icon: AlertTriangle, label: 'Corrections demandées', value: extractValue(files?.aCorriger), tone: 'red', sub: 'En attente agent' },
      { icon: CheckCircle2, label: 'Validés', value: extractValue(s?.VALIDE), tone: 'emerald', sub: `Signés : ${extractValue(s?.SIGNE) ?? 0}` },
      { icon: AlertTriangle, label: 'En retard', value: extractValue(s?.enRetard), tone: 'red', sub: '> 30 jours' },
    ];
  }

  return [
    { icon: FolderKanban, label: 'Total dossiers', value: extractValue(s?.total), tone: 'primary', sub: 'Toutes divisions' },
    { icon: ShieldCheck, label: 'À valider', value: extractValue(files?.aValider), tone: 'violet', sub: 'Soumis à vérification' },
    { icon: Stamp, label: 'À signer', value: extractValue(files?.aSigner), tone: 'amber', sub: 'Validés' },
    { icon: Archive, label: 'À clôturer', value: extractValue(files?.aCloturer), tone: 'sky', sub: 'Signés' },
    { icon: AlertTriangle, label: 'En retard', value: extractValue(s?.enRetard), tone: 'red', sub: '> 30 jours' },
    { icon: Inbox, label: 'Nouveaux / reçus', value: extractValue(files?.aOrienter), tone: 'blue', sub: 'Nouveaux dossiers reçus' },
  ];
}

const TITRES = {
  AGENT: "Tableau de bord — mes dossiers",
  DIVISION: "Tableau de bord de la division",
  GLOBAL: "Tableau de bord du service",
};

/** Lien « tout voir » des cartes-listes. */
const LIEN_VOIR = 'flex items-center gap-1 text-xs font-medium text-primary-600 hover:underline';

export function DashboardPage() {
  const { user, hasAnyPermission } = useAuth();
  const role = user?.role_nom;
  const [summary, setSummary] = useState(null);
  const [byStatus, setByStatus] = useState([]);
  const [byDivision, setByDivision] = useState([]);
  const [evolution, setEvolution] = useState([]);
  const [recent, setRecent] = useState([]);
  const [ress, setRess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, st, dv, ev, rec, r] = await Promise.all([
        dashboardService.summary(),
        dashboardService.byStatus(),
        dashboardService.byDivision(),
        dashboardService.evolution(),
        dossierService.list({ limit: 6 }),
        dashboardService.ressources(),
      ]);
      setSummary(s);
      setByStatus(Array.isArray(st) ? st : []);
      setByDivision(Array.isArray(dv) ? dv : []);
      setEvolution(Array.isArray(ev) ? ev : []);
      setRecent(Array.isArray(rec) ? rec.slice(0, 6) : []);
      setRess(r);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => { Promise.resolve().then(load); }, [load]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center animate-spin-slow shadow-lg shadow-blue-500/40">
            <FolderKanban className="w-8 h-8 text-white" />
          </div>
          <p className="text-lg font-medium text-slate-700 dark:text-slate-200">
            Chargement du tableau de bord…
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="flex items-center gap-2 text-sm text-red-700">
          <Info className="h-4 w-4" /> Impossible de charger le tableau de bord : {error.message}
        </p>
        <button
          type="button"
          onClick={load}
          className="mt-3 rounded-md bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  const perimetre = summary?.perimetre?.type || 'GLOBAL';
  const files = summary?.files;
  /* Rôle couvert par la spec V2.0 → configuration dédiée ; sinon, tri par
     périmètre (comportement historique, inchangé). */
  const cfg = configRole(role, { s: summary, files, ress });
  const kpis = cfg?.kpis || kpiPour(perimetre, summary, files);
  const charts = cfg?.charts
    || (perimetre === 'GLOBAL'
      ? ['statut', 'division', 'evolution']
      : ['statut', 'evolution']);
  const actions = (cfg?.actions || []).filter(
    (a) => !a.perms || hasAnyPermission(a.perms)
  );
  const deuxGraphiques = charts.includes('statut') && charts.includes('division');

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          {cfg?.titre || TITRES[perimetre]}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {cfg?.sousTitre || (perimetre === 'AGENT'
            ? 'Suivi des dossiers qui vous sont affectés.'
            : perimetre === 'DIVISION'
              ? `Suivi des dossiers de votre division.`
              : "Vue d'ensemble du suivi des dossiers SRSP Fitovinany.")}
        </p>
      </div>

      {/* La spec pilote aligne quatre KPI ; le tri par périmètre en affiche
          six : la grille change de format pour éviter une rangée creuse. */}
      <div className={`grid gap-4 sm:grid-cols-2 ${cfg ? 'xl:grid-cols-4' : 'xl:grid-cols-6'}`}>
        {kpis.map((k, idx) => (
          <AnimatedCard
            key={k.label}
            delay={idx * 80}
            type="slide-in-up"
            title={k.label}
            subtitle={k.sub}
            Icon={k.icon}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className={`text-xl font-bold ${k.tone === 'primary' ? 'text-blue-600' : k.tone === 'amber' ? 'text-amber-600' : k.tone === 'red' ? 'text-red-600' : k.tone === 'emerald' ? 'text-emerald-600' : k.tone === 'violet' ? 'text-violet-600' : k.tone === 'sky' ? 'text-sky-600' : k.tone === 'blue' ? 'text-blue-600' : 'text-slate-800'} dark:text-white`}>
                  {k.value}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {k.sub}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${k.tone === 'primary' ? 'bg-blue-100 text-blue-600' : k.tone === 'amber' ? 'bg-amber-100 text-amber-600' : k.tone === 'red' ? 'bg-red-100 text-red-600' : k.tone === 'emerald' ? 'bg-emerald-100 text-emerald-600' : k.tone === 'violet' ? 'bg-violet-100 text-violet-600' : k.tone === 'sky' ? 'bg-sky-100 text-sky-600' : k.tone === 'blue' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                <k.icon className="w-5 h-5" />
              </div>
            </div>
          </AnimatedCard>
        ))}
      </div>

      {/* Section dédiée aux nouveaux dossiers reçus (couleur bleue) */}
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <AnimatedCard
          title="Nouveaux dossiers"
          subtitle="À traiter en priorité"
          Icon={Inbox}
          delay={0}
        >
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100 dark:bg-blue-900/20 dark:border-blue-500/30">
            <Inbox className="h-8 w-8 text-blue-600 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider dark:text-blue-400">
                Nouveaux reçus
              </p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                {files?.aOrienter ?? 0}
              </p>
              <p className="text-xs text-blue-500 dark:text-blue-400">
                À traiter en priorité
              </p>
            </div>
          </div>
        </AnimatedCard>

        {files?.RECU !== undefined && (
          <AnimatedCard
            title="Dossiers reçus"
            subtitle="30 derniers jours"
            Icon={MailPlus}
            delay={80}
          >
            <div className="flex items-center gap-3 p-4 bg-blue-100 rounded-lg border border-blue-200 dark:bg-blue-900/30 dark:border-blue-500/30">
              <Inbox className="h-8 w-8 text-blue-600 shrink-0 dark:text-blue-400" />
              <div>
                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider dark:text-blue-400">
                  Réception récente
                </p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                  {files.RECU}
                </p>
                <p className="text-xs text-blue-500 dark:text-blue-400">
                  30 derniers jours
                </p>
              </div>
            </div>
          </AnimatedCard>
        )}
      </div>

      {(charts.includes('statut') || charts.includes('division')) && (
        <div className={`grid gap-5 ${deuxGraphiques ? 'lg:grid-cols-2' : ''}`}>
          {charts.includes('statut') && (
            <AnimatedCard
              title="Statut des dossiers"
              subtitle="Répartition par statut"
              Icon={FolderKanban}
              delay={0}
            >
              <DossierChart data={byStatus} />
            </AnimatedCard>
          )}
          {charts.includes('division') && (
            <AnimatedCard
              title="Par division"
              subtitle="Répartition géographique"
              Icon={ClockIcon}
              delay={100}
            >
              <DivisionChart data={byDivision} />
            </AnimatedCard>
          )}
        </div>
      )}

      {charts.includes('evolution') && (
        <AnimatedCard
          title="Évolution (12 mois)"
          subtitle="Tendance des dossiers"
          Icon={ClockIcon}
          delay={0}
        >
          <EvolutionChart data={evolution} />
        </AnimatedCard>
      )}

      {actions.length > 0 && (
        <AnimatedCard
          title="Actions rapides"
          subtitle="Accès direct aux fonctions principales"
          Icon={Send}
          delay={0}
        >
          <div className="flex flex-wrap gap-3">
            {actions.map((a) => (
              <Link
                key={`${a.to}-${a.label}`}
                to={a.to}
                className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-blue-400 dark:hover:bg-slate-700/50 dark:hover:text-blue-300"
              >
                <a.icon className="h-4 w-4 shrink-0" />
                {a.label}
              </Link>
            ))}
          </div>
        </AnimatedCard>
      )}

      <Card
        title={cfg?.liste?.titre
          || (perimetre === 'AGENT' ? 'Mes dossiers récents' : 'Derniers dossiers')}
        actions={
          <Link to="/dossiers" className={LIEN_VOIR}>
            Tout voir <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        }
      >
        {recent.length === 0 ? (
          <div className="empty-state-modern">
            <div className="empty-icon">📭</div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Aucun dossier pour le moment.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-700">
            {recent.map((d) => (
              <li key={d.id} className="animate-fade-in">
                <Link
                  to={`/dossiers/${d.id}`}
                  className="flex items-center justify-between gap-3 py-3 px-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                      {d.numero} — {d.objet}
                    </p>
                    <p className="truncate text-xs text-slate-400 dark:text-slate-400">
                      {d.demandeur} · {d.division_nom} · {formatDateString(d.date_reception)}
                    </p>
                  </div>
                  <Badge className={statusBadgeClass(d.statut_code)}>
                    {formatStatus(d.statut_code)}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

export default DashboardPage;