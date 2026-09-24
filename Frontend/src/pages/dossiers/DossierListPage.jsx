import { useState, useEffect, useCallback } from 'react';
import { Inbox, Loader2, CheckCircle2, Layers } from 'lucide-react';
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
  { code: 'NOUVEAUX', label: 'Nouveaux', icon: Inbox, statuts: ['RECU', 'ENREGISTRE'] },
  {
    code: 'EN_COURS', label: 'En cours', icon: Loader2,
    statuts: ['ORIENTE', 'AFFECTE', 'EN_TRAITEMENT', 'SOUMIS_A_VERIFICATION', 'CORRECTION_DEMANDEE'],
  },
  { code: 'TERMINES', label: 'Terminés', icon: CheckCircle2, statuts: ['VALIDE', 'SIGNE', 'CLOTURE', 'ARCHIVE'] },
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
    (compteurs && statuts.reduce((n, c) => n + (compteurs[c] || 0), 0)) ?? null;

  const baseFilters = {
    ...(typeFiltre ? { type: typeFiltre } : {}),
    statut: groupe,
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
        {GROUPES.map((g) => {
          const Icon = g.icon;
          const actif = groupe === g.code;
          const n = compte(g.statuts);
          return (
            <button
              key={g.code}
              type="button"
              onClick={() => setGroupe(g.code)}
              className={`flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors ${
                actif
                  ? 'border-primary-600 bg-primary-600 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="h-4 w-4" />
              {g.label}
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
          className={`flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors ${
            groupe === ''
              ? 'border-slate-700 bg-slate-700 text-white'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
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
