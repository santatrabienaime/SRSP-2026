import { createContext, useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth.js';
import { API_BASE } from '../config/constants.js';

export const TempsReelContext = createContext(null);

/**
 * Canal temps réel.
 *
 * Le serveur pousse deux signaux : `notification` (une alerte est adressée à
 * cet utilisateur) et `dossier` (un dossier qu'il suit a changé d'état). Le
 * canal ne transporte **que l'alerte** — identifiant et statut. La donnée
 * affichée est toujours relue depuis l'API, qui seule fait foi : le canal ne
 * devient jamais une source de vérité.
 *
 * Le socket est ici, et non dans le contexte des notifications, parce qu'il
 * sert à tout l'application : le tableau de bord, la boîte de travail et la
 * liste des dossiers s'y abonnent. Un socket par écran serait plusieurs
 * canaux ouverts pour la même personne.
 *
 * L'état de la connexion est **visible** : un temps réel qui se dégrade en
 * silence laisse croire que l'écran est à jour alors qu'il ne l'est plus.
 */

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

/** États possibles du canal, et leur traduction pour l'écran. */
export const ETATS_TEMPS_REEL = {
  HORS_LIGNE: 'hors-ligne',
  CONNEXION: 'connexion',
  CONNECTE: 'connecte',
  DECONNECTE: 'deconnecte',
};

export function TempsReelProvider({ children }) {
  const { token } = useAuth();
  const [statut, setStatut] = useState(ETATS_TEMPS_REEL.HORS_LIGNE);
  const socketRef = useRef(null);
  /* Abonnés par type d'événement. Un `Set` par type : l'abonnement et le
     désabonnement sont immédiats, et un composant démonté ne laisse pas
     d'écouteur orphelin. */
  const abonnesRef = useRef(new Map());

  /** Abonne un écouteur à un type d'événement. Renvoie la fonction de
      désabonnement. */
  const abonner = useCallback((evenement, callback) => {
    if (!evenement || typeof callback !== 'function') return () => {};
    if (!abonnesRef.current.has(evenement)) abonnesRef.current.set(evenement, new Set());
    abonnesRef.current.get(evenement).add(callback);
    return () => {
      const set = abonnesRef.current.get(evenement);
      if (!set) return;
      set.delete(callback);
      if (!set.size) abonnesRef.current.delete(evenement);
    };
  }, []);

  /** Déclenche les écouteurs d'un type d'événement. */
  const emettre = useCallback((evenement, charge) => {
    const set = abonnesRef.current.get(evenement);
    if (!set) return;
    for (const callback of set) {
      try {
        callback(charge);
      } catch (e) {
        // Un écouteur défaillant ne doit pas empêcher les autres d'être servis.
        console.warn(`[temps réel] écouteur « ${evenement} » en défaut :`, e.message);
      }
    }
  }, []);

  useEffect(() => {
    if (!token) {
      setStatut(ETATS_TEMPS_REEL.HORS_LIGNE);
      return undefined;
    }

    setStatut(ETATS_TEMPS_REEL.CONNEXION);
    const socket = io(origineTempsReel(), {
      auth: { token },
      /* Reconnexion automatique : le réseau d'un poste de travail tombe
         sans arrêt. Sans cela, le temps réel resterait muet jusqu'au
         rechargement de la page. */
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      reconnectionAttempts: Infinity,
      timeout: 10000,
    });
    socketRef.current = socket;

    socket.on('connect', () => setStatut(ETATS_TEMPS_REEL.CONNECTE));
    socket.on('disconnect', () => setStatut(ETATS_TEMPS_REEL.DECONNECTE));
    socket.on('connect_error', () => setStatut(ETATS_TEMPS_REEL.DECONNECTE));
    socket.on('canal', () => setStatut(ETATS_TEMPS_REEL.CONNECTE));

    socket.onAny((evenement, charge) => emettre(evenement, charge));

    return () => {
      socket.removeAllListeners();
      socket.close();
      socketRef.current = null;
      setStatut(ETATS_TEMPS_REEL.HORS_LIGNE);
    };
  }, [token, emettre]);

  const value = useMemo(
    () => ({ statut, etat: statut === ETATS_TEMPS_REEL.CONNECTE, abonner }),
    [statut, abonner]
  );

  return <TempsReelContext.Provider value={value}>{children}</TempsReelContext.Provider>;
}

export default TempsReelProvider;
