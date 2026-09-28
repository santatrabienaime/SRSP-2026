import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Archive, Search, RotateCcw, Bookmark, BookmarkPlus, Trash2,
  FolderKanban, AlertTriangle, FileText, FileSpreadsheet, FileDown,
} from 'lucide-react';
import { archiveService, recherchesSauvegardees } from '../../services/archiveService.js';
import { dossierService } from '../../services/dossierService.js';
import { referentielService } from '../../services/referentielService.js';
import { agentService } from '../../services/agentService.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useNotification } from '../../hooks/useNotification.js';
import { Table } from '../../components/ui/Table.jsx';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Select } from '../../components/ui/Select.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { formatDateString } from '../../utils/formatDate.js';

const TAILLES = [20, 50, 100];

/** Critères vides : sert aussi de « réinitialiser ». */
const CRITERES_VIDES = {
  q: '', type_id: '', division_id: '', annee: '', date_debut: '', date_fin: '',
  agent_id: '', demandeur: '', matricule: '', tri: 'archivage_desc',
};

/**
 * Archives : recherche, tri, export et restauration.
 *
 * Un dossier archivé est consultable mais plus modifiable ; la restauration
 * revient au statut clôturé et reste réservée à l'administrateur, avec un motif
 * obligatoire.
 */
