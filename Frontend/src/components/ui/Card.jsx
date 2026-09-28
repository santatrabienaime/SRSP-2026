/**
 * Carte : conteneur principal des pages.
 *
 * Elle se soulève légèrement au survol (translation, ombre, bordure). Le
 * mouvement est neutralisé si l'utilisateur a demandé de limiter les
 * animations, et l'effet peut être désactivé carte par carte avec
 * `hoverable={false}` — utile pour une carte de lecture où le soulèvement
 * nuirait à la concentration.
 */
export function Card({
  title, subtitle, actions, children,
  className = '', bodyClassName = '', hoverable = true,
}) {
  return (
    <div
      className={`rounded-lg border border-slate-200 bg-white shadow-sm ${className} ${
        hoverable
          ? 'transition-[transform,box-shadow,border-color] duration-300 ease-out ' +
            'hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md ' +
            'motion-reduce:transform-none motion-reduce:transition-none'
          : ''
      }`}
    >
      {(title || actions) && (
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-3">
          <div>
            {title && <h3 className="text-sm font-semibold text-slate-800">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={`px-5 py-4 ${bodyClassName}`}>{children}</div>
    </div>
  );
}

export default Card;