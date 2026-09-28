import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, LogOut } from 'lucide-react';
import { useAuth } from './useAuth.js';
import { Button } from '../components/ui/Button.jsx';
import { Modal } from '../components/ui/Modal.jsx';

/**
 * Expiration de session pour inactivite (article 1.6 du rapport explicatif).
 *
 * - deconnexion automatique apres 30 minutes sans activite ;
 * - avertissement 2 minutes avant, avec possibilite de prolonger la session.
 * La minuterie est reinitialisee a chaque interaction (souris, clavier,
 * tactile) et au changement d'onglet.
 */

/** Duree d'inactivite avant deconnexion, en millisecondes. */
export const IDLE_TIMEOUT_MS = Number(
  (typeof window !== 'undefined' && window.__SRSP_IDLE_MS__) || 30 * 60 * 1000
);
/** Delai d'avertissement avant la deconnexion. */
export const IDLE_WARNING_MS = 2 * 60 * 1000;

export function IdleSessionGuard() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [avertir, setAvertir] = useState(false);
  const [reste, setReste] = useState(0);

  const timerAvertissement = useRef(null);
  const timerDeconnexion = useRef(null);
  const tick = useRef(null);

  const deconnecter = useCallback(async () => {
    clearTimeout(timerAvertissement.current);
    clearTimeout(timerDeconnexion.current);
    clearInterval(tick.current);
    setAvertir(false);
    if (token) {
      try {
        await logout();
      } catch {
        /* la deconnexion locale a lieu de toute facon */
      }
    }
    navigate('/login', { replace: true });
  }, [logout, navigate, token]);

  const replanifier = useCallback(() => {
    clearTimeout(timerAvertissement.current);
    clearTimeout(timerDeconnexion.current);
    clearInterval(tick.current);
    setAvertir(false);

    timerAvertissement.current = setTimeout(() => {
      setAvertir(true);
      // Compte a rebours affiche dans la fenetre d'avertissement.
      timerDeconnexion.current = setTimeout(deconnecter, IDLE_WARNING_MS);
      const debut = Date.now();
      tick.current = setInterval(() => {
        const ecoule = Date.now() - debut;
        setReste(Math.max(0, Math.ceil((IDLE_WARNING_MS - ecoule) / 1000)));
      }, 1000);
    }, Math.max(0, IDLE_TIMEOUT_MS - IDLE_WARNING_MS));
  }, [deconnecter]);

  useEffect(() => {
    if (!token) return undefined;

    const activite = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'wheel'];
    const surActivite = () => replanifier();
    const visibilite = () => {
      if (document.visibilityState === 'visible') replanifier();
    };

    replanifier();
    activite.forEach((e) => window.addEventListener(e, surActivite, { passive: true }));
    document.addEventListener('visibilitychange', visibilite);

    return () => {
      activite.forEach((e) => window.removeEventListener(e, surActivite));
      document.removeEventListener('visibilitychange', visibilite);
      clearTimeout(timerAvertissement.current);
      clearTimeout(timerDeconnexion.current);
      clearInterval(tick.current);
    };
  }, [token, replanifier]);

  if (!avertir) return null;

  const minutes = Math.floor(reste / 60);
  const secondes = reste % 60;

  return (
    <Modal open onClose={() => replanifier()} title="Votre session va se fermer">
      <div className="space-y-4">
        <p className="flex items-start gap-3 text-sm text-slate-700">
          <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
          <span>
            Par sécurité, vous serez déconnecté après une période d'inactivité.
            Il vous reste{' '}
            <strong className="tabular-nums">
              {minutes > 0 ? `${minutes} min ` : ''}
              {secondes} s
            </strong>
            .
          </span>
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={deconnecter}>
            <LogOut className="h-4 w-4" /> Se déconnecter
          </Button>
          <Button onClick={replanifier}>Rester connecté</Button>
        </div>
      </div>
    </Modal>
  );
}

export default IdleSessionGuard;
