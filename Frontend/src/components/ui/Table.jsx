import { Spinner } from './Spinner.jsx';

/**
 * Table simple avec colonnes configurables.
 * columns : [{ key, label, render?, className?, hideOn? }]
 */
export function Table({ columns = [], data = [], loading = false, emptyLabel = 'Aucune donnée' }) {
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
                {col.label}
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
              <tr
                key={row.id ?? i}
                className="transition-colors duration-200 hover:bg-slate-50 motion-reduce:transition-none"
              >
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