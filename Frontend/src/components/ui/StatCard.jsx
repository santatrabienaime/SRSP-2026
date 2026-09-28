/**
 * Carte statistique (kpi) : icône, valeur, libellé.
 *
 * Aucun effet de survol : la carte, son icône et son chiffre restent immobiles
 * au passage de la souris. Les chiffres se lisent d'un bloc, et un tableau de
 * bord se parcourt en déplaçant la souris : le soulèvement faisait alors
 * bouger la ligne en cours de lecture.
 */
export function StatCard({
  icon: Icon, label, value, sub, tone = 'primary', loading = false,
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

  return (
    <div className="relative flex items-center gap-3 overflow-hidden rounded-lg border border-slate-200 bg-white p-3 shadow-sm sm:gap-4 sm:p-4">
      {/* L'icône et son libellé rétrécissent sur petit écran : dans le rail
          de la barre latérale, une carte statistique ne dispose que d'environ
          250 px de large, et une icône de 48 px y prenait un cinquième. */}
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg sm:h-12 sm:w-12 ${
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
          <p className="text-xl font-bold text-slate-800 sm:text-2xl">
            {value ?? '—'}
          </p>
        )}
        {sub && <p className="truncate text-[11px] text-slate-500 sm:text-xs">{sub}</p>}
      </div>
    </div>
  );
}

export default StatCard;
