import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNotification } from '../../hooks/useNotification.js';
import { NotificationList } from './NotificationList.jsx';

/** Cloche de notifications avec compte non lues et panneau déroulant. */
export function NotificationBell() {
  const { unreadCount } = useNotification();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-md p-2 text-slate-500 hover:bg-slate-100"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      {open && (
        /* Sur un écran étroit, le panneau ne peut pas être plus large que la
           fenêtre, sinon il déborde et le clic « ouvrir le dossier » part hors
           de l'écran. */
        <div className="absolute right-0 z-30 mt-2 w-[min(20rem,calc(100vw-1.5rem))] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="border-b border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
            Notifications
          </div>
          {/* onNavigate ferme le panneau au clic sur une notification : le
              panneau ne doit pas rester ouvert par-dessus la fiche qui
              s'ouvre. */}
          <NotificationList compact onNavigate={() => setOpen(false)} />
          <div className="border-t border-slate-200 p-2">
            <button
              onClick={() => setOpen(false)}
              className="w-full rounded-md bg-slate-50 py-1.5 text-center text-xs text-slate-500 hover:bg-slate-100"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;