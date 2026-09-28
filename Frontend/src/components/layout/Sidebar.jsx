import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, FolderKanban, FileText, Mail, History, Archive,
  BarChart3, FileBarChart2, Settings, Users, Shield, Bell,
  UserCog, Building2, ScrollText, PanelLeftClose, PanelLeftOpen,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useUI } from '../../contexts/UIContext.jsx';

const ICONS = {
  dashboard: LayoutDashboard,
  dossiers: FolderKanban,
  documents: FileText,
  courriers: Mail,
  notifications: Bell,
  historique: History,
  archives: Archive,
  statistiques: BarChart3,
  rapports: FileBarChart2,
  users: Users,
  roles: Shield,
  settings: Settings,
  personnel: UserCog,
  divisions: Building2,
  audit: ScrollText,
};

/**
 * Barre latérale conforme à la matrice d'accès §14.1 :
 * chaque entrée est masquée si l'utilisateur n'a pas (au moins) une
 * permission requise — ou un rôle autorisé.
 */
export function Sidebar() {
  const { user, hasAnyPermission, isRole } = useAuth();
  const { barreRepliee, basculerBarre } = useUI();

  const adminOnly = isRole('ADMIN');
  // Un utilisateur rattaché à une division (chef de division, agent) dispose
  // d'un accès direct à SA division, qui ne montre que les dossiers de ce type.
  const myDivision = user?.division_code || null;
  const show = (opts = {}) => {
    if (opts.roles && !isRole(...opts.roles)) return false;
    if (opts.perms && !hasAnyPermission(opts.perms)) return false;
    return true;
  };

  const sections = [
    {
      label: 'Pilotage',
      items: [
        { to: '/', label: 'Tableau de bord', icon: 'dashboard', end: true },
        myDivision
          ? {
              to: `/divisions/${myDivision}/dossiers`,
              // Le menu nomme la division : un chef de division doit voir en
              // permanence de quelle division il s'agit, pas « Ma division ».
              label: `Dossiers ${user?.division_nom?.replace(/^Division /, '') || myDivision}`,
              icon: 'dossiers',
            }
          : { to: '/dossiers', label: 'Dossiers', icon: 'dossiers' },
        { to: '/courriers', label: 'Courriers', icon: 'courriers', perms: ['manage_courriers'] },
      ],
    },
    {
      label: 'Suivi',
      items: [
        { to: '/notifications', label: 'Notifications', icon: 'notifications' },
        { to: '/historique', label: 'Historique', icon: 'historique' },
        { to: '/archives', label: 'Archives', icon: 'archives', roles: ['ADMIN', 'CHEF_SERVICE'], perms: ['archiver_dossier'] },
        { to: '/statistiques', label: 'Statistiques', icon: 'statistiques', perms: ['view_stats'] },
        { to: '/rapports', label: 'Rapports', icon: 'rapports', perms: ['view_stats', 'consolidate_reports', 'export_data'] },
      ],
    },
  ];

  if (adminOnly || hasAnyPermission(['manage_users', 'manage_roles', 'view_audit', 'manage_personnel', 'manage_divisions'])) {
    sections.push({
      label: 'Administration',
      items: [
        ...(show({ perms: ['manage_users'] })
          ? [{ to: '/administration/utilisateurs', label: 'Utilisateurs', icon: 'users' }]
          : []),
        ...(show({ perms: ['manage_roles'] })
          ? [{ to: '/administration/roles', label: 'Rôles & permissions', icon: 'roles' }]
          : []),
        ...(show({ perms: ['view_audit'] })
          ? [{ to: '/administration/audit', label: "Journal d'audit", icon: 'audit' }]
          : []),
        ...(show({ perms: ['manage_personnel'] })
          ? [{ to: '/agents', label: 'Personnel (agents)', icon: 'personnel' }]
          : []),
        ...(show({ perms: ['manage_divisions'] })
          ? [{ to: '/divisions', label: 'Divisions', icon: 'divisions' }]
          : []),
        ...(show({ roles: ['ADMIN'], perms: ['system_config'] })
          ? [{ to: '/administration/parametres', label: 'Paramètres', icon: 'settings' }]
          : []),
      ],
    });
  }

  return (
    /* La barre reste à gauche sur TOUTE largeur d'écran : elle n'est plus
       masquée sous lg. Repliée, elle devient un rail d'icônes, ce qui laisse
       de la place au contenu sur un petit écran sans jamais le recouvrir. */
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-slate-200 bg-white
        transition-[width] duration-300 ease-out motion-reduce:transition-none
        ${barreRepliee ? 'w-[4.5rem]' : 'w-64'}`}
    >
      <div className={`flex items-center border-b border-slate-200 ${barreRepliee ? 'justify-center px-2 py-4' : 'gap-3 px-5 py-4'}`}>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-600 text-lg font-bold text-white">
          S
        </div>
        {!barreRepliee && (
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-800">SRSP Fitovinany</p>
            <p className="truncate text-[11px] text-slate-400">Suivi des dossiers</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto overflow-x-hidden px-3 py-4">
        {sections.map((section) => (
          <div key={section.label}>
            {barreRepliee ? (
              <div className="mx-auto my-2 h-px w-6 bg-slate-200" aria-hidden="true" />
            ) : (
              <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {section.label}
              </p>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => {
                if (!show(item)) return null;
                const Icon = ICONS[item.icon] || LayoutDashboard;
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      /* Repliée, l'intitulé devient une infobulle : sans elle,
                         la seule icône ne dit pas où mène le lien. */
                      title={barreRepliee ? item.label : undefined}
                      className={({ isActive }) =>
                        `flex items-center rounded-md text-sm font-medium transition-colors
                          ${barreRepliee ? 'justify-center px-2 py-2' : 'gap-3 px-3 py-2'}
                          ${isActive
                            ? 'bg-primary-50 text-primary-700'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                          }`
                      }
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {!barreRepliee && <span className="truncate">{item.label}</span>}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Rappel du périmètre de l'utilisateur.
          Le profil et la déconnexion sont centralisés dans la barre supérieure
          (Topbar) : pas de doublon d'actions entre les deux barres. */}
      <div className="border-t border-slate-200 p-3">
        {!barreRepliee && (
          <p className="px-2 text-[11px] leading-relaxed text-slate-400">
            {user?.role_nom === 'ADMIN' || user?.role_nom === 'CHEF_SERVICE'
              || user?.role_nom === 'CHEF_BAAF' || user?.role_nom === 'SECRETAIRE'
              || user?.role_nom === 'COORDINATRICE'
              ? 'Périmètre : toutes les divisions'
              : user?.division_nom
                ? `Périmètre : ${user.division_nom}`
                : 'Périmètre : vos dossiers'}
          </p>
        )}
        <button
          type="button"
          onClick={basculerBarre}
          className={`mt-1 flex w-full items-center rounded-md py-2 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 ${barreRepliee ? 'justify-center' : 'gap-2 px-2'}`}
          aria-label={barreRepliee ? 'Afficher la barre latérale' : 'Masquer la barre latérale'}
          aria-expanded={!barreRepliee}
        >
          {barreRepliee ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          {!barreRepliee && <span>Masquer le menu</span>}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;