import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban, CheckCircle2, Clock, AlertTriangle, ArrowRight,
} from 'lucide-react';
import { dashboardService } from '../../services/dashboardService.js';
import { dossierService } from '../../services/dossierService.js';
import { StatCard } from '../../components/ui/StatCard.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { DossierChart } from '../../components/dashboard/DossierChart.jsx';
import { DivisionChart } from '../../components/dashboard/DivisionChart.jsx';
import { EvolutionChart } from '../../components/dashboard/EvolutionChart.jsx';
import { formatDateString } from '../../utils/formatDate.js';
import { formatStatus, statusBadgeClass } from '../../utils/formatStatus.js';

export function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [byStatus, setByStatus] = useState([]);
  const [byDivision, setByDivision] = useState([]);
  const [evolution, setEvolution] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardService.summary(),
      dashboardService.byStatus(),
      dashboardService.byDivision(),
      dashboardService.evolution(),
      dossierService.list({ limit: 6 }),
    ])
      .then(([s, st, dv, ev, rec]) => {
        setSummary(s);
        setByStatus(Array.isArray(st) ? st : []);
        setByDivision(Array.isArray(dv) ? dv : []);
        setEvolution(Array.isArray(ev) ? ev : []);
        setRecent(Array.isArray(rec) ? rec.slice(0, 6) : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const kpis = [
    { icon: FolderKanban, label: 'Total dossiers', value: summary?.total, tone: 'primary', sub: 'Tous statuts confondus' },
    { icon: AlertTriangle, label: 'En retards', value: summary?.enRetard, tone: 'red', sub: '> 30 jours sans clôture' },
    { icon: CheckCircle2, label: 'Validés', value: summary?.VALIDE, tone: 'emerald', sub: `Signés : ${summary?.SIGNE ?? 0}` },
    { icon: Clock, label: 'En traitement', value: summary?.EN_TRAITEMENT, tone: 'amber', sub: `Vérifiés : ${summary?.SOUMIS_A_VERIFICATION ?? 0}` },
    { icon: FolderKanban, label: 'Clôturés', value: summary?.CLOTURE, tone: 'sky', sub: `Archivés : ${summary?.ARCHIVE ?? 0}` },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Tableau de bord</h1>
        <p className="text-sm text-slate-500">Vue d'ensemble du suivi des dossiers SRSP Fitovinany.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {kpis.map((k) => (
          <StatCard key={k.label} {...k} loading={loading} />
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Statut des dossiers">
          <DossierChart data={byStatus} loading={loading} />
        </Card>
        <Card title="Par division">
          <DivisionChart data={byDivision} loading={loading} />
        </Card>
      </div>

      <Card title="Évolution (12 mois)">
        <EvolutionChart data={evolution} loading={loading} />
      </Card>

      <Card
        title="Derniers dossiers"
        actions={
          <Link to="/dossiers" className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:underline">
            Tout voir <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        }
      >
        {recent.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">Aucun dossier pour le moment.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {recent.map((d) => (
              <li key={d.id}>
                <Link to={`/dossiers/${d.id}`} className="flex items-center justify-between gap-3 py-2.5 hover:bg-slate-50">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-700">{d.numero} — {d.objet}</p>
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