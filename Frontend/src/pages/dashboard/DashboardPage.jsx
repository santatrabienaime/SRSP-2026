import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban, CheckCircle2, Clock, AlertTriangle, ArrowRight,
  UserCheck, Send, ShieldCheck, Stamp, Archive, PencilRuler, Inbox, Info,
} from 'lucide-react';
import { dashboardService } from '../../services/dashboardService.js';
import { dossierService } from '../../services/dossierService.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useTempsReel } from '../../hooks/useTempsReel.js';
import { Card } from '../../components/ui/Card.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { DossierChart } from '../../components/dashboard/DossierChart.jsx';
import { DivisionChart } from '../../components/dashboard/DivisionChart.jsx';
import { EvolutionChart } from '../../components/dashboard/EvolutionChart.jsx';
import { AnimatedCard } from '../../components/ui/AnimatedCard.jsx';
import { formatDateString } from '../../utils/formatDate.js';
import { formatStatus, statusBadgeClass } from '../../utils/formatStatus.js';
import { configRole } from './dashboardRoles.js';
import { extractValue } from '../../utils/extractValue.js';

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
      { icon: AlertTriangle, label: 'Ancienneté > 30 j', value: extractValue((s?.anciennete?.de_31_a_90_jours || 0) + (s?.anciennete?.plus_90_jours || 0)), tone: 'red', sub: 'Dossiers ouverts' },
    ];
  }

  return [
    { icon: FolderKanban, label: 'Total dossiers', value: extractValue(s?.total), tone: 'primary', sub: 'Toutes divisions' },
    { icon: PencilRuler, label: 'À traiter par moi', value: extractValue(s?.aTraiterParMoi), tone: 'amber', sub: 'Selon votre rôle' },
    { icon: ShieldCheck, label: 'En attente de validation', value: extractValue(files?.aValider), tone: 'violet', sub: 'Soumis à vérification' },
    { icon: AlertTriangle, label: 'Incomplets', value: extractValue(s?.incomplets), tone: 'red', sub: 'Pièces obligatoires manquantes' },
    { icon: CheckCircle2, label: 'Clôturés récemment', value: extractValue(s?.cloturesRecents), tone: 'emerald', sub: '30 derniers jours' },
    { icon: Clock, label: 'Ancienneté > 30 j', value: extractValue((s?.anciennete?.de_31_a_90_jours || 0) + (s?.anciennete?.plus_90_jours || 0)), tone: 'sky', sub: 'Dossiers ouverts' },
  ];
}

const TITRES = {
  AGENT: "Tableau de bord — mes dossiers",
  DIVISION: "Tableau de bord de la division",
  GLOBAL: "Tableau de bord du service",
};

/** Lien « tout voir » des cartes-listes. */
const LIEN_VOIR = 'flex items-center gap-1 text-xs font-medium text-primary-600 hover:underline';

