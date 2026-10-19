import { createContext, useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { io } from 'socket.io-client';
import { notificationService } from '../services/notificationService.js';
import { API_BASE } from '../config/constants.js';
import { useAuth } from '../hooks/useAuth.js';

export const NotificationContext = createContext(null);

const POLL_INTERVAL = 30000; // 30 s

/**
 * Origine du canal temps réel : celle de l'API.
 *
 * En développement, `API_BASE` est relatif (« /api ») : c'est le proxy Vite qui
 * relaie le WebSocket. Si une URL absolue est configurée (VITE_API_URL), le
 * socket doit viser la même origine que l'API, sinon il s'adresserait au
 * serveur des fichiers au lieu du serveur applicatif.
 */
function origineTempsReel() {
  try {
    return new URL(API_BASE, window.location.origin).origin;
  } catch {
    return window.location.origin;
  }
}

/* ----------------------------- Toasts ----------------------------- */
let toastId = 0;

const makeToast = (type, title, message) => ({
  id: ++toastId,
  type,
  title,
  message,
  createdAt: Date.now(),
});

/* --------------------------- Contexte ----------------------------- */
export function NotificationProvider({ children }) {
  const { token, user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState([]);
  const lastFetch = useRef(0);
  // Chaque utilisateur a SES notifications : le changement de compte doit
  // vider l'affichage, sinon on verrait celles du compte précédent.
  const userId = user?.id ?? null;

  const refresh = useCallback(async () => {
    if (!token) return;
    try {
      const data = await notificationService.list();
      // Réponse : { notifications, non_lues }
      const list = Array.isArray(data) ? data : data?.notifications;
      setNotifications(Array.isArray(list) ? list : []);
      setUnreadCount(
        Array.isArray(data)
          ? data.filter((n) => !n.lu).length
          : data?.non_lues ?? 0
      );
      lastFetch.current = Date.now();
    } catch {
      /* garde l'état précédent */
    }
  }, [token]);

  // Remise à zéro immédiate lors d'un changement d'utilisateur.
  useEffect(() => {
    Promise.resolve().then(() => {
      setNotifications([]);
      setUnreadCount(0);
    });
  }, [userId]);

  useEffect(() => {
    if (!token) return undefined;
    Promise.resolve().then(refresh);
    const timer = setInterval(refresh, POLL_INTERVAL);

    /* Temps réel : le serveur pousse un signal sur le canal privé de
       l'utilisateur dès qu'une notification lui est destinée. Le canal ne
       transporte que l'alerte — la liste et le compteur restent relus depuis
       l'API, qui seule fait foi. Le sondage périodique est conservé en filet :
       si le WebSocket tombe, l'affichage continue d'être rafraîchi. */
    const socket = io(origineTempsReel(), { auth: { token } });
    socket.on('notification', () => { refresh(); });

    return () => {
      clearInterval(timer);
      socket.close();
    };
  }, [token, userId, refresh]);

  const markRead = useCallback(
    async (id) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, lu: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      try {
        await notificationService.markRead(id);
      } catch {
        refresh();
      }
    },
    [refresh]
  );

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, lu: true })));
    setUnreadCount(0);
    try {
      await notificationService.markAllRead();
    } catch {
      refresh();
    }
  }, [refresh]);

  /* ------------------------- Toast API ---------------------------- */
  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (type, title, message, timeout = 5000) => {
      const t = makeToast(type, title, message);
      setToasts((prev) => [...prev, t]);
      if (timeout > 0) {
        setTimeout(() => dismiss(t.id), timeout);
      }
      return t.id;
    },
    [dismiss]
  );

  const toastSuccess = useCallback(
    (message, title = 'Succès') => toast('success', title, message),
    [toast]
  );
  const toastError = useCallback(
    (message, title = 'Erreur') => toast('error', title, message),
    [toast]
  );
  const toastInfo = useCallback(
    (message, title = 'Information') => toast('info', title, message),
    [toast]
  );

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      refresh,
      markRead,
      markAllRead,
      toasts,
      dismiss,
      toast,
      toastSuccess,
      toastError,
      toastInfo,
    }),
    [notifications, unreadCount, refresh, markRead, markAllRead, toasts, dismiss, toast, toastSuccess, toastError, toastInfo]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}