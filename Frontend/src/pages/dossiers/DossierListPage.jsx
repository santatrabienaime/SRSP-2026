import { useState, useEffect, useCallback } from 'react';
import {
  Inbox, Loader2, CheckCircle2, Layers, AlertTriangle, Clock, Archive, User,
  FolderKanban, FileEdit, Stamp, Wallet, PiggyBank, HandCoins,
} from 'lucide-react';
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
      (c.EN_ATTENTE_COMPLEMENT || 0) +
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
  {
    code: 'INCOMPLETS', label: 'Incomplets', icon: AlertTriangle,
    actif: 'border-red-600 bg-red-600 shadow-[0_0_16px_rgba(239,68,68,0.35)]',
    hint: 'Pièces obligatoires manquantes',
    filters: { incomplets: 1 },
    compte: (c) => c.incomplets || 0,
  },
  {
    /* Brouillons : les dossiers saisis mais pas encore publiés. Ils ne sont
       visibles que de leur auteur, et le filtre est posé par le serveur. */
    code: 'BROUILLONS', label: 'Mes brouillons', icon: FileEdit,
    actif: 'border-slate-600 bg-slate-600 shadow-[0_0_16px_rgba(71,85,105,0.3)]',
    hint: 'Saisies en cours, non publiées',
    filters: { brouillon: 1 },
    compte: () => null,
  },
];

/**
 * Onglets par type de dossier — la vue du secrétariat.
 *
 * Le secrétariat instruit les quatre types de dossier : il enregistre, oriente
 * et suit des demandes de visa, de solde, de pension et de secours. Ce que
 * ces quatre natures ont en commun n'est pas leur avancement, mais leur
 * nature : les onglets sont donc les types, et non l'avancement du traitement.
 *
 * Le compteur de chaque onglet est celui du serveur (la répartition par type
 * du tableau de bord) : il annonce exactement ce que la liste va montrer.
 */
const ONGLETS_TYPES = [
  {
    code: 'VISA', label: 'Visas', icon: Stamp,
    actif: 'border-sky-600 bg-sky-600 shadow-[0_0_16px_rgba(2,132,199,0.35)]',
    hint: 'Demandes de visa',
  },
  {
    code: 'SOLDE', label: 'Soldes', icon: Wallet,
    actif: 'border-emerald-600 bg-emerald-600 shadow-[0_0_16px_rgba(16,185,129,0.35)]',
    hint: 'Mandatements et avances',
  },
  {
    code: 'PENSION', label: 'Pensions', icon: PiggyBank,
    actif: 'border-violet-600 bg-violet-600 shadow-[0_0_16px_rgba(124,58,237,0.35)]',
    hint: 'Liquidations de pension',
  },
  {
    code: 'SECOURS', label: 'Secours', icon: HandCoins,
    actif: 'border-amber-600 bg-amber-600 shadow-[0_0_16px_rgba(245,158,11,0.35)]',
    hint: 'Secours de décès',
  },
];

/**
 * Raccourcis du secrétariat, en complément des onglets par type.
 *
 * Un onglet par type ne remplace pas les raccourcis utiles : les urgents,
 * les incomplets et les saisies en cours restent accessibles en un clic. Ils
 * sont complémentaires du type choisi, jamais concurrents : « Secours » et
 * « Urgents » ensemble veut dire les dossiers Secours urgents.
 */
const RACCOURCIS = [
  { code: 'NOUVEAUX', label: 'Nouveaux', icon: Inbox, filters: { statut: 'RECU,ENREGISTRE' } },
  { code: 'URGENTS', label: 'Urgents', icon: AlertTriangle, filters: { priorite_haute: 1 } },
  { code: 'INCOMPLETS', label: 'Incomplets', icon: AlertTriangle, filters: { incomplets: 1 } },
  { code: 'BROUILLONS', label: 'Mes brouillons', icon: FileEdit, filters: { brouillon: 1 } },
];

