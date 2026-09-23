import {
  PieChart as RePie,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const PALETTE = [
  '#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#64748b', '#0ea5e9',
];

/** Camembert / donut (répartition). */
export function PieChart({ data = [], dataKey = 'value', nameKey = 'name', height = 280, donut = true }) {
  const rows = (data || []).filter((d) => (d[dataKey] ?? 0) > 0);
  if (rows.length === 0) {
    return <p className="py-10 text-center text-sm text-slate-400">Aucune donnée</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RePie>
        <Pie
          data={rows}
          dataKey={dataKey}
          nameKey={nameKey}
          innerRadius={donut ? 45 : 0}
          outerRadius={80}
          paddingAngle={2}
          label={(entry) => entry[nameKey]}
          labelLine={false}
        >
          {rows.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(v) => [v, 'Dossiers']} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </RePie>
    </ResponsiveContainer>
  );
}

export default PieChart;