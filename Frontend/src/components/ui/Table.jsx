import { Spinner } from './Spinner.jsx';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

/**
 * Table simple avec colonnes configurables.
 * columns : [{ key, label, render?, className?, sortable? }]
 * sort : { key, dir } — colonne triée actuellement ('asc' | 'desc')
 * onSort(key) : appelé au clic sur un en-tête triable (tri asc/desc).
 */
export function Table({
  columns = [],
  data = [],
  loading = false,
  emptyLabel = 'Aucune donnée',
  sort = null,
  onSort = null,
}) {
  // Premier chargement sans données : spinner plein (rien à afficher).
  // Rechargements suivants : on garde les lignes affichées + barre de progression
  // discrète, sinon le tableau disparaît et revient (effet clignotant).
  const initialLoading = loading && data.length === 0;
  if (initialLoading) {
    return <Spinner className="py-10" />;
  }
  return (
    <div className="relative overflow-x-auto rounded-lg border border-slate-200">
      {loading && (
        <div className="absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden bg-primary-100">
          <div className="h-full w-1/3 animate-pulse bg-primary-500" />
        </div>
      )}
      {loading && (
        <div className="pointer-events-none absolute inset-0 bg-white/40" aria-busy="true" />
      )}
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((col, i) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 ${col.className || ''} ${
                  /* Première colonne collante : sur un téléphone, un tableau
                     à six colonnes se parcourt en faisant défiler
                     horizontalement. Sans cela on perd la ligne en cours de
                     lecture — on ne voit plus à quel dossier la ligne
                     appartient. Elle reste donc visible, avec une ombre
                     discrète qui marque le bord. */
                  i === 0 ? 'sticky left-0 z-10 bg-slate-50 shadow-[1px_0_0_0_var(--color-slate-200)]' : ''
                }`}
              >
                {col.sortable && onSort ? (
                  <button
                    type="button"
                    onClick={() => onSort(col.key)}
                    className="group inline-flex items-center gap-1 uppercase focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                    aria-label={`Trier par ${typeof col.label === 'string' ? col.label : col.key}`}
                  >
                    {col.label}
                    {sort?.key === col.key ? (
                      sort.dir === 'asc' ? (
                        <ArrowUp className="h-3 w-3 text-primary-500" />
                      ) : (
                        <ArrowDown className="h-3 w-3 text-primary-500" />
                      )
                    ) : (
                      <ArrowUpDown className="h-3 w-3 opacity-30 group-hover:opacity-70" />
                    )}
                  </button>
                ) : (
                  col.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-10 text-center text-slate-400"
              >
                {emptyLabel}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              /* Aucun surlignage au survol : la ligne reste fixe, comme le reste
                 de l'interface. */
              <tr key={row.id ?? i}>
                {columns.map((col, j) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 ${col.className || ''} ${
                      /* bg-white explicite : sans elle, la cellule collante
                         laisserait voir le fond de la ligne au survol, et
                         le texte passerait les autres colonnes par-dessus. */
                      j === 0 ? 'sticky left-0 z-0 bg-white shadow-[1px_0_0_0_var(--color-slate-200)]' : ''
                    }`}
                  >
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
