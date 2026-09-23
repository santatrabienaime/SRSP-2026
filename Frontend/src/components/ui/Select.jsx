import { forwardRef } from 'react';

const base =
  'block w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-800 ' +
  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-slate-50';

export const Select = forwardRef(function Select(
  { label, error, className = '', id, required, children, placeholder, ...props },
  ref
) {
  const selectId = id || props.name || label;
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
        className={`${base} ${
          error ? 'border-red-400' : 'border-slate-300'
        }`}
        {...props}
      >
        {placeholder !== undefined && (
          <option value="">{placeholder}</option>
        )}
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
});

export default Select;