import { forwardRef } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const base =
  'block w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-800 ' +
  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-slate-50';

/**
 * Liste déroulante — un choix se contrôle aussi : sans valeur, le champ est en
 * erreur ; une fois choisi, il se confirme en vert. Mêmes messages que les
 * champs de saisie, pour que l'écran parle d'une seule voix.
 */
export const Select = forwardRef(function Select(
  {
    label,
    error,
    hint,
    success = false,
    successMessage,
    className = '',
    id,
    required,
    children,
    placeholder,
    value,
    ...props
  },
  ref
) {
  const selectId = id || props.name || label;
  const texte = error || (success ? successMessage : null) || hint;
  const estErreur = Boolean(error);
  const estOk = !error && Boolean(success && successMessage);

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={selectId}
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        id={selectId}
        ref={ref}
        value={value}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={texte ? `${selectId}-message` : undefined}
        className={`${base} ${
          error ? 'border-red-400' : success ? 'border-emerald-400' : 'border-slate-300'
        }`}
        {...props}
      >
        {placeholder !== undefined && (
          <option value="">{placeholder}</option>
        )}
        {children}
      </select>
      {texte && (
        <p
          id={`${selectId}-message`}
          className={
            estErreur
              ? 'mt-1 flex items-center gap-1 text-xs text-red-600'
              : estOk
                ? 'mt-1 flex items-center gap-1 text-xs text-emerald-600'
                : 'mt-1 text-xs text-slate-500'
          }
        >
          {estErreur && <AlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />}
          {estOk && <CheckCircle2 className="h-3 w-3 shrink-0" aria-hidden="true" />}
          {texte}
        </p>
      )}
    </div>
  );
});

export default Select;
