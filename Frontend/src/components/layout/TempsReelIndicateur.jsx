import { WifiOff } from 'lucide-react';
import { useTempsReel } from '../../hooks/useTempsReel.js';
import { ETATS_TEMPS_REEL } from '../../contexts/TempsReelContext.jsx';

/**
 * Indicateur de l'état du canal temps réel.
 *
 * Un temps réel qui se dégrade en silence est pire que pas de temps réel :
 * l'agent croit que l'écran est à jour alors qu'il ne l'est pas, et prend
 * une décision sur une information périmée. L'état est donc **affiché** —
 * discreet, mais visible, et explicite dans son infobulle.
 *
 * Le point est vert quand le canal est établi, ambre pendant la connexion,
 * gris quand il est coupé. L'icône n'apparaît que hors connexion : en
 * régime établi, un pictogramme permanent n'ajouterait que du bruit.
 */
export function TempsReelIndicateur() {
  const { statut } = useTempsReel();

  if (statut === ETATS_TEMPS_REEL.CONNECTE) {
    return (
      <span
        className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-emerald-700"
        title="Mise à jour en temps réel : les écrans se rafraîchissent dès qu’un dossier change."
        role="status"
        aria-label="Canal temps réel actif"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 motion-safe:animate-pulse" />
        <span className="hidden md:inline">Temps réel</span>
      </span>
    );
  }

  if (statut === ETATS_TEMPS_REEL.CONNEXION) {
    return (
      <span
        className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-amber-700"
        title="Connexion au canal temps réel…"
        role="status"
        aria-label="Connexion au canal temps réel"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 motion-safe:animate-pulse" />
        <span className="hidden md:inline">Connexion…</span>
      </span>
    );
  }

  return (
    <span
      className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-slate-500"
      title="Canal temps réel coupé : les données peuvent être périmées. Actualisez la page si nécessaire."
      role="status"
      aria-label="Canal temps réel hors ligne"
    >
      <WifiOff className="h-3.5 w-3.5" />
      <span className="hidden md:inline">Hors ligne</span>
    </span>
  );
}

export default TempsReelIndicateur;