export function ArchivesPage() {
  const { isRole, hasPermission } = useAuth();
  const { toastSuccess, toastError } = useNotification();

  const [criteres, setCriteres] = useState(CRITERES_VIDES);
  const [appliques, setAppliques] = useState({});
  const [donnees, setDonnees] = useState({ archives: [], total: 0 });
  const [page, setPage] = useState(1);
  const [taille, setTaille] = useState(20);
  const [loading, setLoading] = useState(true);
  const [tris, setTris] = useState({});
  const [referentiel, setReferentiel] = useState({ types_dossiers: [], divisions: [] });
  const [agents, setAgents] = useState([]);
  const [stats, setStats] = useState(null);
  const [alertes, setAlertes] = useState([]);
  const [dossiersArchivables, setDossiersArchivables] = useState([]);
  const [saves, setSaves] = useState(recherchesSauvegardees.lister());
  const [modal, setModal] = useState(null); // 'sauver' | 'restaurer'
  const [nomSave, setNomSave] = useState('');
  const [motif, setMotif] = useState('');
  const [enCours, setEnCours] = useState(false);

  const peutRestaurer = isRole('ADMIN');
  const peutArchiver = hasPermission('archiver_dossier');

  const set = (champ) => (e) => setCriteres((c) => ({ ...c, [champ]: e.target.value }));

  const chargerStats = useCallback(async (filtres) => {
    try {
      const [s, a] = await Promise.all([
        archiveService.statistiques(filtres),
        archiveService.alertes(filtres),
      ]);
      setStats(s);
      setAlertes(a);
    } catch {
      setStats(null);
      setAlertes([]);
    }
  }, []);

  /**
   * Dossiers clôturés en attente d'archivage.
   *
   * Seuls ceux qui peuvent archiver ont interest à cette liste : la demander à
   * un agent n'aurait aucun usage, et échouerait pour une simple question de
   * droits, pas de fond.
   */
  const chargerArchivables = useCallback(async () => {
    if (!peutArchiver) { setDossiersArchivables([]); return; }
    try {
      const data = await dossierService.list({ statut: 'CLOTURE', limit: 20 });
      setDossiersArchivables(Array.isArray(data) ? data : []);
    } catch {
      setDossiersArchivables([]);
    }
  }, [peutArchiver]);

  const charger = useCallback(async () => {
    setLoading(true);
    try {
      const data = await archiveService.lister({
        ...appliques,
        limit: taille,
        offset: (page - 1) * taille,
      });
      setDonnees(data);
      await Promise.all([chargerStats(appliques), chargerArchivables()]);
    } catch (e) {
      toastError(e.message);
      setDonnees({ archives: [], total: 0 });
    } finally {
      setLoading(false);
    }
  }, [appliques, page, taille, chargerStats, chargerArchivables, toastError]);

  /**
   * Objet de pagination attendu par le composant <Pagination />.
   *
   * Le composant raisonne sur un tableau complet ; ici la pagination est
   * faîte par le serveur. On lui fournit donc les mêmes clés, calculées sur le
   * total renvoyé, pour que l'affichage « 1–20 sur 245 » soit exact.
   */
  const pagination = {
    page,
    setPage: (p) => setPage(Math.max(1, Math.min(p, pagination.totalPages))),
    pageSize: taille,
    setPageSize: (n) => { setTaille(n); setPage(1); },
    totalPages: Math.max(1, Math.ceil((donnees.total || 0) / taille)),
    from: (donnees.total || 0) === 0 ? 0 : (page - 1) * taille + 1,
    to: Math.min(page * taille, donnees.total || 0),
    total: donnees.total || 0,
  };

  useEffect(() => { charger(); }, [charger]);

  useEffect(() => {
    let actif = true;
    (async () => {
      const [ref, listTris] = await Promise.all([
        referentielService.get().catch(() => null),
        archiveService.tris().catch(() => ({})),
      ]);
      if (!actif) return;
      if (ref) {
        setReferentiel({
          types_dossiers: ref.types_dossiers || [],
          divisions: ref.divisions || [],
        });
      }
      setTris(listTris);
      try {
        const liste = await agentService.list({ limit: 200 });
        if (actif) setAgents(Array.isArray(liste) ? liste : liste.agents || []);
      } catch { /* filtre agent indisponible : le reste fonctionne */ }
    })();
    return () => { actif = false; };
  }, []);

  const appliquer = (e) => {
    e?.preventDefault();
    const { q, type_id, division_id, annee, date_debut, date_fin, agent_id, demandeur, matricule, tri } = criteres;
    setPage(1);
    setAppliques({
      ...(q ? { q } : {}),
      ...(type_id ? { type_id } : {}),
      ...(division_id ? { division_id } : {}),
      ...(annee ? { annee } : {}),
      ...(date_debut ? { date_debut } : {}),
      // Borne basse incluse, borne haute exclusive jusqu'au lendemain inclus.
      ...(date_fin ? { date_fin } : {}),
      ...(agent_id ? { agent_id } : {}),
      ...(demandeur ? { demandeur } : {}),
      ...(matricule ? { matricule } : {}),
      ...(tri ? { tri } : {}),
    });
  };

  const changerTri = (nouveau) => {
    const critere = { ...criteres, tri: nouveau };
    setCriteres(critere);
    setPage(1);
    setAppliques((a) => ({ ...a, tri: nouveau }));
  };

  const reinitialiser = () => {
    setCriteres(CRITERES_VIDES);
    setPage(1);
    setAppliques({});
  };

  const chargerSave = (save) => {
    setCriteres({ ...CRITERES_VIDES, ...save.criteres });
    setPage(1);
    setAppliques(save.criteres);
  };

  const enregistrerSave = () => {
    const nom = nomSave.trim();
    if (!nom) return;
    setSaves(recherchesSauvegardees.enregistrer(nom, appliques));
    setModal(null);
    setNomSave('');
    toastSuccess('Recherche enregistrée.');
  };

  const supprimerSave = (nom) => {
    setSaves(recherchesSauvegardees.supprimer(nom));
  };

  const exporter = async (format) => {
    setEnCours(true);
    try {
      const nom = await archiveService.exporter(format, appliques);
      toastSuccess(`Export « ${nom} » téléchargé.`);
    } catch (e) {
      toastError(e.message);
    } finally {
      setEnCours(false);
    }
  };

  /**
   * Archive un dossier clôturé.
   *
   * Le numéro saisi n'est pas proposé en clair : l'agent doit cliquer, sinon
   * un dossier peut être archivé sans avoir été lu.
   */
  const archiver = async (dossier) => {
    setEnCours(true);
    try {
      await dossierService.archiver(dossier.id);
      toastSuccess(`Dossier ${dossier.numero} archivé.`);
      await Promise.all([charger(), chargerArchivables()]);
    } catch (e) {
      toastError(e.message);
    } finally {
      setEnCours(false);
    }
  };

  const restaurer = async () => {
    if (!modal?.dossier) return;
    setEnCours(true);
    try {
      await archiveService.restaurer(modal.dossier.id, motif);
      toastSuccess('Dossier restauré : il repasse au statut clôturé.');
      setModal(null);
      setMotif('');
      // Les deux listes changent : la liste des archives perd une ligne, celle
      // des dossiers à archiver en gagne une.
      await Promise.all([charger(), chargerArchivables()]);
    } catch (e) {
      toastError(e.message);
    } finally {
      setEnCours(false);
    }
  };

  const total = donnees.total || 0;
  const annees = useMemo(() => {
    const set = new Set((stats?.par_annee || []).map((a) => a.annee).filter(Boolean));
    return [...set].sort((a, b) => b - a);
  }, [stats]);

  const enTeteTri = (cle, libelle) => {
    const actif = (criteres.tri || 'archivage_desc') === cle;
    return (
      <button
        type="button"
        onClick={() => changerTri(cle)}
        className={`flex items-center gap-1 uppercase hover:text-slate-700 ${actif ? 'text-primary-700' : ''}`}
        title={tris[cle] || libelle}
      >
        {libelle}
        <span aria-hidden="true" className="text-[9px]">{actif ? '▼' : '↕'}</span>
      </button>
    );
  };

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
    { key: 'objet', label: 'Objet', render: (r) => <p className="max-w-xs truncate text-slate-700">{r.objet || '—'}</p> },
    { key: 'demandeur', label: 'Demandeur', render: (r) => <span className="text-slate-700">{r.demandeur || '—'}</span> },
    { key: 'type_libelle', label: 'Type', render: (r) => r.type_libelle || '—' },
    { key: 'division_nom', label: 'Division', render: (r) => r.division_nom || '—' },
    {
      key: 'agent',
      label: 'Agent',
      render: (r) => [r.agent_nom, r.agent_prenom].filter(Boolean).join(' ') || '—',
    },
    {
      key: 'date_archivage',
      label: enTeteTri('archivage_desc', 'Archivé le'),
      render: (r) => formatDateString(r.date_archivage),
    },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        peutRestaurer ? (
          <Button size="sm" variant="outline" onClick={() => { setModal({ dossier: r }); setMotif(''); }}>
            Restaurer
          </Button>
        ) : null
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold text-slate-800">
          <Archive className="h-5 w-5 text-primary-600" /> Archives
        </h1>
        <p className="text-sm text-slate-500">
          Consultation des dossiers archivés. Un dossier archivé ne peut plus être
          modifié.
        </p>
      </div>

      {alertes.length > 0 && (
        <Alert type="warning" title="Fin de conservation de dossiers archivés">
          <ul className="mt-1 space-y-1">
            {alertes.map((a) => (
              <li key={a.type_code}>
                <strong>{a.type_libelle}</strong> : {a.dossiers} dossier(s) à conserver
                {' '}{a.duree_ans} ans, échéance {formatDateString(a.date_expiration)}
                {a.expire ? ' — DÉPASSÉE' : ` — dans ${a.jours_restants} jour(s)`}.
                Les dossiers Pension sont conservés 50 ans : conservation permanente,
                ils ne sont jamais purgés.
              </li>
            ))}
          </ul>
        </Alert>
      )}

      {stats && (
        <div className="grid gap-3 sm:grid-cols-3">
          <Card title="Dossiers archivés" className="p-4">
            <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
          </Card>
          <Card title="Durée moyenne de traitement" className="p-4">
            <p className="text-2xl font-bold text-slate-800">
              {stats.duree_moyenne === null ? '—' : `${stats.duree_moyenne} j`}
            </p>
            <p className="text-xs text-slate-500">de la réception à l’archivage</p>
          </Card>
          <Card title="Répartition" className="p-4">
            <ul className="space-y-1 text-xs text-slate-600">
              {(stats.par_division || []).map((d) => (
                <li key={d.division} className="flex justify-between gap-2">
                  <span className="truncate">{d.division}</span>
                  <span className="font-semibold">{d.total}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      <Card title="Rechercher dans les archives">
        <form onSubmit={appliquer} className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Input
                label="Recherche"
                value={criteres.q}
                onChange={set('q')}
                placeholder="N° dossier, nom, CIN, objet, mot-clé…"
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
            <Select label="Type de dossier" value={criteres.type_id} onChange={set('type_id')}>
              <option value="">Tous</option>
              {referentiel.types_dossiers.map((t) => (
                <option key={t.id} value={t.id}>{t.libelle}</option>
              ))}
            </Select>
            <Select label="Division" value={criteres.division_id} onChange={set('division_id')}>
              <option value="">Toutes</option>
              {referentiel.divisions.map((d) => (
                <option key={d.id} value={d.id}>{d.nom}</option>
              ))}
            </Select>
            <Select label="Année d'archivage" value={criteres.annee} onChange={set('annee')}>
              <option value="">Toutes</option>
              {annees.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </Select>
            <Select label="Agent responsable" value={criteres.agent_id} onChange={set('agent_id')}>
              <option value="">Tous</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>{a.nom} {a.prenom}</option>
              ))}
            </Select>
            <Input label="Du" type="date" value={criteres.date_debut} onChange={set('date_debut')} />
            <Input label="Au" type="date" value={criteres.date_fin} onChange={set('date_fin')} />
            <Input label="Demandeur" value={criteres.demandeur} onChange={set('demandeur')} placeholder="Rakoto" />
            <Input label="CIN" value={criteres.matricule} onChange={set('matricule')} placeholder="03541115" />
          </div>
        </form>

        {saves.length > 0 && (
          <div className="mt-4 border-t border-slate-100 pt-3">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <Bookmark className="h-3.5 w-3.5" /> Recherches enregistrées
            </p>
            <div className="flex flex-wrap gap-2">
              {saves.map((s) => (
                <span
                  key={s.nom}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 py-1 pl-3 pr-1 text-xs"
                >
                  <button type="button" onClick={() => chargerSave(s)} className="hover:underline">
                    {s.nom}
                  </button>
                  <button
                    type="button"
                    onClick={() => supprimerSave(s.nom)}
                    aria-label={`Supprimer la recherche ${s.nom}`}
                    className="rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-red-600"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </Card>

      {peutArchiver && dossiersArchivables.length > 0 && (
        <Card title="Dossiers clôturés prêts à être archivés">
          <ul className="divide-y divide-slate-100">
            {dossiersArchivables.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span className="text-sm text-slate-700">
                  <Link to={`/dossiers/${d.id}`} className="font-semibold text-primary-600 hover:underline">
                    {d.numero}
                  </Link>{' — '}
                  <span className="text-slate-500">{d.objet || 'Sans objet'}</span>
                </span>
                <Button size="sm" onClick={() => archiver(d)} loading={enCours}>
                  <FolderKanban className="h-3.5 w-3.5" /> Archiver
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card
        title={`Résultats (${total} dossier${total > 1 ? 's' : ''})`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={() => setModal('sauver')}>
              <BookmarkPlus className="h-3.5 w-3.5" /> Enregistrer
            </Button>
            <Button size="sm" variant="secondary" onClick={() => exporter('csv')} disabled={enCours || !total}>
              <FileText className="h-3.5 w-3.5" /> CSV
            </Button>
            <Button size="sm" variant="secondary" onClick={() => exporter('excel')} disabled={enCours || !total}>
              <FileSpreadsheet className="h-3.5 w-3.5" /> Excel
            </Button>
            <Button size="sm" variant="secondary" onClick={() => exporter('pdf')} disabled={enCours || !total}>
              <FileDown className="h-3.5 w-3.5" /> PDF
            </Button>
          </div>
        }
      >
        <Table columns={columns} data={donnees.archives} loading={loading} emptyLabel="Aucun dossier archivé ne correspond aux critères." />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <Select
            label="Trier par"
            value={criteres.tri || 'archivage_desc'}
            onChange={(e) => changerTri(e.target.value)}
            className="w-full sm:w-72"
          >
            {Object.entries(tris).map(([cle, libelle]) => (
              <option key={cle} value={cle}>{libelle}</option>
            ))}
          </Select>
          <Pagination pagination={pagination} />
        </div>
      </Card>

      {/* Enregistrement d'une recherche */}
      <Modal
        open={modal === 'sauver'}
        onClose={() => setModal(null)}
        title="Enregistrer cette recherche"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(null)}>Annuler</Button>
            <Button onClick={enregistrerSave} disabled={!nomSave.trim()}>
              <BookmarkPlus className="h-4 w-4" /> Enregistrer
            </Button>
          </>
        }
      >
        <Input
          label="Nom de la recherche"
          value={nomSave}
          onChange={(e) => setNomSave(e.target.value)}
          placeholder="Dossiers Visa 2026"
        />
        <p className="mt-2 text-xs text-slate-500">
          Les critères actuellement appliqués seront conservés sur ce poste.
        </p>
      </Modal>

      {/* Restauration : administrateur uniquement, motif obligatoire */}
      <Modal
        open={modal?.dossier && modal !== 'sauver'}
        onClose={() => setModal(null)}
        title="Restaurer le dossier archivé"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(null)}>Annuler</Button>
            <Button onClick={restaurer} loading={enCours} disabled={!motif.trim()}>
              <RotateCcw className="h-4 w-4" /> Restaurer
            </Button>
          </>
        }
      >
        {modal?.dossier && (
          <>
            <div className="mb-4 flex items-center gap-3 rounded-md border border-amber-200 bg-amber-50 p-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
              <p className="text-sm text-amber-800">
                <strong>{modal.dossier.numero}</strong> — le dossier reviendra au
                statut <strong>clôturé</strong>, et non en traitement.
              </p>
            </div>
            <Input
              label="Motif de restauration (obligatoire)"
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="Archivé par erreur"
            />
          </>
        )}
      </Modal>
    </div>
  );
}

export default ArchivesPage;
