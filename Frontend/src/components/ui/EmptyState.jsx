import { Inbox } from 'lucide-react';

/** État vide pour listes et tableaux. */
export function EmptyState({ title = 'Aucune donnée', message, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 py-14 text-center">
      <Inbox className="mb-3 h-10 w-10 text-slate-300" />
      <p className="text-sm font-medium text-slate-600">{title}</p>
      {message && <p className="mt-1 max-w-sm text-xs text-slate-400">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export default EmptyState;