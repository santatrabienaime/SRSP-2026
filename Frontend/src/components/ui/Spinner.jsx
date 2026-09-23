export function Spinner({ label = 'Chargement…', className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-12 ${className}`}>
      <span
        className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"
        aria-hidden="true"
      />
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}

export default Spinner;