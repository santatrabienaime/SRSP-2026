import { useState, useEffect, useCallback } from 'react';
import { ScrollText, Plus, Search, Ban } from 'lucide-react';
import { acteService } from '../../services/acteService.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { Table } from '../../components/ui/Table.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Select } from '../../components/ui/Select.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Alert } from '../../components/ui/Alert.jsx';

const anneeCourante = new Date().getFullYear();
const aujourdhui = new Date().toISOString().slice(0, 10);

export function ChronologieActesPage() {
  const { hasPermission } = useAuth();
  const [annee, setAnnee] = useState(anneeCourante);
  const [registre, setRegistre] = useState([]);
  const [types, setTypes] = useState([]);
  const [typeId, setTypeId] = useState('');
  const [recherche, setRecherche] = useState('');
  const [actes, setActes] = useState([]);
  const [total, setTotal] = useState(0);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [formulaire, setFormulaire] = useState(false);
  const [annulation, setAnnulation] = useState(null);
  const rechercheDifferee = useDebounce(recherche, 350);

  const peutEcrire = hasPermission('gerer_chronologie_actes');

  const charger = useCallback(async () => {
    try {
      setChargement(true);
      setErreur(null);
      const [reg, acts, typ] = await Promise.all([
        acteService.chronologie(annee),
        acteService.list({
          annee,
          type_acte_id: typeId || undefined,
          recherche: rechercheDifferee || undefined,
          limite: 200,
        }),
        acteService.types(),
      ]);
      setRegistre(reg.familles || []);
      setActes(acts.lignes || []);
      setTotal(acts.total || 0);
      setTypes(typ || []);
    } catch (e) {
      setErreur(e);
    } finally {
      setChargement(false);
    }
  }, [annee, typeId, rechercheDifferee]);

  useEffect(() => { charger(); }, [charger]);

  const familleCourante = types.find((t) => String(t.id) === String(typeId));
  const prefixe = familleCourante
    ? `${familleCourante.prefixe}-${annee}-`
    : `${annee}`;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Chronologie des actes</h1>
          <p className="text-sm text-slate-500">
            Registre des notes, lettres et bons d&apos;entrée. Un numéro attribué
            n&apos;est jamais réattribué : un acte annulé reste au registre, barré.
          </p>
        </div>
        {peutEcrire && (
          <Button onClick={() => setFormulaire(true)}>
            <Plus size={16} /> Enregistrer un acte
          </Button>
        )}
      </div>

      {erreur && (
        <Alert type="error">
          {erreur.response?.data?.message || 'Le registre n’a pas pu être chargé.'}
        </Alert>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {registre.map((f) => (
          <div
            key={f.type_acte_id}
            className="rounded-lg border border-slate-200 bg-white p-4"
          >
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold text-slate-800">{f.libelle}</span>
              <span className="font-mono text-xs text-slate-400">{f.prefixe}</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-slate-800">{f.total}</p>
            <p className="text-xs text-slate-500">
              {f.total === 0
                ? `aucun acte en ${f.annee}`
                : `dernier n° ${f.prefixe}-${f.annee}-${String(f.dernier_numero).padStart(6, '0')}`}
            </p>
            {f.trous.length > 0 && (
              <p className="mt-2 rounded bg-amber-50 px-2 py-1 text-xs text-amber-800">
                Numéro manquant : {f.trous.map((n) => String(n).padStart(6, '0')).join(', ')}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <Input
          label="Recherche"
          className="min-w-[220px] flex-1"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Numéro, objet ou destinataire"
        />
        <Select
          label="Année"
          className="w-32"
          value={annee}
          onChange={(e) => setAnnee(Number(e.target.value))}
        >
          {[anneeCourante, anneeCourante - 1, anneeCourante - 2].map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </Select>
        <Select
          label="Type d’acte"
          className="w-56"
          value={typeId}
          onChange={(e) => setTypeId(e.target.value)}
        >
          <option value="">Tous les types</option>
          {types.map((t) => (
            <option key={t.id} value={t.id}>{t.libelle}</option>
          ))}
        </Select>
      </div>

      <Table
        loading={chargement}
        data={actes}
        emptyLabel="Aucun acte à ce numéro"
        columns={[
          {
            key: 'numero',
            label: 'N° acte',
            render: (a) => (
              <span className="font-mono text-xs font-semibold text-slate-700">
                {a.numero}
              </span>
            ),
          },
          { key: 'date_acte', label: 'Date de l’acte', render: (a) => a.date_acte },
          { key: 'type_libelle', label: 'Type', render: (a) => a.type_libelle },
          { key: 'objet', label: 'Objet', render: (a) => a.objet },
          {
            key: 'destinataire',
            label: 'Destinataire',
            render: (a) => a.destinataire || '—',
          },
          {
            key: 'dossier_numero',
            label: 'Dossier',
            render: (a) => a.dossier_numero || '—',
          },
          {
            key: 'statut',
            label: 'Statut',
            render: (a) => (
              <span
                className={
                  a.statut === 'ANNULE'
                    ? 'text-xs font-semibold text-slate-400 line-through'
                    : 'text-xs font-semibold text-emerald-700'
                }
              >
                {a.statut === 'ANNULE' ? 'Annulé' : 'Enregistré'}
              </span>
            ),
          },
          ...(peutEcrire
            ? [{
              key: 'actions',
              label: '',
              render: (a) => (a.statut === 'ENREGISTRE' ? (
                <button
                  type="button"
                  onClick={() => setAnnulation(a)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:underline"
                >
                  <Ban size={14} /> Annuler
                </button>
              ) : null),
            }]
            : []),
        ]}
      />

      <p className="text-xs text-slate-500">
        {total} acte(s) au registre pour {annee}
        {typeId ? `, type ${familleCourante?.libelle || ''}` : ''}.
        Un acte se numérote {prefixe}…
      </p>

      <FormulaireActe
        ouvert={formulaire}
        types={types}
        onClose={() => setFormulaire(false)}
        onEnregistre={charger}
      />

      <Modal
        open={Boolean(annulation)}
        onClose={() => setAnnulation(null)}
        title={`Annuler l’acte ${annulation?.numero || ''}`}
        size="sm"
        footer={<AnnulationActe acte={annulation} onTermine={() => { setAnnulation(null); charger(); }} />}
      >
        <p className="text-sm text-slate-600">
          Le numéro reste au registre : il ne sera pas réattribué. L&apos;acte
          apparaîtra barré, avec le motif de l&apos;annulation.
        </p>
        <p className="mt-2 text-sm font-medium text-slate-800">{annulation?.objet}</p>
      </Modal>
    </div>
  );
}

function FormulaireActe({ ouvert, types, onClose, onEnregistre }) {
  const [typeActeId, setTypeActeId] = useState('');
  const [dateActe, setDateActe] = useState(aujourdhui);
  const [objet, setObjet] = useState('');
  const [destinataire, setDestinataire] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    if (!ouvert) return;
    setTypeActeId(types[0] ? String(types[0].id) : '');
    setDateActe(aujourdhui);
    setObjet('');
    setDestinataire('');
    setErreur(null);
  }, [ouvert, types]);

  const enregistrer = async (e) => {
    e.preventDefault();
    try {
      setEnvoi(true);
      setErreur(null);
      await acteService.create({
        type_acte_id: Number(typeActeId),
        date_acte: dateActe,
        objet,
        destinataire: destinataire || null,
      });
      onEnregistre();
      onClose();
    } catch (err) {
      setErreur(err.response?.data?.message || "L'acte n'a pas pu être enregistré.");
    } finally {
      setEnvoi(false);
    }
  };

  if (!ouvert) return null;

  return (
    <Modal open={ouvert} onClose={onClose} title="Enregistrer un acte">
      <form onSubmit={enregistrer} className="space-y-3">
        {erreur && <Alert type="error">{erreur}</Alert>}
        <Select
          label="Type d’acte"
          required
          value={typeActeId}
          onChange={(e) => setTypeActeId(e.target.value)}
        >
          {types.map((t) => (
            <option key={t.id} value={t.id}>{t.libelle} ({t.prefixe})</option>
          ))}
        </Select>
        <Input
          label="Date de l’acte"
          type="date"
          required
          value={dateActe}
          onChange={(e) => setDateActe(e.target.value)}
        />
        <Input
          label="Objet"
          required
          value={objet}
          onChange={(e) => setObjet(e.target.value)}
          placeholder="Objet de l’acte"
        />
        <Input
          label="Destinataire"
          value={destinataire}
          onChange={(e) => setDestinataire(e.target.value)}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>Annuler</Button>
          <Button type="submit" loading={envoi}>
            <ScrollText size={16} /> Enregistrer au registre
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function AnnulationActe({ acte, onTermine }) {
  const [motif, setMotif] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState(null);

  const annuler = async () => {
    try {
      setEnvoi(true);
      setErreur(null);
      await acteService.annuler(acte.id, motif);
      onTermine();
    } catch (err) {
      setErreur(err.response?.data?.message || "L'acte n'a pas pu être annulé.");
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div className="w-full space-y-3">
      {erreur && <Alert type="error">{erreur}</Alert>}
      <Input
        label="Motif de l’annulation"
        required
        value={motif}
        onChange={(e) => setMotif(e.target.value)}
        placeholder="Ce qui a motivé l’annulation"
      />
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onTermine}>Fermer</Button>
        <Button variant="danger" onClick={annuler} loading={envoi} disabled={motif.trim().length < 3}>
          Annuler l’acte
        </Button>
      </div>
    </div>
  );
}

export default ChronologieActesPage;
