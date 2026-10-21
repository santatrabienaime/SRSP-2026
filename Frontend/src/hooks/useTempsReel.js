import { useContext } from 'react';
import { TempsReelContext } from '../contexts/TempsReelContext.jsx';

/**
 * Accès au canal temps réel.
 *
 * Deux usages :
 *   - `const { etat, statut } = useTempsReel()` pour afficher l'état de la
 *     connexion ;
 *   - `useTempsReel('dossier', callback)` pour s'abonner à un type d'événement.
 */
export function useTempsReel() {
  const ctx = useContext(TempsReelContext);
  if (!ctx) throw new Error('useTempsReel doit être utilisé dans TempsReelProvider.');
  return ctx;
}

export default useTempsReel;
