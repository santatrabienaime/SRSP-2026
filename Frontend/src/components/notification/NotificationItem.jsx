import { CheckCircle2, Info, XCircle } from 'lucide-react';
import { formatDateTime } from '../../utils/formatDate.js';

const ICONS = {
  SUCCESS: CheckCircle2,
  INFO: Info,
  ERROR: XCircle,
};

/** Une notification (ligne). */
export function NotificationItem({ notification }) {
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
      <div className="min-w-0">
        <p
          className={`truncate text-sm ${
            notification.lu ? 'text-slate-500' : 'font-medium text-slate-800'
          }`}
        >
          {notification.message}
        </p>
        <p className="mt-0.5 text-xs text-slate-400">
          {formatDateTime(notification.created_at)}
        </p>
      </div>
    </div>
  );
}

export default NotificationItem;