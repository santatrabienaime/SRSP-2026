import { forwardRef } from 'react';

const base =
  'block w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 ' +
  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-slate-50 disabled:text-slate-400';

const stateCls = (error) =>
  error
    ? 'border-red-400 focus:ring-red-500 focus:border-red-500'
    : 'border-slate-300';

/**
 * Ton sombre, pour les écrans à fond sombre (connexion). Le ton clair reste le
 * défaut : aucun écran existant n'est modifié.
 */
const DARK = {
  wrap: 'space-y-1.5',
  label: 'mb-0 block text-[11px] font-semibold uppercase tracking-wider text-white/60',
  required: 'text-cyan-400',
  input:
    'block w-full rounded-lg border border-white/12 bg-white/[.06] px-3.5 py-2.5 text-sm ' +
    'text-white placeholder:text-white/30 backdrop-blur-sm transition-all duration-200 ' +
    'focus:outline-none focus:bg-white/[.10] focus:border-cyan-300/70 focus:ring-4 ' +
    'focus:ring-cyan-400/15',
  error: 'border-red-400/70 bg-red-500/10 focus:border-red-400 focus:ring-red-500/20',
  hint: 'text-white/40',
  errorText: 'text-red-300',
};

export const Input = forwardRef(function Input(
  { label, error, hint, className = '', id, required, tone = 'light', ...props },
  ref
) {
  const inputId = id || props.name || label;
  const sombre = tone === 'dark';

  if (sombre) {
    return (
      <div className={`${DARK.wrap} ${className}`}>
        {label && (
          <label htmlFor={inputId} className={DARK.label}>
            {label} {required && <span className={DARK.required}>*</span>}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          aria-invalid={error ? 'true' : undefined}
          className={`${DARK.input} ${error ? DARK.error : ''}`}
          {...props}
        />
        {hint && !error && <p className={DARK.hint}>{hint}</p>}
        {error && <p className={DARK.errorText}>{error}</p>}
      </div>
    );
  }

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        id={inputId}
        ref={ref}
        aria-invalid={error ? 'true' : undefined}
        className={`${base} ${stateCls(error)}`}
        {...props}
      />
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
});

export default Input;