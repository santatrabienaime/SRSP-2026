/**
 * AnimatedCard — Carre de contenu avec animation d'entrée au montage.
 *
 * Props :
 *  - children : contenu de la carte
 *  - className : classes supplémentaires
 *  - delay : délai d'animation en ms (défaut 0)
 *  - type : type d'animation (slide-in-up, fade-in, scale-in, etc.)
 *  - title : titre optionnel affiché en en-tête
 *  - subtitle : sous-titre optionnel
 *  - icon : composant d'icône lucide optionnel
 */
import { useAnimation } from '../../hooks/useAnimation.jsx';

export function AnimatedCard({
  children,
  className = '',
  delay = 0,
  type = 'slide-in-up',
  title,
  subtitle,
  Icon,
}) {
  const { isMounted, animationClass } = useAnimation({ delay, type });

  if (!isMounted) return null;

  return (
    <div
      className={`glass-card-modern p-6 ${className} ${animationClass}`}
    >
      {title && (
        <div className="mb-4">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              {title}
            </h3>
          </div>
          {subtitle && (
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          )}
        </div>
      )}
      <div className="animate-fade-in">{children}</div>
    </div>
  );
}

export default AnimatedCard;