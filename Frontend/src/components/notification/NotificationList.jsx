import { Link } from 'react-router-dom';
import { CheckCheck } from 'lucide-react';
import { useNotification } from '../../hooks/useNotification.js';
import { NotificationItem } from './NotificationItem.jsx';
import { EmptyState } from '../ui/EmptyState.jsx';

/** Liste des notifications (pleine page ou compacte dans la cloche). */
export function NotificationList({ compact = false }) {
  const { notifications, markRead, markAllRead, refresh } = useNotification();

  if (!notifications.length) {
    return (
      <EmptyState
        title="Aucune notification"
        message="Vous serez prévenu ici des actions concernant vos dossiers."
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2">
        <span className="text-xs text-slate-500">
          {notifications.length} notification(s)
        </span>
        <button
          onClick={async () => {
            await markAllRead();
          }}
          className="flex items-center gap-1 text-xs text-primary-600 hover:underline"
        >
          <CheckCheck className="h-3.5 w-3.5" /> Tout marquer lu
        </button>
      </div>
      <div className={compact ? 'max-h-80 overflow-y-auto' : ''}>
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => !n.lu && markRead(n.id)}
            className="cursor-pointer"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && !n.lu && markRead(n.id)}
          >
            <NotificationItem notification={n} />
          </div>
        ))}
      </div>
      {!compact && (
        <div className="mt-3 text-center">
          <Link
            to="/notifications"
            className="text-xs text-primary-600 hover:underline"
            onClick={refresh}
          >
            Voir toutes les notifications
          </Link>
        </div>
      )}
    </div>
  );
}

export default NotificationList;