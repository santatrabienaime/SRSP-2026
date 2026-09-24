import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban, CheckCircle2, Clock, AlertTriangle, ArrowRight,
  UserCheck, Send, ShieldCheck, Stamp, Archive, PencilRuler, Inbox, Info,
} from 'lucide-react';
import { dashboardService } from '../../services/dashboardService.js';
import { dossierService } from '../../services/dossierService.js';
import { StatCard } from '../../components/ui/StatCard.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { DossierChart } from '../../components/dashboard/DossierChart.jsx';
import { DivisionChart } from '../../components/dashboard/DivisionChart.jsx';
import { EvolutionChart } from '../../components/dashboard/EvolutionChart.jsx';
import { formatDateString } from '../../utils/formatDate.js';
import { formatStatus, statusBadgeClass } from '../../utils/formatStatus.js';

/**
 * Tableau de bord adapté au rôle.
 *
 * Le périmètre (agent / division / global) est décidé côté serveur : un agent
 * ne voit que ses dossiers, un chef de division les siens. Les indicateurs
 * affichés correspondent aux écrans décrits dans le cahier des charges.
 */

/** Jeu d'indicateurs selon le périmètre. */
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

export function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [byStatus, setByStatus] = useState([]);
  const [byDivision, setByDivision] = useState([]);
  const [evolution, setEvolution] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, st, dv, ev, rec] = await Promise.all([
        dashboardService.summary(),
        dashboardService.byStatus(),
        dashboardService.byDivision(),
        dashboardService.evolution(),
        dossierService.list({ limit: 6 }),
      ]);
      setSummary(s);
      setByStatus(Array.isArray(st) ? st : []);
      setByDivision(Array.isArray(dv) ? dv : []);
      setEvolution(Array.isArray(ev) ? ev : []);
      setRecent(Array.isArray(rec) ? rec.slice(0, 6) : []);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

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
  const kpis = kpiPour(perimetre, summary, summary?.files);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">
          {TITRES[perimetre]}
        </h1>
        <p className="text-sm text-slate-500">
          {perimetre === 'AGENT'
            ? 'Suivi des dossiers qui vous sont affectés.'
            : perimetre === 'DIVISION'
              ? `Suivi des dossiers de votre division.`
              : "Vue d'ensemble du suivi des dossiers SRSP Fitovinany."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {kpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Statut des dossiers">
          <DossierChart data={byStatus} />
        </Card>
        {perimetre === 'GLOBAL' && (
          <Card title="Par division">
            <DivisionChart data={byDivision} />
          </Card>
        )}
      </div>

      <Card title="Évolution (12 mois)">
        <EvolutionChart data={evolution} />
      </Card>

      <Card
        title={perimetre === 'AGENT' ? 'Mes dossiers récents' : 'Derniers dossiers'}
        actions={
          <Link
            to="/dossiers"
            className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:underline"
          >
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
                    <p className="text-xs text-slate-400">
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
