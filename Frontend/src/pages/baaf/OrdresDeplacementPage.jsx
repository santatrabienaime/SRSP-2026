import { useState, useEffect, useCallback } from 'react';
import { MapPin, PenLine, Check, PlayCircle, XCircle, FileText, Clock } from 'lucide-react';
import { ordreDeplacementService } from '../../services/ordreDeplacementService.js';
import { agentService } from '../../services/agentService.js';
import { dossierService } from '../../services/dossierService.js';
import { useNotification } from '../../hooks/useNotification.js';
import { useAuth } from '../../hooks/useAuth.js';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Select } from '../../components/ui/Select.jsx';
import { Table } from '../../components/ui/Table.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import {
  DateInput,
  AmountInput,
  ReferenceInput,
  TextAreaInput,
  ObservationInput,
} from '../../components/fields/index.jsx';

/** Extrait la valeur numérique d'un montant formaté (« 1 500 000 »). */
const parseMontant = (v) =>
  Number(String(v || '').replace(/\D/g, '') || 0);

/**
 * Pièces de déplacement du Chef BAAF (3.9).
 *
 * Le circuit affiché suit exactement celui du serveur : ce qui est proposé ici
 * est ce qu'il acceptera. Les deux listes de transitions ne peuvent pas
 * diverger, sinon l'écran proposerait un bouton qui répond 409.
 */
const ETAPES_SUIVANTES = {
  REDIGE: [{ code: 'SOUMIS', label: 'Soumettre au Chef de Service', Icon: PenLine, permission: 'etablir_pieces_deplacement' }],
  SOUMIS: [{ code: 'SIGNE', label: 'Signer', Icon: PenLine, permission: 'signer_pieces_deplacement' }],
  SIGNE: [{ code: 'EXECUTEE', label: 'Déclarer exécutée', Icon: PlayCircle, permission: 'executer_pieces_deplacement' }],
  EXECUTEE: [{ code: 'CLOTUREE', label: 'Clôturer', Icon: Check, permission: 'executer_pieces_deplacement' }],
};

const LIBELLES_STATUT = {
  REDIGE: 'Établi', SOUMIS: 'Soumis', SIGNE: 'Signé',
  EXECUTEE: 'Exécutée', CLOTUREE: 'Clôturée', REJETEE: 'Annulée',
};

const COULEURS_STATUT = {
  REDIGE: 'border-slate-200 bg-slate-100 text-slate-700',
  SOUMIS: 'border-amber-200 bg-amber-50 text-amber-700',
  SIGNE: 'border-sky-200 bg-sky-50 text-sky-700',
  EXECUTEE: 'border-violet-200 bg-violet-50 text-violet-700',
  CLOTUREE: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  REJETEE: 'border-red-200 bg-red-50 text-red-700',
};

const VIDE = {
  type_id: '', dossier_id: '', agent_id: '',
  lieu_depart: 'Fianarantsoa', lieu_destination: '',
  date_depart: '', date_retour: '', objet: '',
  observations: '', montant_avance: '',
};

