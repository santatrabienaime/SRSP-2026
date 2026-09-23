import { forwardRef } from 'react';

const base =
  'block w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 ' +
  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-slate-50 disabled:text-slate-400';

const stateCls = (error) =>
  error
    ? 'border-red-400 focus:ring-red-500 focus:border-red-500'
    : 'border-slate-300';

export const Input = forwardRef(function Input(
  { label, error, hint, className = '', id, required, ...props },
  ref
) {
  const inputId = id || props.name || label;
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
        className={`${base} ${stateCls(error)}`}
        {...props}
      />
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
});

export default Input;