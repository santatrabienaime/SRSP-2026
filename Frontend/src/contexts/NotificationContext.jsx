import { createContext, useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { notificationService } from '../services/notificationService.js';
import { useAuth } from '../hooks/useAuth.js';
import { useTempsReel } from '../hooks/useTempsReel.js';
import { ETATS_TEMPS_REEL } from './TempsReelContext.jsx';

export const NotificationContext = createContext(null);

/* Intervalle de repli quand le canal temps réel est coupé.
   Le canal.push est le mode normal ; le sondage ne sert qu'à rattraper ce
   qui a pu être manqué pendant une coupure. */
const POLL_REPLI = 30000; // 30 s
/* Quand le canal est établi, le sondage n'a plus d'objet : il passe à une
   cadence large, purement comme filet de sécurité. */
const POLL_FILET = 300000; // 5 min

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
  const { statut, abonner } = useTempsReel();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const timersRef = useRef(new Set());
  useEffect(() => () => {
    for (const id of timersRef.current) clearTimeout(id);
    timersRef.current.clear();
  }, []);
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
  }, [token, refresh]);

  /* Temps réel : le serveur pousse un signal sur le canal privé de
     l'utilisateur dès qu'une notification lui est destinée. Le canal ne
     transporte que l'alerte — la liste et le compteur restent relus depuis
     l'API, qui seule fait foi. */
  useEffect(() => {
    if (!token) return undefined;
    return abonner('notification', () => { refresh(); });
  }, [token, abonner, refresh]);

  /* Sondage de repli. Sa cadence dépend de l'état du canal : quand celui-ci
     est établi, le sondage n'a plus d'objet et passe au large ; quand il est
     coupé, il reprend son rythme normal, pour ne rien laisser passer
     pendant la coupure. */
  useEffect(() => {
    if (!token) return undefined;
    const interval = statut === ETATS_TEMPS_REEL.CONNECTE ? POLL_FILET : POLL_REPLI;
    const timer = setInterval(refresh, interval);
    return () => clearInterval(timer);
  }, [token, statut, refresh]);

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