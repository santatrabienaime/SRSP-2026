import { LineChart } from '../charts/LineChart.jsx';

const MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

/** Évolution mensuelle des réceptions (12 derniers mois). */
export function EvolutionChart({ data = [], loading = false }) {
  const rows = (data || []).map((d) => {
    const [, m] = String(d.mois).split('-');
    const monthIndex = (parseInt(m, 10) || 1) - 1;
    return { label: MONTHS[monthIndex] || d.mois, total: d.total ?? d.count ?? 0 };
  });
  if (loading) return <p className="py-10 text-center text-sm text-slate-400">Chargement…</p>;
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-slate-800">
        Évolution des réceptions
      </h3>
      <LineChart data={rows} nameKey="label" dataKey="total" color="#8b5cf6" />
    </div>
  );
}

export default EvolutionChart;