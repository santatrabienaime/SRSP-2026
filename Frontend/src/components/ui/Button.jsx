const VARIANTS = {
  primary:
    'bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500 disabled:bg-primary-300',
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