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
  const [barreRepliee, setBarreRepliee] = useState(() => lire(CLE_BARRE, '0') === '1');

  useEffect(() => {
    const sombre = theme === 'sombre';
    document.documentElement.classList.toggle('dark', sombre);
    document.documentElement.style.colorScheme = sombre ? 'dark' : 'light';
    ecrire(CLE_THEME, theme);
  }, [theme]);

  useEffect(() => { ecrire(CLE_BARRE, barreRepliee ? '1' : '0'); }, [barreRepliee]);

  const basculerTheme = useCallback(() => {
    setTheme((t) => (t === 'sombre' ? 'clair' : 'sombre'));
  }, []);

  const basculerBarre = useCallback(() => {
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
