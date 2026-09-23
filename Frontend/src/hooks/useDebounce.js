import { useState, useEffect } from 'react';

/** Retourne une valeur stabilisée après un délai (utile pour les recherches). */
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default useDebounce;