export function DossierListPage({ initialGroupe = 'NOUVEAUX' }) {
  const { user, hasPermission } = useAuth();
  const [groupe, setGroupe] = useState(initialGroupe);
  const [typeActif, setTypeActif] = useState('');
  const [raccourci, setRaccourci] = useState(
    initialGroupe === 'INCOMPLETS' ? 'INCOMPLETS' : ''
  );
  const [compteurs, setCompteurs] = useState(null);
  const [chargement, setChargement] = useState(true);

  const roleNom = user?.role_nom || '';
  const global = ROLES_GLOBAUX.includes(roleNom);
  const typeFiltre = !global && user?.type_code ? user.type_code : null;

  /* Le secrétariat travaille sur les quatre types de dossier : ses onglets
     sont les types. Les autres profils gardent les onglets d'avancement, qui
     répondent à « qu'est-ce qui m'attend ? ». */
  const estSecretaire = roleNom === 'SECRETAIRE';

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

  /* Le nombre de dossiers d'un type : celui de la répartition par type du
     tableau de bord, calculée par le serveur sur le même périmètre. */
  const compteType = (code) => {
    const ligne = (compteurs?.par_type || []).find((t) => t.type_code === code);
    return ligne ? Number(ligne.total) : null;
  };

  const groupeActif = GROUPES.find((g) => g.code === groupe);
  const raccourciActif = RACCOURCIS.find((r) => r.code === raccourci);

  const baseFilters = estSecretaire
    ? {
      ...(typeActif ? { type: typeActif } : {}),
      ...(raccourciActif?.filters || {}),
    }
    : {
      ...(typeFiltre ? { type: typeFiltre } : {}),
      ...(groupeActif?.filters || {}),
    };

  /* La liste est rechargée à chaque changement d'onglet : la clé force le
     remontage du composant, pour que les filtres ne se cumulent pas. */
  const cleListe = estSecretaire
    ? `secretariat-${typeActif || 'tous'}-${raccourci || 'aucun'}`
    : `${typeFiltre || 'all'}-${groupe}`;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Dossiers</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {estSecretaire
            ? 'Dossiers du secrétariat, par type de dossier.'
            : agentPersonnel
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

      {estSecretaire ? (
        /* Onglets par type de dossier. */
        <div className="flex flex-wrap gap-2">
          {ONGLETS_TYPES.map((t) => {
            const Icon = t.icon;
            const actif = typeActif === t.code;
            const n = compteType(t.code);
            return (
              <button
                key={t.code}
                type="button"
                onClick={() => setTypeActif(t.code)}
                aria-pressed={actif}
                aria-label={`Dossiers ${t.label}`}
                className={`flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors duration-200 motion-reduce:transition-none ${actif
                  ? `text-white ${t.actif}`
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-700'}`}
              >
                <Icon className={`h-4 w-4 ${actif ? 'text-white' : ''}`} />
                <span className="flex flex-col items-start leading-tight">
                  {t.label}
                  <span className={`text-[10px] font-normal ${actif ? 'text-white/80' : 'text-slate-400'}`}>
                    {t.hint}
                  </span>
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
            onClick={() => setTypeActif('')}
            aria-pressed={typeActif === ''}
            aria-label="Tous les types de dossier"
            className={`flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors duration-200 motion-reduce:transition-none ${typeActif === ''
              ? 'border-slate-700 bg-slate-700 text-white shadow-[0_0_15px_rgba(74,85,99,0.3)]'
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-700'}`}
            title="Tous les types de dossier"
          >
            <Layers className="h-4 w-4" />
            <span className="flex flex-col items-start leading-tight">
              Tous
              <span className="text-[10px] font-normal text-slate-400 dark:text-slate-400">Tous les types</span>
            </span>
            {compteurs && !chargement && (
              <span className={`rounded-full px-1.5 text-xs font-semibold ${typeActif === '' ? 'bg-white/20' : 'bg-slate-100 text-slate-600'}`}>
                {compteurs.total ?? 0}
              </span>
            )}
          </button>
        </div>
      ) : (
        /* Séparation des dossiers : un ensemble affiché à la fois. */
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
      )}

      {estSecretaire && (
        /* Raccourcis du secrétariat : ils se cumulent avec l'onglet de type. */
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Filtres rapides :</span>
          {RACCOURCIS.map((r) => {
            const Icon = r.icon;
            const actif = raccourci === r.code;
            return (
              <button
                key={r.code}
                type="button"
                onClick={() => setRaccourci(actif ? '' : r.code)}
                aria-pressed={actif}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors duration-200 motion-reduce:transition-none ${actif
                  ? 'border-primary-600 bg-primary-600 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}
              >
                <Icon className="h-3.5 w-3.5" />
                {r.label}
              </button>
            );
          })}
          {raccourci && (
            <button
              type="button"
              onClick={() => setRaccourci('')}
              className="text-xs text-slate-500 underline underline-offset-2 hover:text-slate-700"
            >
              Effacer
            </button>
          )}
        </div>
      )}

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
          key={cleListe}
          baseFilters={baseFilters}
          agentPersonnel={agentPersonnel}
        />
      )}
    </div>
  );
}

export default DossierListPage;
