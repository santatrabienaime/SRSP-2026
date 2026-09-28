/**
 * Carte statistique (kpi) : icône, valeur, libellé.
 *
 * Le survol est plus marqué que sur une simple carte, parce qu'une carte
 * de statistique est un point d'entrée visuel : on la soulève, on renforce sa
 * bordure, l'icône grandit légèrement et un filet de couleur se déploie en
 * haut. Ces repères guident l'œil vers les chiffres.
 *
 * L'effet est entièrement neutralisé si l'utilisateur a demandé de limiter
 * les animations, et il peut être coupé avec `hoverable={false}`.
 */
export function StatCard({
  icon: Icon, label, value, sub, tone = 'primary', loading = false, hoverable = true,
}) {
  const tones = {
    primary: 'bg-primary-50 text-primary-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    violet: 'bg-violet-50 text-violet-600',
    sky: 'bg-sky-50 text-sky-600',
    slate: 'bg-slate-100 text-slate-600',
  };
  // Filet coloré du bord supérieur : une teinte par ton.
  const filets = {
    primary: 'from-primary-500',
    emerald: 'from-emerald-500',
    amber: 'from-amber-500',
    red: 'from-red-500',
    violet: 'from-violet-500',
    sky: 'from-sky-500',
    slate: 'from-slate-500',
  };

  return (
    <div
      className={`group relative flex items-center gap-3 overflow-hidden rounded-lg border border-slate-200 bg-white p-3 shadow-sm sm:gap-4 sm:p-4 ${
        hoverable
          ? 'transition-[transform,box-shadow,border-color] duration-300 ease-out ' +
            'hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg ' +
            'motion-reduce:transform-none motion-reduce:transition-none'
          : ''
      }`}
    >
      {/* Filet de couleur qui se déploie depuis la gauche au survol. */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r to-transparent transition-transform duration-300 ease-out group-hover:scale-x-100 motion-reduce:transition-none motion-reduce:scale-x-100 ${
          filets[tone] || filets.primary
        }`}
      />

      {/* L'icône et son libellé rétrécissent sur petit écran : dans le rail
          de la barre latérale, une carte statistique ne dispose que d'environ
          250 px de large, et une icône de 48 px y prenait un cinquième. */}
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-transform duration-300 ease-out group-hover:scale-110 motion-reduce:transform-none motion-reduce:transition-none sm:h-12 sm:w-12 ${
          tones[tone] || tones.primary
        }`}
      >
        {Icon && <Icon className="h-5 w-5 sm:h-6 sm:w-6" />}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-medium uppercase tracking-wide text-slate-500 sm:text-xs">
          {label}
        </p>
        {loading ? (
          <div className="mt-1 h-6 w-16 animate-pulse rounded bg-slate-200" />
        ) : (
          <p className="text-xl font-bold text-slate-800 transition-colors duration-300 group-hover:text-primary-700 motion-reduce:transition-none sm:text-2xl">
            {value ?? '—'}
          </p>
        )}
        {sub && <p className="truncate text-[11px] text-slate-500 sm:text-xs">{sub}</p>}
      </div>
    </div>
  );
}

export default StatCard;
