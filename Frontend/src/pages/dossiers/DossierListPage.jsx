import { useState, useEffect, useCallback } from 'react';
import { Inbox, Loader2, CheckCircle2, Layers, AlertTriangle, Clock, Archive, User, FolderKanban } from 'lucide-react';
import { DossierList } from '../../components/dossier/DossierList.jsx';
import { dashboardService } from '../../services/dashboardService.js';
import { useAuth } from '../../hooks/useAuth.js';

/** Rôles de pilotage : ils voient l'ensemble des divisions. */
const ROLES_GLOBAUX = [
  'ADMIN', 'CHEF_SERVICE', 'CHEF_BAAF', 'SECRETAIRE', 'COORDINATRICE',
];

/**
 * Ensembles de dossiers pour le tri par avancement.
 * Chaque groupe définit des filtres serveur : la liste ne charge que ce qui
 * est affiché. Le compteur est calculé sur les mêmes statuts (ou la même
 * règle) que le filtre, sinon l'onglet annoncerait un nombre que la liste
 * contredit.
 *
 * Couleurs : bleu = dossiers nouveaux / reçus (à traiter en priorité),
 * amber = en cours, emerald = terminés, red = urgents, slate = archivés.
 *
 * `actif` porte les classes complètes de l'onglet sélectionné. Elles sont
 * écrites en clair, jamais construites par concaténation : Tailwind analyse le
 * source de façon statique et n'engendrerait pas une classe fabriquée à
 * l'exécution (`bg-${couleur}-600`), laissant l'onglet actif sans fond.
 */
const GROUPES = [
  {
    code: 'NOUVEAUX', label: 'Nouveaux', icon: Inbox,
    actif: 'border-blue-600 bg-blue-600 shadow-[0_0_16px_rgba(37,99,235,0.35)]',
    hint: 'Reçus ou enregistrés, pas encore orientés',
    filters: { statut: 'RECU,ENREGISTRE' },
    compte: (c) => (c.RECU || 0) + (c.ENREGISTRE || 0),
  },
  {
    code: 'EN_COURS', label: 'En cours', icon: Clock,
    actif: 'border-amber-500 bg-amber-500 shadow-[0_0_16px_rgba(245,158,11,0.35)]',
    hint: 'Orientés, affectés ou en traitement',
    filters: { statut: 'EN_COURS' },
    compte: (c) =>
      (c.ORIENTE || 0) + (c.AFFECTE || 0) + (c.EN_TRAITEMENT || 0) +
      (c.SOUMIS_A_VERIFICATION || 0) + (c.CORRECTION_DEMANDEE || 0),
  },
  {
    code: 'TERMINES', label: 'Terminés', icon: CheckCircle2,
    actif: 'border-emerald-600 bg-emerald-600 shadow-[0_0_16px_rgba(16,185,129,0.35)]',
    hint: 'Validés, signés, clôturés ou archivés',
    filters: { statut: 'TERMINES' },
    compte: (c) =>
      (c.VALIDE || 0) + (c.SIGNE || 0) + (c.CLOTURE || 0) + (c.ARCHIVE || 0),
  },
  {
    code: 'URGENTS', label: 'Urgents', icon: AlertTriangle,
    actif: 'border-red-600 bg-red-600 shadow-[0_0_16px_rgba(239,68,68,0.35)]',
    hint: 'Priorité haute ou urgente',
    filters: { priorite_haute: 1 },
    compte: (c) => c.prioritaires || 0,
  },
  {
    code: 'ARCHIVES', label: 'Archivés', icon: Archive,
    actif: 'border-slate-700 bg-slate-700 shadow-[0_0_16px_rgba(71,85,105,0.35)]',
    hint: 'Dossiers archivés',
    filters: { statut: 'ARCHIVE' },
    compte: (c) => c.ARCHIVE || 0,
  },
];

