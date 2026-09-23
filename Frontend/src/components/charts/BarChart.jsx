import {
  BarChart as ReBar,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';

/** Graphique en barres (répartition par statut / division...). */
export function BarChart({ data = [], dataKey = 'total', nameKey = 'name', color = '#2563eb', height = 280 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReBar data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey={nameKey} tick={{ fontSize: 11, fill: '#64748b' }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
        <Tooltip
          cursor={{ fill: '#f1f5f9' }}
          formatter={(v) => [v, 'Nombre']}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey={dataKey} name="Dossiers" fill={color} radius={[4, 4, 0, 0]} />
      </ReBar>
    </ResponsiveContainer>
  );
}

export default BarChart;