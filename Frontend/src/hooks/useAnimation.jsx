/**
 * useAnimation — Hook pour animer l'entrée des éléments au montage.
 *
 * Retourne :
 *  - isMounted : booléen, passe à true après le premier rendu
 *  - animationClass : chaîne de classes Tailwind pour l'animation
 *
 * Utilisation :
 *   const { isMounted, animationClass } = useAnimation({ delay: 200 });
 *   if (!isMounted) return null;
 *   return <div className={animationClass}>...</div>;
 */
import { useState, useEffect } from 'react';

export function useAnimation({ delay = 0, type = 'slide-in-up' } = {}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const animationClass = `animate-${type} delay-${Math.floor(delay / 100) * 100}`;

  return { isMounted, animationClass };
}

export default useAnimation;