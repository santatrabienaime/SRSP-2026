import {
  CheckCircle2, Info, XCircle, ChevronRight,
  Compass, UserCheck, ShieldCheck, AlertTriangle, Stamp, Archive, MailPlus,
} from 'lucide-react';
import { formatDateTime } from '../../utils/formatDate.js';

/**
 * Le `type` enregistré par le workflow dit quel acte est visé (affectation,
 * vérification, correction…). Chaque acte a son icône et sa couleur : une
 * demande d'action ne se confond pas avec un simple compte rendu. Un type
 * inconnu retombe sur l'icône d'information.
 */
const ICONS = {
  INFO: Info,
  SUCCESS: CheckCircle2,
  ERROR: XCircle,
  WORKFLOW: Compass,
  AFFECTATION: UserCheck,
  VERIFICATION: ShieldCheck,
  CORRECTION: AlertTriangle,
  VALIDATION: CheckCircle2,
  SIGNATURE: Stamp,
  CLOTURE: Archive,
  COURRIER: MailPlus,
};

const COULEURS = {
  ERROR: 'text-red-500',
  CORRECTION: 'text-amber-500',
  SUCCESS: 'text-emerald-500',
  VALIDATION: 'text-emerald-500',
  SIGNATURE: 'text-emerald-500',
  CLOTURE: 'text-emerald-500',
  VERIFICATION: 'text-violet-500',
  AFFECTATION: 'text-blue-500',
  COURRIER: 'text-sky-500',
};

/**
 * Une notification (ligne).
 *
 * `actionLabel` n'est fourni que si la notification est cliquable : le
 * libellé dit alors où le clic mène, pour que l'utilisateur sache où il va
 * avant de cliquer.
 */
export function NotificationItem({ notification, actionLabel = null }) {
  const Icon = ICONS[notification.type] || Info;
  return (
    <div
      className={`flex gap-3 px-4 py-3 ${
        notification.lu ? 'bg-white' : 'bg-primary-50/60'
      }`}
    >
      <Icon
        className={`mt-0.5 h-4 w-4 shrink-0 ${
          COULEURS[notification.type] || 'text-primary-500'
        }`}
      />
      <div className="min-w-0 flex-1">
        <p
          className={`text-sm ${
            notification.lu
              ? 'text-slate-500'
              : 'font-medium text-slate-800'
          }`}
        >
          {/* Retire avant le retour a la ligne : un message d'une seule ligne
              reste sur une ligne, ce qui garde la liste compacte. */}
          {notification.message}
        </p>
        <p className="mt-0.5 text-xs text-slate-400">
          {formatDateTime(notification.created_at)}
        </p>
        {actionLabel && (
          <p className="mt-1.5 flex items-center gap-0.5 text-xs font-medium text-primary-700">
            {actionLabel}
            <ChevronRight className="h-3 w-3" aria-hidden="true" />
          </p>
        )}
      </div>
    </div>
  );
}

export default NotificationItem;
