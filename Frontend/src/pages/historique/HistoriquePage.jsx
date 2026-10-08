import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  History, Search, RotateCcw, FileText, FileSpreadsheet, FileDown, AlertTriangle,
} from 'lucide-react';
import { historiqueService } from '../../services/historiqueService.js';
import { agentService } from '../../services/agentService.js';
import { usePagination } from '../../hooks/usePagination.js';
import { useNotification } from '../../hooks/useNotification.js';
import { Table } from '../../components/ui/Table.jsx';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Select } from '../../components/ui/Select.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { horodatageFr } from '../../components/dossier/HistoriqueDossier.jsx';

/**
 * Journal global des actions (piste d'audit).
 *
 * Chaque ligne porte l'agent par son nom et son rôle — pas par son identifiant
 * de connexion — ainsi que la date et l'heure, secondes comprises, séparément.
 * La règle du document est « aucune action sans agent, sans date, sans heure ».
 *
 * Les filtres sont envoyés au serveur : la liste affichée n'est jamais un
 * filtrage fait dans le navigateur, donc jamais un filtrage approximatif.
 */

const ACTION_COLORS = {
  CREATION_DOSSIER: 'border-primary-200 bg-primary-50 text-primary-700',
  ENREGISTREMENT: 'border-sky-200 bg-sky-50 text-sky-700',
  MODIFICATION_DOSSIER: 'border-amber-200 bg-amber-50 text-amber-700',
  ORIENTATION: 'border-cyan-200 bg-cyan-50 text-cyan-700',
  AFFECTATION: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  TRAITEMENT: 'border-blue-200 bg-blue-50 text-blue-700',
  VERIFICATION: 'border-purple-200 bg-purple-50 text-purple-700',
  VALIDATION: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  SIGNATURE: 'border-teal-200 bg-teal-50 text-teal-700',
  CLOTURE: 'border-slate-200 bg-slate-100 text-slate-600',
  ARCHIVAGE: 'border-gray-300 bg-gray-100 text-gray-600',
  CONNEXION: 'border-slate-200 bg-slate-50 text-slate-500',
  CONNEXION_ECHOUEE: 'border-red-300 bg-red-50 text-red-700',
  UPLOAD_DOCUMENT: 'border-violet-200 bg-violet-50 text-violet-700',
  RESTAURATION_ARCHIVE: 'border-amber-300 bg-amber-50 text-amber-800',
};

const CRITERES_VIDES = {
  search: '', action: '', agent_id: '', date_debut: '', date_fin: '',
};

