import {
  LineChart as ReLine,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

/** Courbe d'évolution (ex. dossiers par mois). */
export function LineChart({ data = [], dataKey = 'total', nameKey = 'label', color = '#2563eb', height = 280 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReLine data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey={nameKey} tick={{ fontSize: 11, fill: '#64748b' }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
        <Tooltip
          formatter={(v) => [v, 'Dossiers']}
        />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2.5}
          dot={{ r: 3, fill: color }}
          activeDot={{ r: 5 }}
        />
      </ReLine>
    </ResponsiveContainer>
  );
}

export default LineChart;