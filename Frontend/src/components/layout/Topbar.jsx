import { Link, useNavigate } from 'react-router-dom';
import { Menu, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { NotificationBell } from '../notification/NotificationBell.jsx';

/** Barre supérieure : cloche de notifications + menu utilisateur. */
export function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <button
            className="rounded-md p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/" className="text-sm font-semibold text-slate-700 lg:hidden">
            SRSP Fitovinany
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <NotificationBell />
          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-slate-100"
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

      {/* Menu mobile simple */}
      {sidebarOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 lg:hidden">
          <nav className="grid grid-cols-2 gap-2 text-sm">
            <Link to="/" className="rounded px-2 py-1.5 text-slate-600 hover:bg-slate-50">Tableau de bord</Link>
            <Link to="/dossiers" className="rounded px-2 py-1.5 text-slate-600 hover:bg-slate-50">Dossiers</Link>
            <Link to="/courriers" className="rounded px-2 py-1.5 text-slate-600 hover:bg-slate-50">Courriers</Link>
            <Link to="/historique" className="rounded px-2 py-1.5 text-slate-600 hover:bg-slate-50">Historique</Link>
            <Link to="/archives" className="rounded px-2 py-1.5 text-slate-600 hover:bg-slate-50">Archives</Link>
            <Link to="/rapports" className="rounded px-2 py-1.5 text-slate-600 hover:bg-slate-50">Rapports</Link>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Topbar;