export function HistoriquePage() {
  const { toastSuccess, toastError } = useNotification();
  const [criteres, setCriteres] = useState(CRITERES_VIDES);
  const [appliques, setAppliques] = useState({});
  const [donnees, setDonnees] = useState({ actions: [], total: 0, tronque: false, sans_auteur: 0 });
  const [actionsDisponibles, setActionsDisponibles] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enCours, setEnCours] = useState(null);

  const set = (champ) => (e) => setCriteres((c) => ({ ...c, [champ]: e.target.value }));

  const charger = useCallback(async () => {
    setLoading(true);
    try {
      setDonnees(await historiqueService.list(appliques));
    } catch (e) {
      toastError(e.message);
      setDonnees({ actions: [], total: 0, tronque: false, sans_auteur: 0 });
    } finally {
      setLoading(false);
    }
  }, [appliques, toastError]);

  useEffect(() => { Promise.resolve().then(charger); }, [charger]);

  // Les listes de filtre ne proposes que ce qui existe réellement au journal.
  useEffect(() => {
    let actif = true;
    historiqueService.actions()
      .then((a) => { if (actif) setActionsDisponibles(a || []); })
      .catch(() => { /* filtre indisponible : le reste fonctionne */ });
    agentService.list({ limit: 200 })
      .then((a) => { if (actif) setAgents(Array.isArray(a) ? a : a.agents || []); })
      .catch(() => { /* filtre agent indisponible : le reste fonctionne */ });
    return () => { actif = false; };
  }, []);

  const appliquer = (e) => {
    e?.preventDefault();
    const envoyes = {};
    for (const [cle, valeur] of Object.entries(criteres)) {
      if (valeur) envoyes[cle] = valeur;
    }
    setAppliques(envoyes);
  };

  const reinitialiser = () => {
    setCriteres(CRITERES_VIDES);
    setAppliques({});
  };

  const exporter = async (format) => {
    setEnCours(format);
    try {
      const nom = await historiqueService.exporter(format, appliques);
      toastSuccess(`Export « ${nom} » téléchargé.`);
    } catch (e) {
      toastError(e.message);
    } finally {
      setEnCours(null);
    }
  };

  const pagination = usePagination(donnees.actions, 20);

  const agentsConcernes = useMemo(() => {
    // Seuls les agents ayant réellement agi sur le journal affiché : proposer
    // 200 agents pour filtrer 12 lignes n'aide personne.
    const vus = new Set(
      donnees.actions.filter((a) => !a.agent?.systeme && a.agent?.username).map((a) => a.agent.username)
    );
    return agents.filter((a) => {
      const u = a.username || a.user?.username;
      return u && vus.has(u);
    });
  }, [donnees.actions, agents]);

  const columns = [
    {
      key: 'date',
      label: 'Date',
      render: (r) => <span className="whitespace-nowrap text-slate-600">{horodatageFr(r.date_action).date}</span>,
    },
    {
      key: 'heure',
      label: 'Heure',
      render: (r) => (
        <span className="whitespace-nowrap font-mono text-xs text-slate-600">
          {horodatageFr(r.date_action).heure}
        </span>
      ),
    },
    {
      key: 'action',
      label: 'Action',
      render: (r) => (
        <Badge className={ACTION_COLORS[r.action] || 'border-slate-200 bg-slate-50 text-slate-600'}>
          {r.action_libelle || r.action}
        </Badge>
      ),
    },
    {
      key: 'agent',
      label: 'Agent',
      render: (r) => (
        <span className={r.agent?.systeme ? 'text-slate-500 italic' : 'font-medium text-slate-700'}>
          {r.agent?.identite || '—'}
        </span>
      ),
    },
    {
      key: 'role',
      label: 'Rôle',
      render: (r) => <span className="text-xs text-slate-500">{r.role?.libelle || '—'}</span>,
    },
    {
      key: 'dossier',
      label: 'Dossier',
      render: (r) =>
        r.dossier_id ? (
          <Link to={`/dossiers/${r.dossier_id}`} className="font-medium text-primary-600 hover:underline">
            {r.dossier_numero || `#${r.dossier_id}`}
          </Link>
        ) : (
          <span className="text-slate-400">—</span>
        ),
    },
    {
      key: 'details',
      label: 'Détail',
      render: (r) => <p className="max-w-xs truncate text-slate-600">{r.details || '—'}</p>,
    },
    {
      key: 'ip_address',
      label: 'IP',
      render: (r) => <span className="font-mono text-xs text-slate-400">{r.ip_address || '—'}</span>,
    },
  ];

  /* Le décompte vient du serveur, qui le fait sur TOUT le journal filtré.
     Le compter dans la page affichée donnait « aucun événement sans auteur »
     alors que le journal en comptait 14 : ils étaient au-delà de la page. */
  const sansAuteur = donnees.sans_auteur ?? 0;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold text-slate-800">
          <History className="h-5 w-5 text-primary-600" /> Historique
        </h1>
        <p className="text-sm text-slate-500">
          Journal traçable de toutes les actions : qui a fait quoi, et à quelle heure exacte.
        </p>
      </div>

      {donnees.tronque && (
        <Alert type="info" title="Journal volumineux">
          {donnees.total} événements sont enregistrés ; les plus récents sont affichés.
          Utilisez les filtres ou l’export pour consulter l’ensemble.
        </Alert>
      )}

      <Card title="Filtrer le journal">
        <form onSubmit={appliquer} className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Input
                label="Recherche"
                value={criteres.search}
                onChange={set('search')}
                placeholder="N° dossier, agent, action, détail, IP…"
              />
            </div>
            <Button type="submit" className="w-full sm:w-auto">
              <Search className="h-4 w-4" /> Rechercher
            </Button>
            <Button type="button" variant="secondary" onClick={reinitialiser} className="w-full sm:w-auto">
              <RotateCcw className="h-4 w-4" /> Réinitialiser
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Select label="Type d'action" value={criteres.action} onChange={set('action')}>
              <option value="">Toutes</option>
              {actionsDisponibles.map((a) => (
                <option key={a.action} value={a.action}>
                  {a.action.replace(/_/g, ' ')} ({a.total})
                </option>
              ))}
            </Select>
            <Select label="Agent" value={criteres.agent_id} onChange={set('agent_id')}>
              <option value="">Tous</option>
              {agentsConcernes.map((a) => (
                <option key={a.id} value={a.id}>{a.nom} {a.prenom}</option>
              ))}
            </Select>
            <Input label="Du" type="date" value={criteres.date_debut} onChange={set('date_debut')} />
            <Input label="Au" type="date" value={criteres.date_fin} onChange={set('date_fin')} />
          </div>
        </form>
      </Card>

      <Card
        title={`Événements (${donnees.total})`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={() => exporter('csv')} loading={enCours === 'csv'} disabled={!donnees.total}>
              <FileText className="h-3.5 w-3.5" /> CSV
            </Button>
            <Button size="sm" variant="secondary" onClick={() => exporter('excel')} loading={enCours === 'excel'} disabled={!donnees.total}>
              <FileSpreadsheet className="h-3.5 w-3.5" /> Excel
            </Button>
            <Button size="sm" variant="secondary" onClick={() => exporter('pdf')} loading={enCours === 'pdf'} disabled={!donnees.total}>
              <FileDown className="h-3.5 w-3.5" /> PDF
            </Button>
          </div>
        }
      >
        {sansAuteur > 0 && (
          <p className="mb-3 flex items-center gap-1.5 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
            <AlertTriangle className="h-3.5 w-3.5" />
            {sansAuteur} événement{sansAuteur > 1 ? 's' : ''} sans auteur&nbsp;:{' '}
            {sansAuteur > 1 ? 'ils' : 'il'} s’agit
            {sansAuteur > 1 ? 's' : ''} d’une tentative de connexion refusée, où aucun
            compte ne s’est identifié.
          </p>
        )}
        <Table
          columns={columns}
          data={pagination.currentItems}
          loading={loading}
          emptyLabel="Aucun événement ne correspond aux critères."
        />
        <div className="mt-3">
          <Pagination pagination={pagination} />
        </div>
      </Card>
    </div>
  );
}

export default HistoriquePage;
