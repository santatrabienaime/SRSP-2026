import { BarChart } from '../charts/BarChart.jsx';

/** Répartition des dossiers par division. */
export function DivisionChart({ data = [], loading = false }) {
  const rows = (data || []).map((d) => ({
    name: d.division || d.nom || d.name || '—',
    total: d.total ?? d.count ?? 0,
  }));
  if (loading) return <p className="py-10 text-center text-sm text-slate-400">Chargement…</p>;
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-slate-800">
        Répartition par division
      </h3>
      <BarChart data={rows} nameKey="name" dataKey="total" color="#10b981" />
    </div>
  );
}

export default DivisionChart;