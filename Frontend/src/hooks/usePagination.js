import { useState, useMemo } from 'react';

/**
 * Pagination côté client.
 *  - items : tableau complet
 *  - pageSize : nombre d'éléments par page (défaut 10)
 * Retourne { page, setPage, pageSize, setPageSize, currentItems, totalPages, from, to, total }
 */
export function usePagination(items = [], pageSize = 10) {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(pageSize);

  const totalPages = Math.max(1, Math.ceil(items.length / size));
  const safePage = Math.min(page, totalPages);

  const currentItems = useMemo(() => {
    const start = (safePage - 1) * size;
    return items.slice(start, start + size);
  }, [items, safePage, size]);

  const from = items.length === 0 ? 0 : (safePage - 1) * size + 1;
  const to = Math.min(safePage * size, items.length);

  return {
    page: safePage,
    setPage,
    pageSize: size,
    setPageSize: (s) => {
      setSize(s);
      setPage(1);
    },
    currentItems,
    totalPages,
    from,
    to,
    total: items.length,
    reset: () => setPage(1),
  };
}

export default usePagination;