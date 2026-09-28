import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

/**
 * Préférences d'affichage : thème clair/sombre et repli de la barre latérale.
 *
 * Les deux sont conservées dans le navigateur : un choix d'affichage fait
 * sciemment ne doit pas être perdu au changement de page, et encore moins à
 * chaque connexion. Le thème est aussi appliqué sur <html> par le script
 * d'index.html AVANT le premier rendu, pour éviter un éclair blanc.
 */

const CLE_THEME = 'srsp_theme';
const CLE_BARRE = 'srsp_sidebar';

const UIContext = createContext(null);

/** Lecture sûre : un localStorage inaccessible ne doit pas casser l'application. */
function lire(cle, defaut) {
  try {
    const v = window.localStorage.getItem(cle);
    return v === null ? defaut : v;
  } catch {
    return defaut;
  }
}

function ecrire(cle, valeur) {
  try {
    window.localStorage.setItem(cle, valeur);
  } catch {
    /* stockage indisponible : la préférence ne sera pas conservée */
  }
}

/** Thème effectif au premier rendu, en tenant compte du choix ou du système. */
export function themeInitial() {
  const enregistre = lire(CLE_THEME, null);
  if (enregistre === 'clair' || enregistre === 'sombre') return enregistre;
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    return 'sombre';
  }
  return 'clair';
}

export function UIProvider({ children }) {
  // Le thème est initialisé depuis la valeur déjà posée sur <html> par le
  // script d'index.html : pas d'incohérence au premier rendu.
  const [theme, setTheme] = useState(() => {
    if (typeof document !== 'undefined' && document.documentElement.classList.contains('dark')) {
      return 'sombre';
    }
    return themeInitial();
  });

  /* Réactivité : sur un écran étroit, la barre latérale se replie d'elle-même
     en rail d'icônes, sans quoi elle laisserait au contenu une largeur
     inexploitable. Ce comportement automatique ne s'applique QUE si
     l'utilisateur n'a jamais fait de choix : dès qu'il clique, sa décision
     fait foi et n'est plus remise en cause par un redimensionnement. */
  const [choixExplicite, setChoixExplicite] = useState(() => lire(CLE_BARRE, null) !== null);
  const [barreRepliee, setBarreRepliee] = useState(() => {
    const memorise = lire(CLE_BARRE, null);
    if (memorise !== null) return memorise === '1';
    return typeof window !== 'undefined' && window.innerWidth < 1024;
  });

  useEffect(() => {
    if (choixExplicite || typeof window === 'undefined') return undefined;
    const appliquer = () => setBarreRepliee(window.innerWidth < 1024);
    appliquer();
    window.addEventListener('resize', appliquer);
    return () => window.removeEventListener('resize', appliquer);
  }, [choixExplicite]);

  // La préférence n'est mémorisée qu'à partir du moment où l'utilisateur a
  // réellement cliqué : sinon un simple redimensionnement figerait un choix
  // qu'il n'a jamais fait.
  useEffect(() => {
    if (!choixExplicite) return;
    ecrire(CLE_BARRE, barreRepliee ? '1' : '0');
  }, [barreRepliee, choixExplicite]);

  useEffect(() => {
    const sombre = theme === 'sombre';
    document.documentElement.classList.toggle('dark', sombre);
    document.documentElement.style.colorScheme = sombre ? 'dark' : 'light';
    ecrire(CLE_THEME, theme);
  }, [theme]);

  const basculerTheme = useCallback(() => {
    setTheme((t) => (t === 'sombre' ? 'clair' : 'sombre'));
  }, []);

  const basculerBarre = useCallback(() => {
    setChoixExplicite(true);
    setBarreRepliee((v) => !v);
  }, []);

  const valeur = useMemo(
    () => ({
      theme,
      estSombre: theme === 'sombre',
      basculerTheme,
      // Utile pour l'écran de connexion, dont le fond est toujours sombre.
      setTheme,
      barreRepliee,
      basculerBarre,
    }),
    [theme, basculerTheme, barreRepliee, basculerBarre]
  );

  return <UIContext.Provider value={valeur}>{children}</UIContext.Provider>;
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI doit être utilisé dans UIProvider.');
  return ctx;
}

export default UIContext;
