import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Target, Files } from 'lucide-react';
import { statistiqueService } from '../../services/statistiqueService.js';
import { dashboardService } from '../../services/dashboardService.js';
import { StatCard } from '../../components/ui/StatCard.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { BarChart } from '../../components/charts/BarChart.jsx';
import { PieChart } from '../../components/charts/PieChart.jsx';
import { STATUT_LABELS } from '../../config/constants.js';

export function StatistiquesPage() {
  const [stats, setStats] = useState(null);
  const [byStatus, setByStatus] = useState([]);
  const [byDivision, setByDivision] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      statistiqueService.get({}),
      dashboardService.byStatus(),
      dashboardService.byDivision(),
    ])
      .then(([s, st, dv]) => {
        setStats(s);
        setByStatus(Array.isArray(st) ? st : []);
        setByDivision(Array.isArray(dv) ? dv : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statusRows = byStatus.map((d) => ({
    name: STATUT_LABELS[d.code] || d.statut || d.code,
    total: d.total ?? d.count ?? 0,
  }));

  const divisionRows = byDivision.map((d) => ({
    name: d.division,
    total: d.total ?? d.count ?? 0,
  }));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Statistiques</h1>
        <p className="text-sm text-slate-500">Indicateurs de performance du traitement des dossiers.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Files} label="Dossiers totaux" value={stats?.total} tone="primary" loading={loading} />
        <StatCard icon={Target} label="Validés" value={stats?.valides} tone="emerald" loading={loading} />
        <StatCard icon={TrendingUp} label="Taux de validation" value={stats ? `${stats.tauxValidation} %` : null} tone="sky" loading={loading} />
        <StatCard icon={TrendingDown} label="Taux de correction" value={stats ? `${stats.tauxRejet} %` : null} tone="amber" loading={loading} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Dossiers par statut">
          <BarChart data={statusRows} nameKey="name" dataKey="total" color="#8b5cf6" />
        </Card>
        <Card title="Répartition par statut">
          <PieChart data={statusRows} nameKey="name" dataKey="total" height={300} />
        </Card>
      </div>

      <Card title="Répartition par division">
        <BarChart data={divisionRows} nameKey="name" dataKey="total" color="#10b981" />
      </Card>
    </div>
  );
}

export default StatistiquesPage;