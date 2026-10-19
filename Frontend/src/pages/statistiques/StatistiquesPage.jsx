import { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, CheckCircle2, AlertTriangle, Clock, AlertCircle,
} from 'lucide-react';
import { statistiqueService } from '../../services/statistiqueService.js';
import { StatCard } from '../../components/ui/StatCard.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { PieChart } from '../../components/charts/PieChart.jsx';
import { BarChart } from '../../components/charts/BarChart.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { STATUT_LABELS } from '../../config/constants.js';
import { extractValue } from '../../utils/extractValue.js';
import { AnimatedCard } from '../../components/ui/AnimatedCard.jsx';

/** Statuts terminés : le dossier a franchi toutes les étapes de traitement. */
const CODES_TERMINES = ['SIGNE', 'CLOTURE', 'ARCHIVE'];

/**
 * Statistiques — pilotage du service entier (aucun filtre de périmètre).
 *
 * Répartition des rôles, pour que les deux écrans ne se répètent pas :
 *  - le tableau de bord est opérationnel et filtré par utilisateur ; il porte
 *    les files d'attente (« que dois-je faire ? ») : total, à valider, à
 *    signer, à clôturer, en retard, nouveaux reçus ;
 *  - cet écran-ci mesure la performance du service : des taux, des volumes de
 *    pilotage et les répartitions, jamais un compteur du tableau de bord.
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
  const enCours = extractValue(statsData.enCours);
  const rejetes = extractValue(statsData.rejetes);
  const prioritaires = extractValue(statsData.prioritaires);
  const tauxValidation = extractValue(statsData.tauxValidation);
  const tauxRejet = extractValue(statsData.tauxRejet);

  /* Les dossiers terminés se déduisent de la répartition par statut : le
     chiffre reste ainsi garanti cohérent avec le camembert affiché. */
  const termines = (statsData.parStatut || [])
    .filter((d) => CODES_TERMINES.includes(d.code))
    .reduce((cumul, d) => cumul + extractValue(d.total), 0);

  const statusRows = (statsData.parStatut || []).map((d) => ({
    name: STATUT_LABELS[d.code] || d.libelle || d.code,
    total: extractValue(d.total),
  }));

  const divisionRows = (statsData.parDivision || []).map((d) => ({
    name: d.division,
    total: extractValue(d.total),
  }));

  return (
    <AnimatedCard
      title="Statistiques"
      subtitle={loading
        ? 'Pilotage du service entier…'
        : `Pilotage du service entier — ${total} dossiers, tous statuts.`}
      delay={0}
    >
      <div className="space-y-5">
        {error && (
          <Alert type="error" title="Statistiques indisponibles">
            {error}
          </Alert>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard icon={TrendingUp} label="Taux de validation" sub="Validés / dossiers du service" value={`${tauxValidation} %`} tone="emerald" loading={loading} />
          <StatCard icon={TrendingDown} label="Taux de correction" sub="Corrections / dossiers du service" value={`${tauxRejet} %`} tone="amber" loading={loading} />
          <StatCard icon={CheckCircle2} label="Dossiers terminés" sub="Signés, clôturés ou archivés" value={termines} tone="sky" loading={loading} />
          <StatCard icon={Clock} label="En cours de traitement" sub="Reçus, non terminés" value={enCours} tone="primary" loading={loading} />
          <StatCard icon={AlertCircle} label="Corrections demandées" sub="En attente de l'agent" value={rejetes} tone="red" loading={loading} />
          <StatCard icon={AlertTriangle} label="Dossiers prioritaires" sub="Priorité haute ou urgente" value={prioritaires} tone="violet" loading={loading} />
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