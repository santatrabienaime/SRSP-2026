import { createContext, useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { notificationService } from '../services/notificationService.js';
import { useAuth } from '../hooks/useAuth.js';

export const NotificationContext = createContext(null);

const POLL_INTERVAL = 30000; // 30 s

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
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState([]);
  const lastFetch = useRef(0);

  const refresh = useCallback(async () => {
    if (!token) return;
    try {
      const list = await notificationService.list();
      setNotifications(Array.isArray(list) ? list : []);
      setUnreadCount(Array.isArray(list) ? list.filter((n) => !n.lu).length : 0);
      lastFetch.current = Date.now();
    } catch {
      /* garde l'état précédent */
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    refresh();
    const timer = setInterval(refresh, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [token, refresh]);

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