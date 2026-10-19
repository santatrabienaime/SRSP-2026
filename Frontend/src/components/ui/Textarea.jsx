import { forwardRef } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

/**
 * Zone de texte — mêmes messages d'alerte que `Input` : erreur (rouge),
 * confirmation (vert) ou format attendu (gris), avec compteur de caractères.
 *
 * Les deux composants doivent se comporter pareil : un agent qui apprend la
 * règle sur un champ la retrouve sur tous les autres.
 */
export const Textarea = forwardRef(function Textarea(
  {
    label,
    error,
    hint,
    success = false,
    successMessage,
    showCounter = false,
    className = '',
    id,
    required,
    value,
    ...props
  },
  ref
) {
  const textareaId = id || props.name || label;
  const borneHaute = typeof props.maxLength === 'number' ? props.maxLength : null;
  const compteur = showCounter && borneHaute ? `${String(value ?? '').length}/${borneHaute}` : null;
  const plein = compteur && String(value ?? '').length >= borneHaute;

  const texte = error || (success ? successMessage : null) || hint;
  const estErreur = Boolean(error);
  const estOk = !error && Boolean(success && successMessage);

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={textareaId}
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        ref={ref}
        rows={props.rows || 3}
        value={value}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={texte ? `${textareaId}-message` : undefined}
        className={`block w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
          ${
            error
              ? 'border-red-400 focus:ring-red-500 focus:border-red-500'
              : success
                ? 'border-emerald-400 focus:ring-emerald-500 focus:border-emerald-500'
                : 'border-slate-300'
          }`}
        {...props}
      />
      {(texte || compteur) && (
        <div className="flex items-start justify-between gap-2">
          {texte ? (
            <p
              id={`${textareaId}-message`}
              className={
                estErreur
                  ? 'flex items-center gap-1 text-xs text-red-600'
                  : estOk
                    ? 'flex items-center gap-1 text-xs text-emerald-600'
                    : 'text-xs text-slate-500'
              }
            >
              {estErreur && <AlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />}
              {estOk && <CheckCircle2 className="h-3 w-3 shrink-0" aria-hidden="true" />}
              {texte}
            </p>
          ) : (
            <span />
          )}
          {compteur && (
            <span
              className={
                plein ? 'text-xs font-medium text-amber-600' : 'text-xs text-slate-400'
              }
            >
              {compteur}
            </span>
          )}
        </div>
      )}
    </div>
  );
});

export default Textarea;
