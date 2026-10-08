import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban, CheckCircle2, Clock, AlertTriangle, ArrowRight,
  UserCheck, Send, ShieldCheck, Stamp, Archive, PencilRuler, Inbox, Info,
} from 'lucide-react';
import { dashboardService } from '../../services/dashboardService.js';
import { dossierService } from '../../services/dossierService.js';
import { ordreDeplacementService } from '../../services/ordreDeplacementService.js';
import { useAuth } from '../../hooks/useAuth.js';
import { StatCard } from '../../components/ui/StatCard.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { DossierChart } from '../../components/dashboard/DossierChart.jsx';
import { DivisionChart } from '../../components/dashboard/DivisionChart.jsx';
import { EvolutionChart } from '../../components/dashboard/EvolutionChart.jsx';
import { formatDateString } from '../../utils/formatDate.js';
import { formatStatus, statusBadgeClass } from '../../utils/formatStatus.js';
import { LIBELLES_STATUT, COULEURS_STATUT } from '../baaf/ordresStatuts.js';
import { configRole } from './dashboardRoles.js';

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

/** Jeu d'indicateurs selon le périmètre (rôles hors spec V2.0). */
function kpiPour(perimetre, s, files) {
  const n = (v) => (typeof v === 'number' ? v : undefined);

  if (perimetre === 'AGENT') {
    return [
      { icon: FolderKanban, label: 'Mes dossiers', value: n(s?.total), tone: 'primary', sub: 'Dont affectés' },
      { icon: PencilRuler, label: 'À traiter', value: n(files?.aTraiter), tone: 'amber', sub: 'Affectés, pas commencés' },
      { icon: Clock, label: 'En cours', value: n(files?.enCours), tone: 'sky', sub: 'Traitement en cours' },
      { icon: AlertTriangle, label: 'À corriger', value: n(files?.aCorriger), tone: 'red', sub: 'Retournés par le chef' },
      { icon: Send, label: 'À soumettre', value: n(files?.aCorriger), tone: 'violet', sub: 'Après correction' },
      { icon: CheckCircle2, label: 'Terminés', value: n(files?.termines), tone: 'emerald', sub: 'Signés ou clôturés' },
    ];
  }

  if (perimetre === 'DIVISION') {
    return [
      { icon: FolderKanban, label: 'Dossiers de la division', value: n(s?.total), tone: 'primary', sub: 'Tous statuts' },
      { icon: UserCheck, label: 'À affecter', value: n(files?.aAffecter), tone: 'amber', sub: 'Enregistrés ou orientés' },
      { icon: ShieldCheck, label: 'À vérifier', value: n(files?.aVerifier), tone: 'violet', sub: 'Soumis par les agents' },
      { icon: AlertTriangle, label: 'Corrections demandées', value: n(files?.aCorriger), tone: 'red', sub: 'En attente agent' },
      { icon: CheckCircle2, label: 'Validés', value: n(s?.VALIDE), tone: 'emerald', sub: `Signés : ${s?.SIGNE ?? 0}` },
      { icon: AlertTriangle, label: 'En retard', value: n(s?.enRetard), tone: 'red', sub: '> 30 jours' },
    ];
  }

  return [
    { icon: FolderKanban, label: 'Total dossiers', value: n(s?.total), tone: 'primary', sub: 'Toutes divisions' },
    { icon: ShieldCheck, label: 'À valider', value: n(files?.aValider), tone: 'violet', sub: 'Soumis à vérification' },
    { icon: Stamp, label: 'À signer', value: n(files?.aSigner), tone: 'amber', sub: 'Validés' },
    { icon: Archive, label: 'À clôturer', value: n(files?.aCloturer), tone: 'sky', sub: 'Signés' },
    { icon: AlertTriangle, label: 'En retard', value: n(s?.enRetard), tone: 'red', sub: '> 30 jours' },
    { icon: Inbox, label: 'À orienter', value: n(files?.aOrienter), tone: 'primary', sub: 'Reçus / enregistrés' },
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
  const [ordres, setOrdres] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      /* Les pièces de déplacement ne sont chargées que pour le Chef BAAF :
         les autres rôles n'ont ni permission ni écran pour les lire. */
      const promesseOrdres = role === 'CHEF_BAAF'
        ? Promise.all([
            ordreDeplacementService.tableauDeBord(),
            ordreDeplacementService.lister({ limit: 5 }),
          ]).then(([tableau, liste]) => ({
            tdb: tableau,
            liste: Array.isArray(liste) ? liste : [],
          }))
        : Promise.resolve(null);

      const [s, st, dv, ev, rec, r, ord] = await Promise.all([
        dashboardService.summary(),
        dashboardService.byStatus(),
        dashboardService.byDivision(),
        dashboardService.evolution(),
        dossierService.list({ limit: 6 }),
        dashboardService.ressources(),
        promesseOrdres,
      ]);
      setSummary(s);
      setByStatus(Array.isArray(st) ? st : []);
      setByDivision(Array.isArray(dv) ? dv : []);
      setEvolution(Array.isArray(ev) ? ev : []);
      setRecent(Array.isArray(rec) ? rec.slice(0, 6) : []);
      setRess(r);
      setOrdres(ord);
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
        <Spinner label="Chargement du tableau de bord…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="flex items-center gap-2 text-sm text-red-700">
          <Info className="h-4 w-4" />
          Impossible de charger le tableau de bord : {error.message}
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
  const cfg = configRole(role, { s: summary, files, ress, ordres });
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
        <h1 className="text-xl font-bold text-slate-800">
          {cfg?.titre || TITRES[perimetre]}
        </h1>
        <p className="text-sm text-slate-500">
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
        {kpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      {(charts.includes('statut') || charts.includes('division')) && (
        <div className={`grid gap-5 ${deuxGraphiques ? 'lg:grid-cols-2' : ''}`}>
          {charts.includes('statut') && (
            <Card title="Statut des dossiers">
              <DossierChart data={byStatus} />
            </Card>
          )}
          {charts.includes('division') && (
            <Card title="Par division">
              <DivisionChart data={byDivision} />
            </Card>
          )}
        </div>
      )}

      {charts.includes('evolution') && (
        <Card title="Évolution (12 mois)">
          <EvolutionChart data={evolution} />
        </Card>
      )}

      {actions.length > 0 && (
        <Card title="Actions rapides">
          <div className="flex flex-wrap gap-3">
            {actions.map((a) => (
              <Link
                key={`${a.to}-${a.label}`}
                to={a.to}
                className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
              >
                <a.icon className="h-4 w-4 shrink-0" />
                {a.label}
              </Link>
            ))}
          </div>
        </Card>
      )}

      {cfg?.listeOrdres ? (
        /* Le Chef BAAF suit ses pièces, pas la file dossier : la liste du
           tableau de bord est son registre de déplacement. */
        <Card
          title="Dernières pièces de déplacement"
          actions={
            <Link to="/baaf/pieces-deplacement" className={LIEN_VOIR}>
              Toutes les pièces <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        >
          {!ordres?.liste?.length ? (
            <p className="py-6 text-center text-sm text-slate-400">
              Aucune pièce de déplacement pour le moment.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {ordres.liste.map((o) => (
                <li key={o.id}>
                  <Link
                    to="/baaf/pieces-deplacement"
                    className="flex items-center justify-between gap-3 py-2.5 hover:bg-slate-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-700">
                        {o.numero} — {o.type_libelle}
                      </p>
                      <p className="truncate text-xs text-slate-400">
                        {o.agent_nom} · {o.lieu_depart} → {o.lieu_destination}
                      </p>
                    </div>
                    <Badge className={COULEURS_STATUT[o.statut] || COULEURS_STATUT.REDIGE}>
                      {LIBELLES_STATUT[o.statut] || o.statut}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      ) : (
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
            <p className="py-6 text-center text-sm text-slate-400">
              Aucun dossier pour le moment.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recent.map((d) => (
                <li key={d.id}>
                  <Link
                    to={`/dossiers/${d.id}`}
                    className="flex items-center justify-between gap-3 py-2.5 hover:bg-slate-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-700">
                        {d.numero} — {d.objet}
                      </p>
                      <p className="truncate text-xs text-slate-400">
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
      )}
    </div>
  );
}

export default DashboardPage;
