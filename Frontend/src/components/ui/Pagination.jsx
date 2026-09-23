import { ChevronLeft, ChevronRight } from 'lucide-react';

/** Pagination de table : page, totalPages, from, to, total. */
export function Pagination({ pagination, className = '' }) {
  const { page, setPage, pageSize, setPageSize, totalPages, from, to, total } =
    pagination;

  if (!total) return null;

  const pages = [];
  for (let p = 1; p <= totalPages; p++) {
    if (
      p === 1 ||
      p === totalPages ||
      Math.abs(p - page) <= 1
    ) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…');
    }
  }

  return (
    <div className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${className}`}>
      <p className="text-sm text-slate-500">
        Affichage <span className="font-medium text-slate-700">{from}</span>–
        <span className="font-medium text-slate-700">{to}</span> sur{' '}
        <span className="font-medium text-slate-700">{total}</span>
      </p>
      <div className="flex items-center gap-1">
        <select
          className="mr-2 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-600"
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          aria-label="Éléments par page"
        >
          {[10, 25, 50, 100].map((n) => (
            <option key={n} value={n}>
              {n} / page
            </option>
          ))}
        </select>
        <button
          onClick={() => setPage(page - 1)}
          disabled={page <= 1}
          className="rounded-md border border-slate-300 p-1.5 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Page précédente"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`dots-${i}`} className="px-1.5 text-slate-400">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`min-w-8 rounded-md border px-2 py-1 text-sm ${
                p === page
                  ? 'border-primary-600 bg-primary-600 text-white'
                  : 'border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => setPage(page + 1)}
          disabled={page >= totalPages}
          className="rounded-md border border-slate-300 p-1.5 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Page suivante"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default Pagination;