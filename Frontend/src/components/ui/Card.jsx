/**
 * Carte : conteneur principal des pages.
 *
 * Aucun effet de survol : la carte reste immobile au passage de la souris. Un
 * soulèvement, même léger, fait bouger la zone de lecture au moment précis où
 * l'on cherche à lire.
 */
export function Card({
  title, subtitle, actions, children, className = '', bodyClassName = '',
}) {
  return (
    <div className={`rounded-lg border border-slate-200 bg-white shadow-sm ${className}`}>
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