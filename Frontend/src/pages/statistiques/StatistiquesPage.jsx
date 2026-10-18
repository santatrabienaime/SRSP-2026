import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Target, Files } from 'lucide-react';
import { statistiqueService } from '../../services/statistiqueService.js';
import { dashboardService } from '../../services/dashboardService.js';
import { StatCard } from '../../components/ui/StatCard.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { PieChart } from '../../components/charts/PieChart.jsx';
import { BarChart } from '../../components/charts/BarChart.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { STATUT_LABELS } from '../../config/constants.js';
import { AnimatedCard } from '../../components/ui/AnimatedCard.jsx';

/**
 * Récupère une valeur numérique depuis une réponse serveur.
 * Gère le cas où la valeur est un objet { count: X } ou directement un nombre.
 */
function extractValue(val) {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'object' && val.count !== undefined) return val.count;
  return typeof val === 'number' ? val : parseInt(val, 10) || 0;
}

export function StatistiquesPage() {
  const [stats, setStats] = useState(null);
  const [byStatus, setByStatus] = useState([]);
  const [byDivision, setByDivision] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      statistiqueService.get({}),
      dashboardService.byStatus(),
      dashboardService.byDivision(),
    ])
      .then(([s, st, dv]) => {
        if (cancelled) return;
        setStats(s);
        setByStatus(Array.isArray(st) ? st : []);
        setByDivision(Array.isArray(dv) ? dv : []);
      })
      .catch(() => {
        if (!cancelled) setError('Impossible de charger les statistiques.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
  }, []);

  const statsData = stats || {};
  const total = extractValue(stats.total);
  const valides = extractValue(stats.valides);
  const enCours = extractValue(stats.enCours);
  const enAttente = extractValue(stats.enAttente);
  const rejetes = extractValue(stats.rejetes);
  const tauxValidation = extractValue(stats.tauxValidation);
  const tauxRejet = extractValue(stats.tauxRejet);

  const statusRows = byStatus.map((d) => ({
    name: STATUT_LABELS[d.code] || d.statut || d.code,
    total: extractValue(d.total),
  }));

  const divisionRows = byDivision.map((d) => ({
    name: d.division,
    total: extractValue(d.total),
  }));

  return (
    <AnimatedCard title="Statistiques" subtitle="Indicateurs de performance du traitement des dossiers." delay={0}>
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Statistiques</h1>
          <p className="text-sm text-slate-500">Indicateurs de performance du traitement des dossiers.</p>
        </div>

        {error && (
          <Alert type="error" title="Statistiques indisponibles">
            {error}
          </Alert>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={Files} label="Dossiers totaux" value={total} tone="primary" loading={loading} />
          <StatCard icon={Target} label="Validés" value={valides} tone="emerald" loading={loading} />
          <StatCard icon={TrendingUp} label="Taux de validation" value={tauxValidation ? `${tauxValidation} %` : null} tone="sky" loading={loading} />
          <StatCard icon={TrendingDown} label="Taux de correction" value={tauxRejet ? `${tauxRejet} %` : null} tone="amber" loading={loading} />
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <Card title="Répartition par statut">
            <PieChart data={statusRows} nameKey="name" dataKey="total" height={300} />
          </Card>
        </div>

        <Card title="Répartition par division">
          <BarChart data={divisionRows} nameKey="name" dataKey="total" color="#10b981" />
        </Card>
      </div>
    </AnimatedCard>
  );
}

export default StatistiquesPage;