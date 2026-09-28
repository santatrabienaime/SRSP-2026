import { Link, useNavigate } from 'react-router-dom';
import { CheckCheck } from 'lucide-react';
import { useNotification } from '../../hooks/useNotification.js';
import { NotificationItem } from './NotificationItem.jsx';
import { EmptyState } from '../ui/EmptyState.jsx';
import { destinationNotification, libelleAction } from '../../utils/notificationTarget.js';

/**
 * Liste des notifications (pleine page ou compacte dans la cloche).
 *
 * Chaque notification cliquable mène directement à l'action : c'est la règle
 * « une notification = un lien direct vers l'action à effectuer ». Le clic
 * marque aussi la notification comme lue — un double effet, un seul geste.
 * Les notifications sans cible connue ne sont pas cliquables : elles ne mènent
 * nulle part plutôt qu'à une page au hasard.
 */
export function NotificationList({ compact = false, onNavigate = null }) {
  const { notifications, markRead, markAllRead, refresh } = useNotification();
  const navigate = useNavigate();

  if (!notifications.length) {
    return (
      <EmptyState
        title="Aucune notification"
        message="Vous serez prévenu ici des actions concernant vos dossiers."
      />
    );
  }

  const ouvrir = (n) => {
    const cible = destinationNotification(n);
    if (!cible) return;
    // On marque comme lu avant de naviguer : sinon le compteur peut rester
    // erroné sur la page d'arrivée, où la cloche se recharge au changement
    // d'utilisateur.
    if (!n.lu) markRead(n.id);
    onNavigate?.();
    navigate(cible);
  };

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
        {notifications.map((n) => {
          const cible = destinationNotification(n);
          const libelle = libelleAction(n);

          if (!cible) {
            // Pas de destination connue : lecture seule, pas de role="button"
            // trompeur ni de tabulation inutile.
            return (
              <div key={n.id} className="border-b border-slate-100 last:border-0">
                <NotificationItem notification={n} />
              </div>
            );
          }

          return (
            <div
              key={n.id}
              role="button"
              tabIndex={0}
              onClick={() => ouvrir(n)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  ouvrir(n);
                }
              }}
              className="cursor-pointer border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50 focus:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500 motion-reduce:transition-none"
              aria-label={`${libelle} — ${n.message}`}
            >
              <NotificationItem notification={n} actionLabel={libelle} />
            </div>
          );
        })}
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
