import { Link, useNavigate } from 'react-router-dom';
import { Menu, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { NotificationBell } from '../notification/NotificationBell.jsx';

/** Barre supérieure : cloche de notifications + menu utilisateur. */
export function Topbar() {
  const { user, logout, hasAnyPermission } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Liens du menu mobile : uniquement ceux cui sont réellement accessibles.
  // Rien n'est proposé qui mènerait à une page vide ou à une redirection.
  const dossiersPath = user?.division_code
    ? `/divisions/${user.division_code}/dossiers`
    : '/dossiers';

  const liensMobile = [
    { to: '/', label: 'Tableau de bord' },
    { to: dossiersPath, label: user?.division_code ? 'Ma division' : 'Dossiers' },
    { to: '/courriers', label: 'Courriers', perms: ['manage_courriers'] },
    { to: '/historique', label: 'Historique' },
    { to: '/archives', label: 'Archives', perms: ['archiver_dossier'] },
    { to: '/rapports', label: 'Rapports', perms: ['view_stats', 'consolidate_reports', 'export_data'] },
  ].filter((l) => !l.perms || hasAnyPermission(l.perms));

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
            {liensMobile.map((l) => (
              <Link
                key={l.to + l.label}
                to={l.to}
                onClick={() => setSidebarOpen(false)}
                className="rounded px-2 py-1.5 text-slate-600 hover:bg-slate-50"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

export default Topbar;