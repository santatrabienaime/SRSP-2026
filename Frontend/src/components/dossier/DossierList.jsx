import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, UserCheck, User, Filter, X, Layers } from 'lucide-react';
import { dossierService } from '../../services/dossierService.js';
import { divisionService } from '../../services/divisionService.js';
import { agentService } from '../../services/agentService.js';
import { referentielService } from '../../services/referentielService.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { usePagination } from '../../hooks/usePagination.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useTempsReel } from '../../hooks/useTempsReel.js';
import { useAnimation } from '../../hooks/useAnimation.jsx';
import { Badge } from '../ui/Badge.jsx';
import { Button } from '../ui/Button.jsx';
import { Select } from '../ui/Select.jsx';
import { AutoCompleteInput } from '../fields/index.jsx';
import { Table } from '../ui/Table.jsx';
import { Pagination } from '../ui/Pagination.jsx';
import { Alert } from '../ui/Alert.jsx';
import { EmptyState } from '../ui/EmptyState.jsx';
import { formatDateString, formatDateTime } from '../../utils/formatDate.js';
import { formatStatus, statusBadgeClass, prioriteBadgeClass } from '../../utils/formatStatus.js';
import { STATUTS, STATUT_LABELS, TYPES_DOSSIERS } from '../../config/constants.js';
import { TRIS_DOSSIERS, grouperParStatut, grouperParNiveau } from '../../config/triage.js';

const STATUT_FILTERS = [
  { value: '', label: 'Tous les statuts' },
  ...Object.entries(STATUTS).map(([code]) => ({
    value: code,
    label: STATUT_LABELS[code],
  })),
];

/** Statuts pour lesquels une échéance dépassée n'a plus de sens. */
const STATUTS_CLOS = [STATUTS.CLOTURE, STATUTS.ARCHIVE];

/**
 * Nombre de dossiers montrés par section quand la liste est groupée par
 * statut. Au-delà, la section est repliée : un statut à deux cents dossiers
 * écraserait tous les autres, et l'écran perdrait son intérêt.
 */
const TAILLE_GROUPE = 10;

/**
 * Cellule d'échéance : affiche la date limite et signale le dépassement.
 *
 * Le dossier n'est jamais qualifié « en retard » : une date limite n'a de
 * sens que si elle a été validée, et le service ne l'impose pas. On parle
 * donc d'« échéance dépassée », et l'ancienneté est affichée à part.
 */
function Echeance({ dateLimite, statut }) {
  if (!dateLimite) return <span className="text-slate-400">—</span>;
  const clos = STATUTS_CLOS.includes(statut);
  const depassee = !clos && new Date(dateLimite) < new Date(new Date().toDateString());
  return (
    <span className={`inline-flex items-center gap-1 ${depassee ? 'font-medium text-red-600' : 'text-slate-600'}`}>
      {formatDateString(dateLimite)}
      {depassee && (
        <span className="rounded bg-red-100 px-1 text-[10px] font-semibold uppercase text-red-700">
          échéance dépassée
        </span>
      )}
    </span>
  );
}

/** Ancienneté du dossier, en jours. */
function Age({ jours }) {
  if (jours === undefined || jours === null) return <span className="text-slate-400">—</span>;
  return (
    <span className={jours > 30 ? 'font-medium text-amber-700' : 'text-slate-600'}>
      {jours} j
    </span>
  );
}

/**
 * Liste des dossiers avec filtres côté serveur (statut, type, recherche).
 */
