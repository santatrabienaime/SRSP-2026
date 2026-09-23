/** Carte statistique (kpi) avec icône, valeur et libellé. */
export function StatCard({ icon: Icon, label, value, sub, tone = 'primary', loading = false }) {
  const tones = {
    primary: 'bg-primary-50 text-primary-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    violet: 'bg-violet-50 text-violet-600',
    sky: 'bg-sky-50 text-sky-600',
    slate: 'bg-slate-100 text-slate-600',
  };
  return (
    <div className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${tones[tone] || tones.primary}`}>
        {Icon && <Icon className="h-6 w-6" />}
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>
        {loading ? (
          <div className="mt-1 h-6 w-16 animate-pulse rounded bg-slate-200" />
        ) : (
          <p className="text-2xl font-bold text-slate-800">{value ?? '—'}</p>
        )}
        {sub && <p className="text-xs text-slate-500">{sub}</p>}
      </div>
    </div>
  );
}

export default StatCard;