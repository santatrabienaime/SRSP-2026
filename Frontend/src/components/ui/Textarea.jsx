import { forwardRef } from 'react';

export const Textarea = forwardRef(function Textarea(
  { label, error, className = '', id, required, ...props },
  ref
) {
  const textareaId = id || props.name || label;
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
        className={`block w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
          ${error ? 'border-red-400' : 'border-slate-300'}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
});

export default Textarea;