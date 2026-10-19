import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Target, Files, Clock, AlertCircle } from 'lucide-react';
import { statistiqueService } from '../../services/statistiqueService.js';
import { StatCard } from '../../components/ui/StatCard.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { PieChart } from '../../components/charts/PieChart.jsx';
import { BarChart } from '../../components/charts/BarChart.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { STATUT_LABELS } from '../../config/constants.js';
import { extractValue } from '../../utils/extractValue.js';
import { AnimatedCard } from '../../components/ui/AnimatedCard.jsx';

/**
 * Statistiques — vue d'ensemble du service entier (aucun filtre de périmètre).
 *
 * C'est la différence avec le tableau de bord : celui-ci est opérationnel et
 * suit les dossiers de l'utilisateur (agent / division / global), celui-ci
 * mesure la performance globale du traitement. Les répartitions affichées ici
 * viennent donc de /statistiques, pas des endpoints du tableau de bord.
 */
export function StatistiquesPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    statistiqueService.get({})
      .then((s) => {
        if (!cancelled) setStats(s);
      })
      .catch(() => {
        if (!cancelled) setError('Impossible de charger les statistiques.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
  }, []);

  /* `stats` vaut null tant que la requête n'a pas répondu. On lit donc le
     repli vide `statsData`, jamais `stats` : `stats.total` sur null faisait
     planter la page au premier rendu. */
  const statsData = stats || {};
  const total = extractValue(statsData.total);
  const valides = extractValue(statsData.valides);
  const enCours = extractValue(statsData.enCours);
  const enAttente = extractValue(statsData.enAttente);
  const rejetes = extractValue(statsData.rejetes);
  const tauxValidation = extractValue(statsData.tauxValidation);
  const tauxRejet = extractValue(statsData.tauxRejet);

  const statusRows = (statsData.parStatut || []).map((d) => ({
    name: STATUT_LABELS[d.code] || d.libelle || d.code,
    total: extractValue(d.total),
  }));

  const divisionRows = (statsData.parDivision || []).map((d) => ({
    name: d.division,
    total: extractValue(d.total),
  }));

  return (
    <AnimatedCard title="Statistiques" subtitle="Indicateurs de performance du traitement des dossiers." delay={0}>
      <div className="space-y-5">
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

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard icon={Clock} label="En cours de traitement" value={enCours} tone="sky" loading={loading} />
          <StatCard icon={Clock} label="En attente de prise en charge" value={enAttente} tone="primary" loading={loading} />
          <StatCard icon={AlertCircle} label="Corrections demandées" value={rejetes} tone="amber" loading={loading} />
        </div>

        <Card title="Répartition par statut">
          <PieChart data={statusRows} nameKey="name" dataKey="total" height={300} />
        </Card>

        <Card title="Répartition par division">
          <BarChart data={divisionRows} nameKey="name" dataKey="total" color="#10b981" />
        </Card>
      </div>
    </AnimatedCard>
  );
}

export default StatistiquesPage;