export function DossierListPage() {
  const { user, hasPermission } = useAuth();
  const [groupe, setGroupe] = useState('NOUVEAUX');
  const [compteurs, setCompteurs] = useState(null);
  const [chargement, setChargement] = useState(true);

  const roleNom = user?.role_nom || '';
  const global = ROLES_GLOBAUX.includes(roleNom);
  const typeFiltre = !global && user?.type_code ? user.type_code : null;

  // Détecte si l'utilisateur est un agent restreint à ses propres dossiers
  const agentPersonnel = hasPermission('view_assigned_dossiers') && !hasPermission('view_all_dossiers');

  const chargerCompteurs = useCallback(async () => {
    setChargement(true);
    try {
      const s = await dashboardService.summary();
      setCompteurs(s || null);
    } catch {
      setCompteurs(null);
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => { Promise.resolve().then(chargerCompteurs); }, [chargerCompteurs]);

  const compte = (g) =>
    compteurs && typeof g.compte === 'function' ? g.compte(compteurs) : null;

  const groupeActif = GROUPES.find((g) => g.code === groupe);
  const baseFilters = {
    ...(typeFiltre ? { type: typeFiltre } : {}),
    ...(groupeActif?.filters || {}),
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Dossiers</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {agentPersonnel
            ? 'Vos dossiers personnels — vous ne voyez que ceux dont vous êtes responsable.'
            : typeFiltre
              ? 'Dossiers de votre division, répartis par avancement.'
              : 'Répartition par avancement du traitement.'}
        </p>
      </div>

      {/* Badge d'isolement pour les agents : ils ne voient que leurs dossiers */}
      {agentPersonnel && (
        <div className="rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-800 flex items-center gap-2 dark:border-sky-900/30 dark:bg-sky-900/20 dark:text-sky-300">
          <User className="h-4 w-4 shrink-0" />
          <span>Tableau personnel : vous consultez uniquement vos propres dossiers.</span>
        </div>
      )}

      {/* Séparation des dossiers : un ensemble affiché à la fois. */}
      <div className="flex flex-wrap gap-2">
        {GROUPES.filter((g) => !g.roles || g.roles.includes(roleNom)).map((g) => {
          const Icon = g.icon;
          const actif = groupe === g.code;
          const n = compte(g);
          return (
            <button
              key={g.code}
              type="button"
              onClick={() => setGroupe(g.code)}
              className={`flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors duration-200 motion-reduce:transition-none ${actif
                ? `text-white ${g.actif}`
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-700'}`}
            >
              <Icon className={`h-4 w-4 ${actif ? 'text-white' : ''}`} />
              <span className="flex flex-col items-start leading-tight">
                {g.label}
                {g.hint && (
                  <span className={`text-[10px] font-normal ${actif ? 'text-white/80' : 'text-slate-400'}`}>
                    {g.hint}
                  </span>
                )}
              </span>
              {chargement ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : n !== null ? (
                <span className={`rounded-full px-1.5 text-xs font-semibold ${actif ? 'bg-white/20' : 'bg-slate-100 text-slate-600'}`}>
                  {n}
                </span>
              ) : null}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => setGroupe('')}
          className={`flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors duration-200 motion-reduce:transition-none ${groupe === ''
            ? 'border-slate-700 bg-slate-700 text-white shadow-[0_0_15px_rgba(74,85,99,0.3)]'
            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-700'}`}
          title="Tous les dossiers"
        >
          <Layers className="h-4 w-4" />
          <span className="flex flex-col items-start leading-tight">
            Tous
            <span className="text-[10px] font-normal text-slate-400 dark:text-slate-400">Tous les statuts</span>
          </span>
          {compteurs && !chargement && (
            <span className={`rounded-full px-1.5 text-xs font-semibold ${groupe === '' ? 'bg-white/20' : 'bg-slate-100 text-slate-600'}`}>
              {compteurs.total ?? 0}
            </span>
          )}
        </button>
      </div>

      {chargement ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center animate-spin-slow shadow-lg shadow-blue-500/40">
              <FolderKanban className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Chargement des dossiers…
            </p>
          </div>
        </div>
      ) : (
        <DossierList
          key={`${typeFiltre || 'all'}-${groupe}`}
          baseFilters={baseFilters}
          agentPersonnel={agentPersonnel}
        />
      )}
    </div>
  );
}

export default DossierListPage;