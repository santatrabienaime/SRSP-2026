import { useState, useEffect, useCallback } from 'react';
import { KeyRound, Copy, Check, Ban, RefreshCw, Clock, ShieldCheck } from 'lucide-react';
import { reinitialisationService } from '../../services/reinitialisationService.js';
import { useNotification } from '../../hooks/useNotification.js';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Table } from '../../components/ui/Table.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.jsx';
import { TextAreaInput } from '../../components/fields/index.jsx';
import { formatDateTime } from '../../utils/formatDate.js';
import { AnimatedCard } from '../../components/ui/AnimatedCard.jsx';

/**
 * Demandes de réinitialisation de mot de passe.
 *
 * L'administrateur vérifie l'identité du demandeur, puis délivre un **code
 * à six chiffres**. Le code s'affiche **une seule fois** : il n'est pas
 * stocké en clair, il ne peut donc pas être reconsulté. L'administrateur le
 * remet à l'agent par le moyen qu'il juge approprié — téléphone, note de
 * service, remise en main propre.
 *
 * Ce que l'administrateur ne fait **pas** : choisir le mot de passe de
 * l'agent. Il lève le verrou, rien de plus. L'agent garde la main sur son
 * mot de passe, et personne ne le voit en clair.
 */

/** États des demandes et leur présentation. */
const STATUTS = {
  EN_ATTENTE: {
    label: 'En attente',
    classe: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  CODE_GENERE: {
    label: 'Code délivré',
    classe: 'border-sky-200 bg-sky-50 text-sky-700',
  },
  UTILISE: {
    label: 'Utilisée',
    classe: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  ANNULE: {
    label: 'Annulée',
    classe: 'border-slate-200 bg-slate-100 text-slate-600',
  },
  EXPIRE: {
    label: 'Expirée',
    classe: 'border-slate-200 bg-slate-100 text-slate-600',
  },
};

/** Motifs de la demande, dans l'ordre de gravité décroissante. */
const FILTRES = [
  { value: '', label: 'Toutes les demandes' },
  { value: 'EN_ATTENTE', label: 'En attente' },
  { value: 'CODE_GENERE', label: 'Code délivré' },
  { value: 'UTILISE', label: 'Utilisées' },
  { value: 'ANNULE', label: 'Annulées' },
];

export function ReinitialisationsPage() {
  const { toastSuccess, toastError } = useNotification();
  const [demandes, setDemandes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [filtre, setFiltre] = useState('');

  const [aTraiter, setATraiter] = useState(null);
  const [motif, setMotif] = useState('');
  const [code, setCode] = useState(null);
  const [copie, setCopie] = useState(false);
  const [enCours, setEnCours] = useState(false);
  const [aAnnuler, setAAnnuler] = useState(null);

  const charger = useCallback(async () => {
    setChargement(true);
    try {
      const liste = await reinitialisationService.list(
        filtre ? { statut: filtre } : undefined
      );
      setDemandes(Array.isArray(liste) ? liste : []);
    } catch (err) {
      toastError(err.message);
    } finally {
      setChargement(false);
    }
  }, [filtre, toastError]);

  useEffect(() => { Promise.resolve().then(charger); }, [charger]);

  const genererCode = async () => {
    if (!aTraiter) return;
    setEnCours(true);
    try {
      const resultat = await reinitialisationService.genererCode(aTraiter.id, motif || undefined);
      setCode({ ...resultat, demande: aTraiter });
      setATraiter(null);
      setMotif('');
      toastSuccess('Code délivré. Communiquez-le au demandeur.');
      await charger();
    } catch (err) {
      toastError(err.message);
    } finally {
      setEnCours(false);
    }
  };

  const annuler = async () => {
    if (!aAnnuler) return;
    setEnCours(true);
    try {
      await reinitialisationService.annuler(aAnnuler.id, motif || undefined);
      toastSuccess('Demande annulée.');
      setAAnnuler(null);
      setMotif('');
      await charger();
    } catch (err) {
      toastError(err.message);
    } finally {
      setEnCours(false);
    }
  };

  const copierCode = async () => {
    if (!code?.code) return;
    try {
      await navigator.clipboard.writeText(code.code);
      setCopie(true);
      setTimeout(() => setCopie(false), 2500);
    } catch {
      /* Le presse-papiers peut être refusé : le code reste affiché. */
    }
  };

  const enAttente = demandes.filter(
    (d) => d.statut === 'EN_ATTENTE' || d.statut === 'CODE_GENERE'
  ).length;

  const colonnes = [
    {
      key: 'created_at',
      label: 'Demandée le',
      render: (r) => (
        <span className="whitespace-nowrap text-slate-600">
          {formatDateTime(r.created_at)}
        </span>
      ),
    },
    {
      key: 'username',
      label: 'Compte',
      render: (r) => (
        <div>
          <p className="font-medium text-slate-700">{r.username}</p>
          <p className="text-xs text-slate-400">{r.email}</p>
        </div>
      ),
    },
    {
      key: 'division_nom',
      label: 'Division',
      render: (r) => (
        <div>
          <p className="text-slate-600">{r.division_nom || '—'}</p>
          {r.agent_nom && (
            <p className="text-xs text-slate-400">
              {r.agent_prenom} {r.agent_nom}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'statut',
      label: 'État',
      render: (r) => {
        const s = STATUTS[r.statut] || { label: r.statut, classe: 'border-slate-200 bg-slate-50 text-slate-600' };
        return (
          <div className="space-y-1">
            <Badge className={s.classe}>{s.label}</Badge>
            {r.statut === 'CODE_GENERE' && r.expire_le && (
              <p className="flex items-center gap-1 text-[11px] text-slate-400">
                <Clock className="h-3 w-3" />
                expire le {formatDateTime(r.expire_le)}
              </p>
            )}
          </div>
        );
      },
    },
    {
      key: 'tentatives',
      label: 'Tentatives',
      render: (r) => (
        <span className="text-slate-600">{r.tentatives ?? 0}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => {
        if (r.statut !== 'EN_ATTENTE' && r.statut !== 'CODE_GENERE') {
          return <span className="text-xs text-slate-400">—</span>;
        }
        return (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setATraiter(r)}>
              <KeyRound className="h-3.5 w-3.5" /> Code
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAAnnuler(r)}
              className="text-red-600 hover:bg-red-50"
              title="Annuler la demande"
            >
              <Ban className="h-3.5 w-3.5" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <AnimatedCard
      title="Réinitialisation de mot de passe"
      subtitle="Demandes de réinitialisation en attente et historique des codes délivrés."
      delay={0}
    >
      <div className="space-y-5">
        <Alert type="info" title="Comment procéder">
          Vérifiez l&apos;identité du demandeur, délivrez le code, puis
          communiquez-le lui. Le code est valable quinze minutes et ne sert
          qu&apos;une fois. Vous ne choisissez <strong>pas</strong> son mot de
          passe : l&apos;agent le saisit lui-même.
        </Alert>

        <div className="flex flex-wrap items-center gap-3">
          <div className="w-full sm:w-64">
            <label
              htmlFor="filtre-statut"
              className="mb-1 block text-xs font-medium text-slate-500"
            >
              Filtrer
            </label>
            <select
              id="filtre-statut"
              value={filtre}
              onChange={(e) => setFiltre(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
            >
              {FILTRES.map((f) => (
                <option key={f.value || 'toutes'} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
          {enAttente > 0 && (
            <Badge className="border-amber-200 bg-amber-50 text-amber-700">
              {enAttente} demande(s) à traiter
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={charger} className="ml-auto">
            <RefreshCw className="h-4 w-4" /> Actualiser
          </Button>
        </div>

        <Card title="Demandes">
          {chargement ? (
            <div className="flex min-h-[30vh] items-center justify-center">
              <Spinner label="Chargement…" />
            </div>
          ) : (
            <Table
              columns={colonnes}
              data={demandes}
              emptyLabel="Aucune demande de réinitialisation."
            />
          )}
        </Card>
      </div>

      {/* ── Délivrance du code ─────────────────────────────────────────── */}
      <Modal
        open={aTraiter !== null}
        onClose={() => !enCours && setATraiter(null)}
        title="Délivrer un code de réinitialisation"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setATraiter(null)} disabled={enCours}>
              Annuler
            </Button>
            <Button onClick={genererCode} loading={enCours}>
              <KeyRound className="h-4 w-4" /> Délivrer le code
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Un code de six chiffres sera généré pour le compte
            <strong> {aTraiter?.username}</strong>
            {aTraiter?.email ? ` (${aTraiter.email})` : ''}.
          </p>
          <TextAreaInput
            label="Motif (facultatif)"
            rows={2}
            value={motif}
            onChange={setMotif}
            maxLength={500}
            placeholder="Ex. pièce d'identité présentée au guichet, vérification par téléphone…"
            hint="Le motif est conservé dans le journal d'audit."
          />
          <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Le compte est déverrouillé au passage : c&apos;est souvent la
            raison de la demande.
          </p>
        </div>
      </Modal>

      {/* ── Affichage du code, une seule fois ─────────────────────────── */}
      <Modal
        open={code !== null}
        onClose={() => setCode(null)}
        title="Code de réinitialisation"
        size="sm"
        footer={
          <Button onClick={() => setCode(null)}>
            <Check className="h-4 w-4" /> J&apos;ai communiqué le code
          </Button>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Communiquez ce code au demandeur
            {code?.compte?.username ? ` (${code.compte.username})` : ''}. Il est
            valable {code?.duree_minutes ?? 15} minutes et ne sert qu&apos;une
            fois.
          </p>

          <div className="flex items-center justify-center gap-3 rounded-lg border border-slate-200 bg-slate-50 py-5">
            <span className="font-mono text-3xl font-bold tracking-[0.35em] text-slate-800">
              {code?.code}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={copierCode}
              title="Copier le code"
            >
              {copie ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>

          <p className="flex items-start gap-1.5 rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-500">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              Ce code n&apos;est pas conservé en clair : il ne sera plus
              affiché. S&apos;il est perdu, délivrez-en un nouveau.
            </span>
          </p>
        </div>
      </Modal>

      {/* ── Annulation ─────────────────────────────────────────────────── */}
      <ConfirmDialog
        open={aAnnuler !== null}
        onClose={() => !enCours && setAAnnuler(null)}
        onConfirm={annuler}
        loading={enCours}
        danger
        title="Annuler la demande"
        message={`Annuler la demande de ${aAnnuler?.username || ''} ? Le demandeur devra en déposer une nouvelle.`}
        confirmLabel="Annuler la demande"
      />
    </AnimatedCard>
  );
}

export default ReinitialisationsPage;
