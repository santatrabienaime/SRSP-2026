import { Link } from 'react-router-dom';
import { FolderKanban } from 'lucide-react';
import { Badge } from '../ui/Badge.jsx';
import { formatDateString } from '../../utils/formatDate.js';
import { formatStatus, statusBadgeClass } from '../../utils/formatStatus.js';

/** Carte d'un dossier (vue grille). */
export function DossierCard({ dossier }) {
  return (
    <Link
      to={`/dossiers/${dossier.id}`}
      className="group block rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-primary-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
            <FolderKanban className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-bold text-primary-700">{dossier.numero}</p>
            <p className="text-xs text-slate-400">{dossier.type_libelle}</p>
          </div>
        </div>
        <Badge className={statusBadgeClass(dossier.statut_code)}>
          {formatStatus(dossier.statut_code)}
        </Badge>
      </div>

      <p className="mt-3 line-clamp-2 text-sm font-medium text-slate-700">
        {dossier.objet}
      </p>
      <p className="mt-1 text-xs text-slate-500">
        Demandeur : <span className="font-medium">{dossier.demandeur}</span>
      </p>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
        <span>{dossier.division_nom}</span>
        <span className="font-medium text-slate-600">{formatDateString(dossier.date_reception)}</span>
      </div>

      {dossier.agent_nom && (
        <p className="mt-1 truncate text-xs text-slate-400">
          Agent : {dossier.agent_nom} {dossier.agent_prenom}
        </p>
      )}
    </Link>
  );
}

export default DossierCard;