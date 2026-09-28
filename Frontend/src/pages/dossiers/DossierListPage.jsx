import { useState, useEffect, useCallback } from 'react';
import { Inbox, Loader2, CheckCircle2, Layers, AlertTriangle, UserCheck } from 'lucide-react';
import { DossierList } from '../../components/dossier/DossierList.jsx';
import { dashboardService } from '../../services/dashboardService.js';
import { useAuth } from '../../hooks/useAuth.js';
import { Spinner } from '../../components/ui/Spinner.jsx';

/** Rôles de pilotage : ils voient l'ensemble des divisions. */
const ROLES_GLOBAUX = [
  'ADMIN', 'CHEF_SERVICE', 'CHEF_BAAF', 'SECRETAIRE', 'COORDINATRICE',
];

/**
 * Les dossiers sont répartis en trois ensembles pour éviter une liste mélangée :
 *  - Nouveaux    : reçus ou enregistrés, pas encore orientés
 *  - En cours    : dossiers pas encore terminés (orientés à en traitement)
 *  - Terminés    : validés, signés, clôturés ou archivés
 * L'ensemble affiché est un filtre serveur : la liste ne charge jamais plus que
 * ce qui est affiché.
 */
const GROUPES = [
  {
    code: 'NOUVEAUX', label: 'Nouveaux', icon: Inbox,
    hint: 'Reçus il y a moins de 7 jours',
    // Article 2.1 : uniquement les dossiers reçus dans les sept derniers jours.
    filters: { recus_depuis_jours: 7, statut: 'RECU,ENREGISTRE' },
    statuts: ['RECU', 'ENREGISTRE'],
  },
  {
    // File d'attente du chef de division : le routage automatique y depose le
    // dossier, qui attend son affectation a un agent. VUE sur EN_COURS.
    code: 'A_AFFECTER', label: 'À affecter', icon: UserCheck,
    hint: 'Orientés, en attente d’affectation',
    filters: { statut: 'A_AFFECTER' },
    statuts: ['ENREGISTRE', 'ORIENTE'],
    // Reserve aux roles qui affectent un dossier a un agent. Les 13 noms de
    // roles sont explicites : ce tableau de boutons est statique, le
    // filtrage par permission n'y est pas disponible.
    roles: [
      'ADMIN', 'CHEF_SERVICE', 'CHEF_BAAF', 'COORDINATRICE',
      'CHEF_DIVISION_VISA', 'CHEF_DIVISION_SOLDE',
      'CHEF_DIVISION_PENSION', 'CHEF_DIVISION_SECOURS',
    ],
  },
  {
    code: 'EN_COURS', label: 'En cours', icon: Loader2,
    hint: 'Non terminés',
    filters: { statut: 'EN_COURS' },
    statuts: ['ORIENTE', 'AFFECTE', 'EN_TRAITEMENT', 'SOUMIS_A_VERIFICATION', 'CORRECTION_DEMANDEE'],
  },
  {
    code: 'URGENTS', label: 'Urgents', icon: AlertTriangle,
    hint: 'Priorité haute/urgente ou échéance dépassée',
    // Article 2.4
    filters: { priorite_haute: 1 },
    statuts: null,
  },
  { code: 'TERMINES', label: 'Terminés', icon: CheckCircle2, filters: { statut: 'TERMINES' },
    statuts: ['VALIDE', 'SIGNE', 'CLOTURE', 'ARCHIVE'] },
];

export function DossierListPage() {
  const { user } = useAuth();
  const [groupe, setGroupe] = useState('EN_COURS');
  const [compteurs, setCompteurs] = useState(null);
  const [chargement, setChargement] = useState(true);

  const roleNom = user?.role_nom || '';
  const global = ROLES_GLOBAUX.includes(roleNom);
  const typeFiltre = !global && user?.type_code ? user.type_code : null;

  const chargerCompteurs = useCallback(async () => {
    setChargement(true);
    try {
      // Le resume est deja limite au perimetre de l'utilisateur.
      const s = await dashboardService.summary();
      setCompteurs(s || null);
    } catch {
      setCompteurs(null);
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => { chargerCompteurs(); }, [chargerCompteurs]);

  const compte = (statuts) =>
    (compteurs && statuts && statuts.reduce((n, c) => n + (compteurs[c] || 0), 0)) ?? null;

  const baseFilters = {
    ...(typeFiltre ? { type: typeFiltre } : {}),
    ...(GROUPES.find((g) => g.code === groupe)?.filters || {}),
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Dossiers</h1>
        <p className="text-sm text-slate-500">
          {typeFiltre
            ? 'Dossiers de votre division, répartis par avancement.'
            : 'Répartition par avancement du traitement.'}
        </p>
      </div>

      {/* Séparation des dossiers : un ensemble affiché à la fois. */}
      <div className="flex flex-wrap gap-2">
        {GROUPES.filter((g) => !g.roles || g.roles.includes(roleNom)).map((g) => {
          const Icon = g.icon;
          const actif = groupe === g.code;
          const n = compte(g.statuts);
          return (
            <button
              key={g.code}
              type="button"
              onClick={() => setGroupe(g.code)}
              className={`flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition-[transform,box-shadow,background-color,border-color] duration-200 ease-out motion-reduce:transform-none motion-reduce:transition-none hover:-translate-y-0.5 hover:shadow-sm ${
                actif
                  ? 'border-primary-600 bg-primary-600 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="flex flex-col items-start leading-tight">
                {g.label}
                {g.hint && (
                  <span
                    className={`text-[10px] font-normal ${
                      actif ? 'text-white/80' : 'text-slate-400'
                    }`}
                  >
                    {g.hint}
                  </span>
                )}
              </span>
              {chargement ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : n !== null ? (
                <span
                  className={`rounded-full px-1.5 text-xs font-semibold ${
                    actif ? 'bg-white/20' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {n}
                </span>
              ) : null}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => setGroupe('')}
          className={`flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition-[transform,box-shadow,background-color,border-color] duration-200 ease-out motion-reduce:transform-none motion-reduce:transition-none hover:-translate-y-0.5 hover:shadow-sm ${
            groupe === ''
              ? 'border-slate-700 bg-slate-700 text-white'
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <Layers className="h-4 w-4" />
          Tous
          {compteurs && !chargement && (
            <span
              className={`rounded-full px-1.5 text-xs font-semibold ${
                groupe === '' ? 'bg-white/20' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {compteurs.total ?? 0}
            </span>
          )}
        </button>
      </div>

      {chargement ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Spinner label="Chargement des dossiers…" />
        </div>
      ) : (
        <DossierList
          key={`${typeFiltre || 'all'}-${groupe}`}
          baseFilters={baseFilters}
        />
      )}
    </div>
  );
}

export default DossierListPage;
