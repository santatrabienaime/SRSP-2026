import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext.jsx';

/** Accès pratique au contexte d'authentification. */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé sous <AuthProvider>.');
  return ctx;
}

export default useAuth;