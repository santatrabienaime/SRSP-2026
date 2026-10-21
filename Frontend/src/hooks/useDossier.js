import { useState, useCallback, useEffect } from 'react';
import { dossierService } from '../services/dossierService.js';

/** Chargement d'un dossier + actions workflow courantes (orienter, affecter, ...). */
export function useDossier(id) {
  const [dossier, setDossier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async (options = {}) => {
    if (!id) return;
    /* Un rechargement à chaud ne doit pas faire clignoter la fiche : le
       dossier reste affiché pendant la recharge. */
    const silencieux = Boolean(options.silencieux);
    if (!silencieux) setLoading(true);
    setError(null);
    try {
      const data = await dossierService.get(id);
      setDossier(data);
    } catch (e) {
      if (!silencieux) setError(e);
    } finally {
      if (!silencieux) setLoading(false);
    }
  }, [id]);

  // Chargement initial : sans cet effet, la page détail reste bloquée sur
  // « Chargement du dossier… » (default export toujours appellable).
  useEffect(() => {
    Promise.resolve().then(load);
  }, [load]);

  const refresh = useCallback(async () => {
    await load();
  }, [load]);

  /** Rechargement discret : la fiche reste à l'écran pendant la recharge. */
  const recharger = useCallback(async () => {
    await load({ silencieux: true });
  }, [load]);

  /** Exécute une action workflow puis recharge le dossier. */
  const runAction = useCallback(
    async (action, payload = {}) => {
      if (!dossier) return;
      setSubmitting(true);
      try {
        const fn =
          typeof action === 'function' ? action : dossierService[action];
        await fn(dossier.id, payload);
        await load();
        return true;
      } catch (e) {
        setError(e);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [dossier, load]
  );

  return { dossier, loading, error, submitting, refresh, recharger, runAction };
}

export default useDossier;