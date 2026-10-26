import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Récupération générique de données avec rechargement manuel.
 *   useApi(fetcher, [deps])
 * Retourne { data, loading, error, refetch }.
 * fetcher : () => Promise<any> (peut retourner null pour désactiver).
 *
 * Deux régimes, et la distinction est visible à l'écran :
 *
 *   - la **première charge** d'une ressource affiche un indicateur
 *     d'attente : il n'y a rien à montrer ;
 *   - un **rechargement** (déclenché par `refetch`, ou par le canal temps
 *     réel) garde les données présentes à l'écran et ne fait pas clignoter
 *     le panneau. Recharger une fiche pour y ajouter une ligne ne doit pas
 *     faire disparaître la fiche entière pendant une fraction de seconde.
 *
 * Le changement de ressource — un autre dossier, un autre identifiant — est
 * détecté par la comparaison des dépendances : c'est un nouveau chargement,
 * et l'indicateur d'attente doit alors revenir.
 */
export function useApi(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);

  /* Empreinte des dépendances : elle change quand la ressource change, et
     reste identique lors d'un simple rechargement. */
  const cle = JSON.stringify(deps);
  const cleRef = useRef(cle);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let active = true;
    const nouvelleRessource = cleRef.current !== cle;
    if (nouvelleRessource) cleRef.current = cle;

    if (nouvelleRessource) setLoading(true);
    setError(null);

    /* fetcher() sorti de Promise.resolve : une exception synchrone
       (validation, JSON.parse) doit passer par .catch, pas par un crash. */
    Promise.resolve().then(() => fetcher())
      .then((res) => {
        if (active) setData(res);
      })
      .catch((err) => {
        if (active) setError(err);
      })
      .finally(() => {
        if (active && nouvelleRessource) setLoading(false);
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cle, tick]);

  return { data, loading, error, refetch };
}

export default useApi;
