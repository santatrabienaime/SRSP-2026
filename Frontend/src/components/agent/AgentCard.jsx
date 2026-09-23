import { UserCircle2 } from 'lucide-react';
import { Badge } from '../ui/Badge.jsx';

/** Carte d'un agent (grille). */
export function AgentCard({ agent }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-700">
          <UserCircle2 className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-800">
            {agent.nom} {agent.prenom}
          </p>
          <p className="truncate text-xs text-slate-400">{agent.fonction_libelle || '—'}</p>
        </div>
      </div>
      <dl className="mt-3 space-y-1 text-xs text-slate-500">
        <div className="flex justify-between">
          <dt>Matricule</dt>
          <dd className="font-medium text-slate-600">{agent.matricule || '—'}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Division</dt>
          <dd className="truncate text-slate-600">{agent.division_nom || '—'}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Email</dt>
          <dd className="truncate text-slate-600">{agent.email || '—'}</dd>
        </div>
      </dl>
      <div className="mt-3">
        {agent.actif ? (
          <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">Actif</Badge>
        ) : (
          <Badge className="border-slate-200 bg-slate-100 text-slate-500">Inactif</Badge>
        )}
      </div>
    </div>
  );
}

export default AgentCard;