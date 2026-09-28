import { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Modale accessible : fermeture par Échap, clic sur le fond ou bouton X.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const widths = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-4xl', xl: 'max-w-6xl' };

  return (
    /* Sur téléphone, la modale se colle en bas de l'écran plutôt que d'être
       centrée : centrée, elle est rognée en haut et en bas sur un petit
       écran, et le bouton de fermeture se retrouve hors de portée du pouce. */
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`flex max-h-[92dvh] w-full flex-col overflow-hidden bg-white shadow-xl
          rounded-t-2xl sm:max-h-[90vh] sm:rounded-lg ${widths[size] || widths.md}`}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-5">
          {/* min-w-0 : un long titre doit pouvoir passer à la ligne au lieu de
              pousser le bouton de fermeture hors de la modale. */}
          <h3 className="min-w-0 flex-1 text-base font-semibold text-slate-800">{title}</h3>
          <button
            onClick={onClose}
            className="-mr-1 shrink-0 rounded p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">{children}</div>
        {footer && (
          /* flex-wrap : sur un écran étroit, deux boutons côte à côte débordent.
             Ils passent donc à la ligne, pleine largeur, faciles à viser. */
          <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3 sm:px-5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;