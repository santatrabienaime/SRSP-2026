const VARIANTS = {
  // Le survol passe par primary-800 et non primary-700 : en mode sombre,
  // primary-700 devient un bleu clair (c'est une couleur de texte sur fond
  // teinté) et conviendrait mal à un fond de bouton sur lequel le texte est
  // blanc. primary-800 reste assez sombre dans les deux thèmes.
  primary:
    'bg-primary-600 text-white hover:bg-primary-800 focus-visible:ring-primary-500 disabled:bg-primary-300',
  secondary:
    'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus-visible:ring-slate-400',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 disabled:bg-red-300',
  success:
    'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500 disabled:bg-emerald-300',
  ghost:
    'bg-transparent text-primary-600 hover:bg-primary-50 focus-visible:ring-primary-400',
  outline:
    'bg-white text-primary-600 border border-primary-500 hover:bg-primary-50 focus-visible:ring-primary-400',
  // Écran de connexion : contour clair au repos, qui se REMPLIT d'un dégradé au
  // survol, DE GAUCHE À DROITE. Le balayage se fait par clip-path plutôt que par
  // opacité ou scaleX : le dégradé garde ainsi ses proportions et ne se déforme
  // pas pendant qu'il entre. 600 ms, easing doux — un fondu de 300 ms était trop
  // vif pour être lu. En sortant du survol, le remplissage se retracte par le
  // même chemin.
  accent:
    'relative isolate overflow-hidden border border-cyan-400/45 text-cyan-300 ' +
    'transition-colors duration-500 ' +
    'before:absolute before:inset-0 before:-z-10 before:bg-gradient-to-r ' +
    'before:from-primary-500 before:to-cyan-500 before:[clip-path:inset(0_100%_0_0)] ' +
    'before:transition-[clip-path] before:duration-[600ms] before:ease-out ' +
    'hover:before:[clip-path:inset(0_0_0_0)] ' +
    'hover:border-cyan-300/80 hover:text-white hover:shadow-lg hover:shadow-cyan-500/30 ' +
    'active:scale-[.98] focus-visible:ring-cyan-400 focus-visible:ring-offset-slate-950 ' +
    'disabled:border-white/15 disabled:text-white/30',
};

const SIZES = {
  sm: 'px-2.5 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  type = 'button',
  className = '',
  disabled,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        ${VARIANTS[variant] || VARIANTS.primary} ${SIZES[size] || SIZES.md}
        disabled:cursor-not-allowed disabled:opacity-70 ${className}`}
      {...props}
    >
      {loading && (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
}

export default Button;