export function OrdresDeplacementPage() {
  const { toastError, toastSuccess } = useNotification();
  const { user } = useAuth();
  const [ordres, setOrdres] = useState([]);
  const [types, setTypes] = useState([]);
  const [agents, setAgents] = useState([]);
  const [dossiers, setDossiers] = useState([]);
  const [tdb, setTdb] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(VIDE);
  const [formOuvert, setFormOuvert] = useState(false);
  const [action, setAction] = useState(null);
  const [saisieAction, setSaisieAction] = useState({});
  const [filtre, setFiltre] = useState('');

  const recharger = useCallback(async () => {
    const [liste, tableau] = await Promise.all([
      ordreDeplacementService.lister(),
      ordreDeplacementService.tableauDeBord(),
    ]);
    setOrdres(Array.isArray(liste) ? liste : []);
    setTdb(tableau);
  }, []);

  useEffect(() => {
    let annule = false;
    (async () => {
      const [listeTypes, listeAgents, listeDossiers] = await Promise.all([
        ordreDeplacementService.types(),
        agentService.list({ limit: 100 }).catch(() => []),
        dossierService.list({ limit: 50 }).catch(() => []),
      ]);
      if (annule) return;
      setTypes(Array.isArray(listeTypes) ? listeTypes : []);
      setAgents(Array.isArray(listeAgents) ? listeAgents : []);
      setDossiers(Array.isArray(listeDossiers) ? listeDossiers : []);
      await recharger();
    })().catch(() => toastError('Chargement impossible.'))
      .finally(() => !annule && setLoading(false));
    return () => { annule = true; };
  }, [recharger]);

  const ouvrirCreation = () => { setForm(VIDE); setFormOuvert(true); };

  /** Setter pour les composants de champ (valeur formatée). */
  const setVal = (key) => (v) => setForm((f) => ({ ...f, [key]: v }));

  const soumettreCreation = async (e) => {
    e.preventDefault();
    try {
      const resultat = await ordreDeplacementService.etablir({
        ...form,
        type_id: Number(form.type_id),
        dossier_id: Number(form.dossier_id),
        agent_id: Number(form.agent_id),
        montant_avance:
          form.montant_avance === '' || parseMontant(form.montant_avance) === 0
            ? null
            : parseMontant(form.montant_avance),
      });
      toastSuccess(`Ordre ${resultat.numero} établi.`);
      setFormOuvert(false);
      await recharger();
    } catch (err) {
      toastError(err.response?.data?.message || 'Établissement impossible.');
    }
  };

  const lancerAction = (ordre, code) => {
    setAction({ ordre, code });
    setSaisieAction(code === 'SIGNE' ? { reference_signature: '' } : { motif_cloture: '' });
  };

  const confirmerAction = async () => {
    try {
      const complement = action.code === 'SIGNE'
        ? { reference_signature: saisieAction.reference_signature }
        : { motif_cloture: saisieAction.motif_cloture };
      await ordreDeplacementService.transitionner(action.ordre.id, action.code, complement);
      toastSuccess(action.code === 'SIGNE' ? 'Pièce signée.' : 'Étape enregistrée.');
      setAction(null);
      await recharger();
    } catch (err) {
      toastError(err.response?.data?.message || 'Opération impossible.');
    }
  };

  const annuler = async (ordre) => {
    const motif = window.prompt(`Motif de l'annulation de ${ordre.numero} :`);
    if (!motif) return;
    try {
      await ordreDeplacementService.annuler(ordre.id, motif);
      toastSuccess('Ordre annulé.');
      await recharger();
    } catch (err) {
      toastError(err.response?.data?.message || 'Annulation impossible.');
    }
  };

  const permissions = user?.permissions || [];
  const affichees = filtre
    ? ordres.filter((o) =>
      o.statut === filtre ||
      o.type_libelle?.toLowerCase().includes(filtre.toLowerCase()) ||
      o.numero?.toLowerCase().includes(filtre.toLowerCase()) ||
      o.agent_nom?.toLowerCase().includes(filtre.toLowerCase()))
    : ordres;

  const colonnes = [
    { key: 'numero', label: 'Numéro', render: (o) => (
      <div>
        <p className="font-medium text-slate-800">{o.numero}</p>
        <p className="text-xs text-slate-500">{o.type_libelle}</p>
      </div>
    ) },
    { key: 'agent_nom', label: 'Agent', render: (o) => (
      <div>
        <p className="text-slate-700">{o.agent_nom}</p>
        <p className="text-xs text-slate-500">{o.dossier_numero}</p>
      </div>
    ) },
    { key: 'lieu', label: 'Trajet', render: (o) => (
      <p className="flex items-center gap-1 text-slate-600">
        <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        <span className="truncate">{o.lieu_depart} → {o.lieu_destination}</span>
      </p>
    ) },
    { key: 'periode', label: 'Période', render: (o) => (
      <p className="flex items-center gap-1 whitespace-nowrap text-slate-600">
        <Clock className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        {o.date_depart} → {o.date_retour}
      </p>
    ) },
    { key: 'statut', label: 'Statut', render: (o) => (
      <Badge className={COULEURS_STATUT[o.statut] || COULEURS_STATUT.REDIGE}>
        {LIBELLES_STATUT[o.statut] || o.statut}
      </Badge>
    ) },
    { key: 'actions', label: '', render: (o) => {
      const etapes = (ETAPES_SUIVANTES[o.statut] || [])
        .filter((e) => permissions.includes(e.permission));
      const peutAnnuler = ['REDIGE', 'SOUMIS'].includes(o.statut)
        && permissions.includes('etablir_pieces_deplacement');
      if (!etapes.length && !peutAnnuler) return <span className="text-slate-300">—</span>;
      return (
        <div className="flex justify-end gap-1.5">
          {etapes.map(({ code, label, Icon }) => (
            <Button key={code} size="sm" variant={code === 'SIGNE' ? 'primary' : 'secondary'} onClick={() => lancerAction(o, code)}>
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Button>
          ))}
          {peutAnnuler && (
            <Button size="sm" variant="ghost" onClick={() => annuler(o)}>
              <XCircle className="h-3.5 w-3.5" />
              Annuler
            </Button>
          )}
        </div>
      );
    } },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Pièces de déplacement</h1>
          <p className="text-sm text-slate-500">
            Ordres de route, ordres de mission, autorisations de retrait de bon de caisse et notes d&apos;intérim.
          </p>
        </div>
        {permissions.includes('etablir_pieces_deplacement') && (
          <Button onClick={ouvrirCreation}>
            <FileText className="h-4 w-4" />
            Établir une pièce
          </Button>
        )}
      </div>

      {tdb && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card bodyClassName="p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Pièces établies</p>
            <p className="mt-1 text-2xl font-bold text-slate-800">{tdb.total}</p>
          </Card>
          <Card bodyClassName="p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">À signer</p>
            <p className="mt-1 text-2xl font-bold text-amber-600">{tdb.a_signer}</p>
            <p className="text-xs text-slate-500">Départ sous 7 jours</p>
          </Card>
          <Card bodyClassName="p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Signées non exécutées</p>
            <p className="mt-1 text-2xl font-bold text-red-600">{tdb.en_retard}</p>
            <p className="text-xs text-slate-500">Date de départ dépassée</p>
          </Card>
        </div>
      )}

      {ordres.length === 0 && !loading ? (
        <Card>
          <EmptyState
            title="Aucune pièce de déplacement"
            message="Les ordres de route et de mission établis par le Chef BAAF apparaîtront ici."
          />
        </Card>
      ) : (
        <Card
          title="Pièces"
          subtitle={`${affichees.length} sur ${ordres.length}`}
          actions={
            <Select value={filtre} onChange={(e) => setFiltre(e.target.value)} className="w-44">
              <option value="">Toutes</option>
              {Object.entries(LIBELLES_STATUT).map(([code, label]) => (
                <option key={code} value={code}>{label}</option>
              ))}
            </Select>
          }
        >
          <Table columns={colonnes} data={affichees} loading={loading} />
        </Card>
      )}

      {/* Établissement. Le dossier est obligatoire : une pièce de déplacement
          sans dossier ne peut être ni vérifiée ni rattachée au service qui l'a
          demandée. */}
      <Modal
        open={formOuvert}
        onClose={() => setFormOuvert(false)}
        title="Établir une pièce de déplacement"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setFormOuvert(false)}>Annuler</Button>
            <Button onClick={soumettreCreation}>Établir la pièce</Button>
          </>
        }
      >
        <form onSubmit={soumettreCreation} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Type de pièce"
              value={form.type_id}
              onChange={(e) => setForm({ ...form, type_id: e.target.value })}
              required
            >
              <option value="">— Choisir —</option>
              {types.map((t) => <option key={t.id} value={t.id}>{t.libelle}</option>)}
            </Select>
            <Select
              label="Dossier"
              value={form.dossier_id}
              onChange={(e) => setForm({ ...form, dossier_id: e.target.value })}
              required
            >
              <option value="">— Choisir —</option>
              {dossiers.map((d) => (
                <option key={d.id} value={d.id}>{d.numero} — {d.demandeur}</option>
              ))}
            </Select>
          </div>

          <Select
            label="Agent qui effectue le déplacement"
            value={form.agent_id}
            onChange={(e) => setForm({ ...form, agent_id: e.target.value })}
            required
          >
            <option value="">— Choisir —</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>{a.nom} {a.prenom}</option>
            ))}
          </Select>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Lieu de départ" maxLength={255} value={form.lieu_depart}
              onChange={(e) => setForm({ ...form, lieu_depart: e.target.value })} required />
            <Input label="Destination" maxLength={255} value={form.lieu_destination}
              onChange={(e) => setForm({ ...form, lieu_destination: e.target.value })} required />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <DateInput label="Date de départ" value={form.date_depart}
              onChange={(v) => setVal('date_depart')(v)} required />
            <DateInput label="Date de retour" value={form.date_retour}
              onChange={(v) => setVal('date_retour')(v)} required />
          </div>

          <Input label="Objet de la mission" maxLength={255} value={form.objet}
            onChange={(e) => setForm({ ...form, objet: e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1) })}
            placeholder="Ce que l'agent doit faire sur place" required />

          <AmountInput label="Avance demandée (ariary)"
            value={form.montant_avance}
            onChange={(v) => setVal('montant_avance')(v)}
            hint="Laisser vide si aucune avance n'est demandée." />

          <ObservationInput
            value={form.observations}
            onChange={(v) => setVal('observations')(v)}
          />
        </form>
      </Modal>

      {/* Signature et clôture : deux formulaires distincts, car les informations
          demandées n'ont rien de commun — une référence de signature n'a pas sa
          place dans un motif de clôture. */}
      <Modal
        open={action?.code === 'SIGNE'}
        onClose={() => setAction(null)}
        title="Signer la pièce"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAction(null)}>Annuler</Button>
            <Button onClick={confirmerAction}>Signer</Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Vous signes <strong>{action?.ordre?.numero}</strong> ({action?.ordre?.type_libelle}).
            La signature engage votre responsabilité.
          </p>
          <ReferenceInput
            label="Référence de signature"
            value={saisieAction.reference_signature || ''}
            onChange={(v) => setSaisieAction({ reference_signature: v })}
            placeholder="SIG-2026-0042"
            hint="Obligatoire, et unique : une pièce signée sans référence vérifiable ne prouve rien."
            required
          />
        </div>
      </Modal>

      <Modal
        open={action?.code === 'CLOTUREE'}
        onClose={() => setAction(null)}
        title="Clôturer la pièce"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAction(null)}>Annuler</Button>
            <Button onClick={confirmerAction}>Clôturer</Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Clôture de <strong>{action?.ordre?.numero}</strong> au retour de mission.
          </p>
          {action?.ordre?.montant_avance && (
            <Alert type="info" title="Avance accordée">
              Avance de {Number(action.ordre.montant_avance).toLocaleString('fr-FR')} ariary.
              Vérifiez le montant réellement dépensé avant de clôturer.
            </Alert>
          )}
          <TextAreaInput
            label="Motif de clôture"
            value={saisieAction.motif_cloture || ''}
            onChange={(v) => setSaisieAction({ motif_cloture: v })}
            maxLength={1000}
            placeholder="Ce qu'a donné la mission"
          />
        </div>
      </Modal>
    </div>
  );
}

export default OrdresDeplacementPage;