export function DossierList({ baseFilters = {}, showCreate = true, agentPersonnel = false }) {
  const { hasPermission } = useAuth();
  const { abonner } = useTempsReel();
  // Un agent est automatiquement restreint à SES dossiers par le serveur
  // (permission view_assigned_dossiers sans view_all_dossiers).
  const agentScoped = agentPersonnel || (hasPermission('view_assigned_dossiers') && !hasPermission('view_all_dossiers'));
  // Si la liste est verrouillée sur un type (page d'une division), le
  // sélecteur de type n'a pas lieu d'être et la barre est allégée.
  const lockedType = baseFilters.type || null;
  const showTypeFilter = !lockedType;
  // La liste peut etre verrouillee sur un groupe d'avancement (Nouveaux,
  // En cours, Termines) : le selecteur de statut est alors masque, sinon il
  // viendrait ecraser le groupe choisi.
  const lockedStatut = baseFilters.statut || null;
  /* Les brouillons ne sont pas dans le circuit : ils ont tous le même
     statut, et le selecteur de statut n'aurait donc rien à filtrer. */
  const estBrouillon = Boolean(baseFilters.brouillon);
  const showStatutFilter = !lockedStatut && !estBrouillon;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statut, setStatut] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  /* Filtres avancés : division, responsable et période de réception. Ils
     sont repliés par défaut — la recherche et le statut suffisent au
     quotidien, mais un chef de division doit pouvoir circonscrire une
     période ou un agent précis. */
  const [division, setDivision] = useState('');
  const [agent, setAgent] = useState('');
  const [niveau, setNiveau] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [filtresOuverts, setFiltresOuverts] = useState(false);
  const [divisions, setDivisions] = useState([]);
  const [agents, setAgents] = useState([]);
  const [priorites, setPriorites] = useState([]);
  /* Tri de la file de travail. « prioritaire » place en tête ce qui doit être
     traité aujourd'hui — urgence, échéance, ancienneté. Un agent qui arrive le
     matin voit ainsi d'abord ce qui l'attend, au lieu du plus récemment reçu. */
  const [tri, setTri] = useState(agentPersonnel ? 'echeance' : 'prioritaire');
  /* Regroupement de la liste : aucune section, une section par statut du
     circuit, ou une section par niveau de priorité. Les deux modes sont
     exclusifs : deux découpages superposés seraient illisibles.
     Le regroupement par niveau répond à « qu'est-ce qui est urgent ? » ; le
     regroupement par statut à « où en est le service ? ». */
  const [regroupement, setRegroupement] = useState('');
  /* Un groupe trop long est replié : on montre les premiers dossiers et on
     laisse le reste à la demande. Sans cela, un statut à deux cents dossiers
     écrase tous les autres. */
  const [groupesDeployes, setGroupesDeployes] = useState({});
  const debouncedSearch = useDebounce(search, 350);
  const { animationClass } = useAnimation({ delay: 100, type: 'slide-in-up' });

  useEffect(() => {
    divisionService
      .list()
      .then((d) => setDivisions(Array.isArray(d) ? d : []))
      .catch(() => {});
    agentService
      .list()
      .then((a) => setAgents(Array.isArray(a) ? a : []))
      .catch(() => {});
    /* Les niveaux de priorité viennent du référentiel : le SRSP peut renommer
       « URGENTE » ou changer son rang sans qu'on redéploie le frontend. */
    referentielService
      .get()
      .then((r) => setPriorites(Array.isArray(r?.priorites) ? r.priorites : []))
      .catch(() => {});
  }, []);

  // baseFilters est souvent un objet recréé à chaque rendu du parent (ou défaut {} )
  // → le garder en ref évite que l'identité change et fasse re-feuiller load (clignotement).
  const baseFiltersRef = useRef(baseFilters);
  useEffect(() => { baseFiltersRef.current = baseFilters; }, [baseFilters]);
  const filterKey = JSON.stringify(baseFilters);

  const load = useCallback(async (options = {}) => {
    /* Rechargement à chaud : la liste reste affichée pendant la recharge. */
    const silencieux = Boolean(options.silencieux);
    if (!silencieux) setLoading(true);
    setError(null);
    try {
      const params = {
        ...baseFiltersRef.current,
        search: debouncedSearch || undefined,
        // Le statut vient du selecteur, sauf si la liste est verrouillee sur un
        // groupe d'avancement : dans ce cas baseFilters fait foi.
        ...(lockedStatut || estBrouillon ? {} : { statut: statut || undefined }),
        // Le type vient du selecteur, sauf si la liste est verrouillee sur un
        // type (page d'une division) : dans ce cas baseFilters fait foi.
        ...(lockedType ? {} : { type: typeFilter || undefined }),
        division_id: division || undefined,
        agent_id: agent || undefined,
        niveau: niveau || undefined,
        date_debut: dateDebut || undefined,
        date_fin: dateFin || undefined,
        tri: tri || undefined,
      };
      const rows = await dossierService.list(params);
      setData(Array.isArray(rows) ? rows : []);
    } catch (e) {
      if (!silencieux) setError(e);
    } finally {
      if (!silencieux) setLoading(false);
    }
  }, [filterKey, debouncedSearch, statut, typeFilter, division, agent, niveau, dateDebut, dateFin, tri]);

  // load est stable (dépendances primitives : filterKey, debouncedSearch, statut, typeFilter)
  // → l'effet se déclenche au montage ET à chaque vrai changement de filtre, sans boucle.
  useEffect(() => {
    Promise.resolve().then(load);
  }, [load]);

  /* Temps réel : la liste se recharge dès qu'un dossier change d'état. Une
     file de travail qui reste figée pendant que le dossier avance est une
     file de travail fausse. */
  useEffect(() => {
    return abonner('dossier', () => {
      Promise.resolve().then(() => load({ silencieux: true }));
    });
  }, [abonner, load]);

  const pagination = usePagination(data, 10);
  /* Les sections de la vue groupée : une par statut du circuit, ou une par
     niveau de priorité selon le mode choisi. */
  const groupes = useMemo(
    () => (regroupement === 'niveau' ? grouperParNiveau(data) : grouperParStatut(data)),
    [data, regroupement]
  );
  const canCreate = hasPermission('create_dossier');

  const columns = [
    {
      key: 'numero',
      label: 'N° dossier',
      render: (r) => (
        <Link to={`/dossiers/${r.id}`} className="font-semibold text-primary-600 hover:underline">
          {r.numero}
        </Link>
      ),
    },
    {
      key: 'objet',
      label: 'Objet / demandeur',
      render: (r) => (
        <div className="max-w-xs">
          <p className="truncate font-medium text-slate-700">{r.objet}</p>
          <p className="truncate text-xs text-slate-500">{r.demandeur || '—'}</p>
          <p className="truncate text-xs text-slate-400">
            Matricule : {r.matricule || '—'}
          </p>
        </div>
      ),
    },
    { key: 'type_libelle', label: 'Type' },
    {
      key: 'division_nom',
      label: 'Division',
      render: (r) => r.division_nom || '—',
    },
    {
      key: 'agent',
      label: 'Agent',
      render: (r) => (r.agent_nom ? `${r.agent_nom} ${r.agent_prenom || ''}`.trim() : '—'),
    },
    {
      key: 'priorite_niveau',
      label: 'Niveau',
      render: (r) => (
        <div className="flex flex-col items-start gap-0.5">
          <Badge className={prioriteBadgeClass(r.priorite_libelle)}>
            {r.priorite_libelle || '—'}
          </Badge>
          <span className="text-[10px] uppercase tracking-wide text-slate-400">
            niveau {r.priorite_niveau ?? '—'}
          </span>
        </div>
      ),
    },
    {
      key: 'date_reception',
      label: 'Réception',
      render: (r) => formatDateString(r.date_reception),
    },
    {
      key: 'age_jours',
      label: 'Âge',
      render: (r) => <Age jours={r.age_jours} />,
    },
    {
      key: 'date_limite',
      label: 'Échéance',
      render: (r) => <Echeance dateLimite={r.date_limite} statut={r.statut_code} />,
    },
    {
      key: 'statut_code',
      label: 'Statut',
      render: (r) => (
        <Badge className={statusBadgeClass(r.statut_code)}>
          {formatStatus(r.statut_code)}
        </Badge>
      ),
    },
    {
      /* Le dernier acte dit où le dossier circule aujourd'hui. Il vient de
         l'historique, pas d'une colonne recopiée : c'est la même source que
         l'onglet Historique de la fiche. */
      key: 'dernier_mouvement',
      label: 'Dernier mouvement',
      render: (r) =>
        r.dernier_mouvement ? (
          <div className="max-w-[12rem]">
            <p className="truncate text-xs font-medium text-slate-600">
              {r.derniere_action_libelle || 'Action'}
            </p>
            <p className="text-[11px] text-slate-400">
              {formatDateTime(r.dernier_mouvement)}
            </p>
          </div>
        ) : (
          <span className="text-slate-400">—</span>
        ),
    },
  ];

  // File « À affecter » : le chef de division agit sans ouvrir chaque fiche.
  // Le bouton n'apparait que pour un dossier qui attend son affectation et
  // pour un role autorise a affecter.
  const fileAAffecter =
    baseFilters.statut === STATUTS.ENREGISTRE || baseFilters.statut === STATUTS.ORIENTE;
  const peutAffecter = hasPermission('affecter_dossier');
  if (fileAAffecter && peutAffecter) {
    columns.push({
      key: 'action',
      label: 'Action',
      render: (r) => {
        const affectable = [STATUTS.ENREGISTRE, STATUTS.ORIENTE].includes(r.statut_code);
        if (!affectable) {
          return <span className="text-xs text-slate-400">Déjà affecté</span>;
        }
        return (
          <Link to={`/dossiers/${r.id}`}>
            <Button size="sm" variant="outline">
              <UserCheck className="h-3.5 w-3.5" />
              Affecter
            </Button>
          </Link>
        );
      },
    });
  }

  return (
    <div className={`space-y-4 animate-${animationClass}`}>
      {agentScoped && (
        <p className="rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-800 flex items-center gap-2 animate-fade-in">
          <User className="h-4 w-4 shrink-0" />
          <span>Tableau personnel — vous ne voyez que vos propres dossiers (responsable affecté).</span>
        </p>
      )}
      {/* Filtres */}
      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-end">
        <div className="w-full sm:min-w-[20rem] sm:flex-1">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-9 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <AutoCompleteInput
              label="Recherche"
              placeholder="N° dossier, référence, bénéficiaire, demandeur…"
              value={search}
              onChange={setSearch}
              suggestions={data.flatMap((d) => [
                d.numero, d.reference_visa, d.objet, d.demandeur, d.beneficiaire,
              ])}
              className="[&_input]:pl-9"
            />
          </div>
        </div>
        {showStatutFilter && (
          <div className="w-full sm:w-52">
            <Select
              label="Statut"
              value={statut}
              onChange={(e) => setStatut(e.target.value)}
            >
              {STATUT_FILTERS.map((s) => (
                <option key={s.value || 'all'} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          </div>
        )}
        {/* Tri de la file de travail : ce n'est qu'un ordre d'affichage, il ne
            change rien au contenu de la liste. */}
        <div className="w-full sm:w-56">
          <Select label="Trier par" value={tri} onChange={(e) => setTri(e.target.value)}>
            {TRIS_DOSSIERS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </div>
        {/* Regroupement : la liste est découpée en sections, soit par statut
            du circuit, soit par niveau de priorité. Les deux modes sont
            exclusifs ; un second clic sur le mode actif revient à la liste
            plate. */}
        <div className="flex w-full gap-2 sm:w-auto">
          <Button
            variant={regroupement === 'statut' ? 'primary' : 'outline'}
            onClick={() => setRegroupement((v) => (v === 'statut' ? '' : 'statut'))}
            title="Afficher les dossiers section par statut"
            aria-pressed={regroupement === 'statut'}
            className="flex-1 sm:flex-none"
          >
            <Layers className="h-4 w-4" />
            Grouper par statut
          </Button>
          <Button
            variant={regroupement === 'niveau' ? 'primary' : 'outline'}
            onClick={() => setRegroupement((v) => (v === 'niveau' ? '' : 'niveau'))}
            title="Afficher les dossiers section par niveau de priorité"
            aria-pressed={regroupement === 'niveau'}
            className="flex-1 sm:flex-none"
          >
            <Layers className="h-4 w-4" />
            Grouper par niveau
          </Button>
        </div>
        {showTypeFilter ? (
          <div className="w-full sm:w-48">
            <Select
              label="Type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">Tous les types</option>
              {Object.entries(TYPES_DOSSIERS).map(([code, t]) => (
                <option key={code} value={code}>
                  {t.label}
                </option>
              ))}
            </Select>
          </div>
        ) : (
          <div className="w-full sm:w-48">
            <p className="text-xs font-medium text-slate-500">Type de dossier</p>
            <p className="mt-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              {TYPES_DOSSIERS[lockedType]?.label || lockedType}
            </p>
          </div>
        )}
        {canCreate && showCreate && (
          <Link to="/dossiers/nouveau">
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4" /> Nouveau dossier
            </Button>
          </Link>
        )}
      </div>

      {/* Filtres avancés : division, responsable et période de réception.
          Repliés par défaut, ils s'ouvrent d'un clic — un chef de division
          doit pouvoir isoler un agent ou un trimestre sans repasser par le
          moteur de recherche. */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <button
          type="button"
          onClick={() => setFiltresOuverts((v) => !v)}
          aria-expanded={filtresOuverts}
          className="flex w-full items-center gap-2 text-sm font-medium text-slate-700"
        >
          <Filter className="h-4 w-4 text-slate-400" />
          Filtres avancés
          {(division || agent || niveau || dateDebut || dateFin) && (
            <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-semibold text-primary-700">
              actifs
            </span>
          )}
        </button>

        {filtresOuverts && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Select
              label="Division"
              value={division}
              onChange={(e) => setDivision(e.target.value)}
            >
              <option value="">Toutes les divisions</option>
              {divisions.map((d) => (
                <option key={d.id} value={d.id}>{d.nom}</option>
              ))}
            </Select>
            <Select
              label="Responsable"
              value={agent}
              onChange={(e) => setAgent(e.target.value)}
            >
              <option value="">Tous les responsables</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nom} {a.prenom}
                </option>
              ))}
            </Select>
            {/* Niveau de priorité : 4 = URGENTE, 1 = BASSE. Les niveaux
                viennent du référentiel, pas d'une liste figée ici. */}
            <Select
              label="Niveau de priorité"
              value={niveau}
              onChange={(e) => setNiveau(e.target.value)}
            >
              <option value="">Tous les niveaux</option>
              {[...priorites]
                .sort((a, b) => Number(b.niveau) - Number(a.niveau))
                .map((p) => (
                  <option key={p.id} value={p.niveau}>
                    {p.libelle} — niveau {p.niveau}
                  </option>
                ))}
            </Select>
            <div>
              <label
                htmlFor="filtre-debut"
                className="mb-1 block text-xs font-medium text-slate-500"
              >
                Réception du
              </label>
              <input
                id="filtre-debut"
                type="date"
                value={dateDebut}
                max={dateFin || undefined}
                onChange={(e) => setDateDebut(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
              />
            </div>
            <div>
              <label
                htmlFor="filtre-fin"
                className="mb-1 block text-xs font-medium text-slate-500"
              >
                au
              </label>
              <input
                id="filtre-fin"
                type="date"
                value={dateFin}
                min={dateDebut || undefined}
                onChange={(e) => setDateFin(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
              />
            </div>
            {(division || agent || niveau || dateDebut || dateFin) && (
              <div className="sm:col-span-2 lg:col-span-5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDivision('');
                    setAgent('');
                    setNiveau('');
                    setDateDebut('');
                    setDateFin('');
                  }}
                >
                  <X className="h-4 w-4" /> Effacer les filtres avancés
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <Alert type="error" title="Erreur de chargement">
          {error.message}
        </Alert>
      )}

      {/* Nombre de résultats : le cahier des fonctionnalités demande qu'il
          soit affiché, pour qu'un filtre restrictif ne passe pas pour une
          absence de dossiers. */}
      {!loading && !error && (
        <p className="text-sm text-slate-500">
          <strong className="font-semibold text-slate-700">{data.length}</strong>{' '}
          dossier{data.length > 1 ? 's' : ''}
          {baseFilters.statut || baseFilters.brouillon || baseFilters.incomplets
            ? ' dans cette sélection'
            : ''}
          {regroupement === 'statut' && groupes.length > 0 && (
            <>
              , répartis sur {groupes.length} statut{groupes.length > 1 ? 's' : ''}
            </>
          )}
          {regroupement === 'niveau' && groupes.length > 0 && (
            <>
              , répartis sur {groupes.length} niveau{groupes.length > 1 ? 'x' : ''} de priorité
            </>
          )}
          .
        </p>
      )}

      {(loading || data.length > 0) && (regroupement ? (
        /* Vue groupée : une section par statut du circuit, ou une section par
           niveau de priorité. Chaque section porte son effectif — c'est ce qui
           permet de repérer la surcharge d'un statut ou le poids des urgents. */
        <div className="space-y-5">
          {groupes.map((groupe) => {
            const deploye = Boolean(groupesDeployes[groupe.code]);
            const visibles = deploye ? groupe.dossiers : groupe.dossiers.slice(0, TAILLE_GROUPE);
            const reste = groupe.dossiers.length - visibles.length;
            return (
              <section key={groupe.code} aria-label={`Dossiers ${groupe.label}`}>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  {regroupement === 'statut' ? (
                    <Badge className={statusBadgeClass(groupe.code)}>{groupe.label}</Badge>
                  ) : (
                    <>
                      <Badge className={prioriteBadgeClass(groupe.label)}>{groupe.label}</Badge>
                      <span className="text-xs text-slate-400">
                        niveau {groupe.niveau}
                      </span>
                    </>
                  )}
                  <span className="text-sm text-slate-500">
                    {groupe.total} dossier{groupe.total > 1 ? 's' : ''}
                  </span>
                </div>
                <Table columns={columns} data={visibles} loading={loading} />
                {reste > 0 && (
                  <div className="mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setGroupesDeployes((g) => ({ ...g, [groupe.code]: true }))
                      }
                    >
                      Afficher les {reste} autres dossier{reste > 1 ? 's' : ''} « {groupe.label} »
                    </Button>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      ) : (
        <>
          <Table columns={columns} data={pagination.currentItems} loading={loading} />
          <Pagination pagination={pagination} className="justify-end" />
        </>
      ))}

      {!loading && data.length === 0 && (
        <EmptyState
          title="Aucun dossier"
          message="Aucun dossier ne correspond aux critères sélectionnés."
          action={
            canCreate && (
              <Link to="/dossiers/nouveau">
                <Button variant="secondary">
                  <Plus className="h-4 w-4" /> Créer un dossier
                </Button>
              </Link>
            )
          }
        />
      )}
    </div>
  );
}

export default DossierList;