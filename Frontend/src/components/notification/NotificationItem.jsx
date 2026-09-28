import { CheckCircle2, Info, XCircle, ChevronRight } from 'lucide-react';
import { formatDateTime } from '../../utils/formatDate.js';

const ICONS = {
  SUCCESS: CheckCircle2,
  INFO: Info,
  ERROR: XCircle,
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
          notification.type === 'ERROR'
            ? 'text-red-500'
            : notification.type === 'SUCCESS'
              ? 'text-emerald-500'
              : 'text-primary-500'
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
