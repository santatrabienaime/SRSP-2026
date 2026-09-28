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
       de la place au contenu sur un petit écran sans jamais le recouvrir.

       Fluidité : les libellés ne sont jamais démontés. Ils s'effacent et se
       replient sur place, pendant que la largeur de la barre s'anime. Si on
       les retirait du DOM, le contenu disparaîtrait d'un coup à la première
       image, alors que la largeur met 300 ms à se réduire : c'est exactement
       ce qui donne une animation saccadée. */
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex flex-col overflow-hidden border-r border-slate-200 bg-white
        transition-[width] duration-[350ms] ease-[cubic-bezier(.4,0,.2,1)]
        will-change-[width] motion-reduce:transition-none
        ${barreRepliee ? 'w-[4.5rem]' : 'w-64'}`}
    >
      <div className="flex shrink-0 items-center gap-3 border-b border-slate-200 px-4 py-3 pr-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-600 text-lg font-bold text-white">
          S
        </div>
        <div
          className={`min-w-0 flex-1 transition-[opacity,transform,max-width] duration-200 motion-reduce:transition-none ${
            barreRepliee
              ? 'pointer-events-none max-w-0 -translate-x-2 opacity-0'
              : 'max-w-[12rem] translate-x-0 opacity-100'
          }`}
        >
          <p className="truncate text-sm font-bold text-slate-800">SRSP Fitovinany</p>
          <p className="truncate text-[11px] text-slate-400">Suivi des dossiers</p>
        </div>
        {/* Le bouton de repli est en haut de la barre : c'est là que l'on
            regarde en premier, et il reste atteignable même quand la barre
            est réduite à son rail d'icônes. */}
        <button
          type="button"
          onClick={basculerBarre}
          className="shrink-0 rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
          aria-label={barreRepliee ? 'Afficher la barre latérale' : 'Masquer la barre latérale'}
          aria-expanded={!barreRepliee}
          title={barreRepliee ? 'Afficher le menu' : 'Masquer le menu'}
        >
          {barreRepliee ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto overflow-x-hidden px-3 py-4">
        {sections.map((section) => (
          <div key={section.label}>
            {/* Le titre de section se replie sur un filet : un simple
                changement d'élément, mais chacun apparaît et disparaît en
                fondu, donc rien ne « saute ». */}
            <div
              className={`overflow-hidden transition-[max-height,opacity] duration-200 motion-reduce:transition-none ${
                barreRepliee ? 'max-h-0 opacity-0' : 'max-h-8 opacity-100'
              }`}
              aria-hidden={barreRepliee}
            >
              <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {section.label}
              </p>
            </div>
            <div
              aria-hidden="true"
              className={`overflow-hidden transition-[max-height,opacity] duration-200 motion-reduce:transition-none ${
                barreRepliee ? 'my-2 max-h-px opacity-100' : 'my-0 max-h-0 opacity-0'
              }`}
            >
              <div className="mx-auto h-px w-6 bg-slate-200" />
            </div>
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
                        /* L'icône glisse avec la marge : transitioned, elle ne
                           saute pas d'un coup au centre du rail. */
                        `flex items-center rounded-md py-2 text-sm font-medium
                          transition-[padding,gap,background-color,color] duration-200
                          ease-[cubic-bezier(.4,0,.2,1)] motion-reduce:transition-none
                          ${barreRepliee ? 'gap-0 pl-[1.75rem] pr-0' : 'gap-3 pl-3 pr-3'}
                          ${isActive
                            ? 'bg-primary-50 text-primary-700'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                          }`
                      }
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span
                        className={`truncate transition-[opacity,transform,max-width] duration-200 motion-reduce:transition-none ${
                          barreRepliee
                            ? 'pointer-events-none max-w-0 -translate-x-1 opacity-0'
                            : 'max-w-[13rem] translate-x-0 opacity-100'
                        }`}
                      >
                        {item.label}
                      </span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Rappel du périmètre de l'utilisateur. Le repli se fait sur la
          hauteur (grid-rows 1fr -> 0fr) et non sur un démontage, pour que le
          bloc ne disparaisse pas d'un coup. */}
      <div
        className={`shrink-0 overflow-hidden border-t border-slate-200 transition-[grid-template-rows,opacity] duration-[350ms] ease-[cubic-bezier(.4,0,.2,1)] motion-reduce:transition-none ${
          barreRepliee ? 'grid grid-rows-[0fr] opacity-0' : 'grid grid-rows-[1fr] opacity-100'
        }`}
        aria-hidden={barreRepliee}
      >
        <div className="min-h-0 p-3">
          <p className="px-2 text-[11px] leading-relaxed text-slate-400">
            {user?.role_nom === 'ADMIN' || user?.role_nom === 'CHEF_SERVICE'
              || user?.role_nom === 'CHEF_BAAF' || user?.role_nom === 'SECRETAIRE'
              || user?.role_nom === 'COORDINATRICE'
              ? 'Périmètre : toutes les divisions'
              : user?.division_nom
                ? `Périmètre : ${user.division_nom}`
                : 'Périmètre : vos dossiers'}
          </p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;