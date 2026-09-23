import { CheckCircle2, Info, XCircle, X } from 'lucide-react';
import { useNotification } from '../../hooks/useNotification.js';

const STYLES = {
  success: { cls: 'border-emerald-300 bg-emerald-50 text-emerald-800', Icon: CheckCircle2 },
  error: { cls: 'border-red-300 bg-red-50 text-red-800', Icon: XCircle },
  info: { cls: 'border-sky-300 bg-sky-50 text-sky-800', Icon: Info },
};

/** Rendu des toasts produits par NotificationContext. */
export function Toaster() {
  const { toasts, dismiss } = useNotification();
  if (!toasts.length) return null;
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((t) => {
        const { cls, Icon } = STYLES[t.type] || STYLES.info;
        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-md border p-3 shadow-lg ${cls}`}
            role="status"
          >
            <Icon className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{t.title}</p>
              {t.message && <p className="mt-0.5 text-sm break-words">{t.message}</p>}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="shrink-0 rounded p-0.5 opacity-60 hover:opacity-100"
              aria-label="Fermer la notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default Toaster;