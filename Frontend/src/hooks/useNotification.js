import { useContext } from 'react';
import { NotificationContext } from '../contexts/NotificationContext.jsx';

/** Accès pratique au contexte de notifications (cloche + toasts). */
export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification doit être utilisé sous <NotificationProvider>.');
  return ctx;
}

export default useNotification;