/** Aperçu compact d'une file de la boîte de travail. */
function FileDossiers({ titre, dossiers, vide = 'Aucun dossier.' }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {titre}
      </p>
      {(dossiers || []).length === 0 ? (
        <p className="rounded-md bg-slate-50 px-3 py-4 text-sm text-slate-500">{vide}</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {dossiers.map((d) => (
            <li key={d.id}>
              <Link
                to={`/dossiers/${d.id}`}
                className="flex items-center justify-between gap-3 py-2.5 hover:bg-slate-50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {d.reference_visa || d.numero} — {d.objet}
                  </p>
                  <p className="truncate text-xs text-slate-400">
                    {d.demandeur} · {d.division_nom} · {d.age_jours ?? 0} j
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
    </div>
  );
}

export function DashboardPage() {
  const { user, hasAnyPermission } = useAuth();
  const { abonner } = useTempsReel();
  const role = user?.role_nom;
  const [summary, setSummary] = useState(null);
  const [byStatus, setByStatus] = useState([]);
  const [byDivision, setByDivision] = useState([]);
  const [evolution, setEvolution] = useState([]);
  const [recent, setRecent] = useState([]);
  const [ress, setRess] = useState(null);
  const [secretaireKPIs, setSecretaireKPIs] = useState(null);
  const [boite, setBoite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  /* Les panneaux qui n'ont pas pu se charger. Un tableau de bord est une
     mosaïque : une carte en défaut ne doit pas effacer les autres. On
     garde donc la trace de ce qui manque, et on l'affiche à part. */
  const [panneauxEnDefaut, setPanneauxEnDefaut] = useState([]);

  const load = useCallback(async (options = {}) => {
    /* Un rechargement à chaud ne doit pas faire clignoter l'écran : le
       tableau reste affiché pendant la recharge. */
    const silencieux = Boolean(options.silencieux);
    if (!silencieux) setLoading(true);
    setError(null);
    try {
      /* Chaque panneau est chargé **séparément**. Avec un `Promise.all`, la
         première réponse en erreur effacerait l'écran entier : l'agent
         perdrait ses compteurs, ses files et ses graphiques à cause d'un
         seul graphique défectueux. Ici, un panneau qui échoue est signalé
         et les autres s'affichent.

         C'est ce qui a fait la différence quand la répartition par division
         est tombée : l'agent n'a rien vu du tout. */
      const [s, st, dv, ev, rec, r, b] = await Promise.allSettled([
        dashboardService.summary(),
        dashboardService.byStatus(),
        dashboardService.byDivision(),
        dashboardService.evolution(),
        /* Les six derniers dossiers reçus : le tri est demandé explicitement,
           sinon la liste prendrait l'ordre « à traiter en premier » et le
           panneau ne montrerait pas les derniers dossiers, mais les plus
           urgents. */
        dossierService.list({ limit: 6, tri: 'recent' }),
        dashboardService.ressources(),
        dashboardService.boiteTravail(),
      ]);

      const valeur = (resultat, defaut) => (
        resultat.status === 'fulfilled' ? resultat.value : defaut
      );
      const enDefaut = [];
      const noms = [
        'les compteurs', 'la répartition par statut', 'la répartition par division',
        'l\'évolution', 'les derniers dossiers', 'les ressources', 'la boîte de travail',
      ];
      [s, st, dv, ev, rec, r, b].forEach((resultat, index) => {
        if (resultat.status === 'rejected') enDefaut.push(noms[index]);
      });

      setSummary(valeur(s, null));
      setByStatus(Array.isArray(valeur(st, null)) ? valeur(st, []) : []);
      setByDivision(Array.isArray(valeur(dv, null)) ? valeur(dv, []) : []);
      setEvolution(Array.isArray(valeur(ev, null)) ? valeur(ev, []) : []);
      setRecent(Array.isArray(valeur(rec, null)) ? valeur(rec, []).slice(0, 6) : []);
      setRess(valeur(r, null));
      setBoite(valeur(b, null));
      setPanneauxEnDefaut(enDefaut);

      /* Rien du tout n'a pu se charger : là, l'écran est réellement vide et
         il faut le dire franchement, plutôt que d'afficher un tableau de
         bord sans chiffres. */
      if (enDefaut.length === 7) {
        setError(s?.reason || new Error('Le tableau de bord est indisponible.'));
      }

      // Charger les KPIs spécifiques Secrétaire si rôle SECRETAIRE
      if (role === 'SECRETAIRE') {
        try {
          const sk = await dashboardService.secretaireKPIs();
          setSecretaireKPIs(sk);
        } catch {
          setSecretaireKPIs(null);
        }
      }
    } catch (e) {
      if (!silencieux) setError(e);
    } finally {
      if (!silencieux) setLoading(false);
    }
  }, [role]);

  useEffect(() => { Promise.resolve().then(load); }, [load]);

  /* Temps réel : dès qu'un dossier change d'état, le tableau de bord se
     recharge. Sans cela, un chef de division resterait devant un écran figé
     alors qu'un dossier vient d'arriver dans sa file. */
  useEffect(() => {
    return abonner('dossier', () => {
      Promise.resolve().then(() => load({ silencieux: true }));
    });
  }, [abonner, load]);

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
  const cfg = configRole(role, { s: summary, files, ress, sk: secretaireKPIs });
  const kpis = cfg?.kpis || kpiPour(perimetre, summary, files);
  /* Répartitions (statut, division) : le tableau de bord ne les affiche que
     lorsqu'elles sont restreintes au périmètre de l'utilisateur, c'est-à-dire
     quand elles apportent une information propre. En périmètre global elles
     seraient identiques à celles de l'écran Statistiques, qui en est le
     support dédié (vue du service entier) : on ne les double pas, on garde
     ici la seule courbe d'évolution, absente de Statistiques. */
  const charts = cfg?.charts
    || (perimetre === 'GLOBAL' ? ['evolution'] : ['statut', 'evolution']);
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

      {/* Un panneau qui n'a pas pu se charger est signalé, mais il n'a pas
          effacé les autres : l'agent garde l'essentiel de son écran, et sait
          ce qui manque. */}
      {panneauxEnDefaut.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="flex items-center gap-2 text-sm text-amber-800">
            <Info className="h-4 w-4 shrink-0" />
            <span>
              Impossible de charger : {panneauxEnDefaut.join(', ')}. Le reste du
              tableau de bord reste affiché.
            </span>
          </p>
          <button
            type="button"
            onClick={() => load()}
            className="ml-auto rounded-md bg-amber-600 px-3 py-1.5 text-sm text-white hover:bg-amber-700"
          >
            Réessayer
          </button>
        </div>
      )}

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

      {/* Pas de section « Nouveaux reçus » séparée : la carte KPI
          « Nouveaux / reçus » de la rangée ci-dessus porte déjà files.aOrienter.
          Deux blocs pour le même chiffre se lisaient comme une redondance. */}
      {boite && (
        <Card
          title="Ma boîte de travail"
          subtitle="Les dossiers qui demandent une action, et ceux qui viennent d’aboutir."
          actions={
            <Link to="/dossiers" className={LIEN_VOIR}>
              Ouvrir la liste <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        >
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'À traiter par moi', valeur: boite.a_traiter_par_moi?.total, tone: 'amber' },
              { label: 'En attente de validation', valeur: boite.en_attente_validation?.total, tone: 'violet' },
              { label: 'Incomplets', valeur: boite.incomplets?.total, tone: 'red' },
              { label: 'Clôturés récemment', valeur: boite.clotures_recents?.total, tone: 'emerald' },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-slate-200 bg-white px-4 py-3"
              >
                <p className="text-xs font-medium text-slate-500">{item.label}</p>
                <p
                  className={`mt-1 text-2xl font-bold ${
                    item.tone === 'amber'
                      ? 'text-amber-600'
                      : item.tone === 'violet'
                        ? 'text-violet-600'
                        : item.tone === 'red'
                          ? 'text-red-600'
                          : 'text-emerald-600'
                  }`}
                >
                  {extractValue(item.valeur)}
                </p>
              </div>
            ))}
          </div>

          {boite.par_categorie?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {boite.par_categorie.map((c) => (
                <span
                  key={c.type_code}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600"
                >
                  {c.type_libelle} : <strong>{c.total}</strong>
                </span>
              ))}
            </div>
          )}

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <FileDossiers
              titre="À traiter par moi"
              dossiers={boite.a_traiter_par_moi?.dossiers}
              vide="Aucun dossier en attente de votre action."
            />
            <FileDossiers
              titre="Clôturés récemment"
              dossiers={boite.clotures_recents?.dossiers}
              vide="Aucun dossier clôturé ces 30 derniers jours."
            />
          </div>
        </Card>
      )}

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
              Icon={Clock}
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
          Icon={Clock}
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