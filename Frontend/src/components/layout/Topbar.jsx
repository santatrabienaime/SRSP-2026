import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { useUI } from '../../contexts/UIContext.jsx';
import { NotificationBell } from '../notification/NotificationBell.jsx';

/**
 * Barre supérieure : thème, notifications et menu utilisateur.
 *
 * Le bouton de menu latéral a disparu : la barre latérale reste affichée à
 * gauche sur toutes les largeurs d'écran, son propre bouton de repli étant
 * placé en bas de celle-ci. Le tiroir mobile était donc un doublon.
 */
export function Topbar() {
  const { user, logout } = useAuth();
  const { estSombre, basculerTheme } = useUI();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      {/* La barre latérale occupe une partie de la largeur même repliée : le
          titre doit donc pouvoir se réduire, sinon il chasse les boutons hors
          de l'écran sur un téléphone. gap-1 et px-2 resserrent la barre. */}
      <div className="flex h-14 items-center justify-between gap-1.5 px-2 sm:gap-3 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="min-w-0 truncate text-sm font-semibold text-slate-700 lg:hidden"
        >
          SRSP Fitovinany
        </Link>
        <span className="hidden lg:block" />

        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1.5">
          <button
            type="button"
            onClick={basculerTheme}
            className="rounded-md p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
            aria-label={estSombre ? 'Passer en mode clair' : 'Passer en mode sombre'}
            title={estSombre ? 'Mode clair' : 'Mode sombre'}
          >
            {estSombre ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <NotificationBell />

          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-slate-100"
              aria-label="Menu du compte"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
                {(user?.username || 'U').charAt(0).toUpperCase()}
              </span>
              <span className="hidden text-left sm:block">
                <span className="block text-sm font-medium leading-tight text-slate-700">
                  {user?.email}
                </span>
                <span className="block text-xs leading-tight text-slate-400">
                  {user?.role_nom}
                </span>
              </span>
            </button>
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-md border border-slate-200 bg-white py-1 shadow-lg">
                  <Link
                    to="/profil"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                  >
                    <User className="h-4 w-4" /> Mon profil
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" /> Se déconnecter
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;