import { PieChart } from '../charts/PieChart.jsx';
import { STATUT_LABELS } from '../../config/constants.js';

/** Répartition des dossiers par statut (donut). */
export function DossierChart({ data = [], loading = false }) {
  const rows = (data || []).map((d) => ({
    name: STATUT_LABELS[d.code] || d.statut || d.code || d.name || '—',
    value: d.total ?? d.count ?? 0,
  }));
  if (loading) return <p className="py-10 text-center text-sm text-slate-400">Chargement…</p>;
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-slate-800">
        Répartition par statut
      </h3>
      <PieChart data={rows} dataKey="value" nameKey="name" height={300} />
    </div>
  );
}

export default DossierChart;