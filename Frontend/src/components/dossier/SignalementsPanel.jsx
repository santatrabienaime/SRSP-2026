import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  TriangleAlert, CheckCircle2, XCircle, Clock, RefreshCw, User, Send,
} from 'lucide-react';
import { signalementService } from '../../services/signalementService.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useNotification } from '../../hooks/useNotification.js';
import { Card } from '../ui/Card.jsx';
import { Button } from '../ui/Button.jsx';
import { Badge } from '../ui/Badge.jsx';
import { Spinner } from '../ui/Spinner.jsx';
import { Alert } from '../ui/Alert.jsx';
import { Modal } from '../ui/Modal.jsx';
import { Select } from '../ui/Select.jsx';
import { TextAreaInput } from '../fields/index.jsx';
import { formatDateTime } from '../../utils/formatDate.js';

/**
 * Remontée des dossiers bloqués.
 *
 * Le panneau ne remplace pas le workflow : il porte la difficulté. Un dossier
 * peut être « en attente de complément » et signalé, puis repartir sans que
 * son statut ait bougé — c'est même le cas normal.
 *
 * Deux profils, deux gestes :
 *   - le chef de division constate et signale (signaler_dossier) ;
 *   - le chef de service prend en charge et referme (traiter_signalement).
 *
 * Les boutons n'apparaissent que pour qui peut réellement les actionner : un
 * bouton qui répond toujours 403 est une fausse promesse.
 */

const TYPES = {
  BLOCAGE: { label: 'Dossier bloqué', classe: 'border-amber-200 bg-amber-50 text-amber-700' },
  INTERLOCUTION: { label: 'Interlocution', classe: 'border-sky-200 bg-sky-50 text-sky-700' },
  ARBITRAGE: { label: 'Arbitrage', classe: 'border-violet-200 bg-violet-50 text-violet-700' },
};

const PRIORITES = {
  NORMALE: { label: 'Normale', classe: 'border-slate-200 bg-slate-50 text-slate-600' },
  HAUTE: { label: 'Haute', classe: 'border-amber-200 bg-amber-50 text-amber-700' },
  CRITIQUE: { label: 'Critique', classe: 'border-red-200 bg-red-50 text-red-700' },
};

const STATUTS = {
  OUVERT: { label: 'Ouvert', classe: 'border-amber-200 bg-amber-50 text-amber-700' },
  EN_COURS: { label: 'En cours', classe: 'border-sky-200 bg-sky-50 text-sky-700' },
  RESOLU: { label: 'Résolu', classe: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  REJETE: { label: 'Rejeté', classe: 'border-slate-200 bg-slate-100 text-slate-600' },
};

/** Identité affichable d'un auteur ou d'un traiteur. */
function identite(signalement) {
  const auteur = [signalement.auteur_nom, signalement.auteur_prenom]
    .filter(Boolean).join(' ').trim();
  return auteur || signalement.auteur_username || 'Agent inconnu';
}

function identiteTraiteur(signalement) {
  const traiteur = [signalement.traiteur_nom, signalement.traiteur_prenom]
    .filter(Boolean).join(' ').trim();
  return traiteur || signalement.traiteur_username || null;
}

/**
 * Une carte de signalement, partagée par le panneau du dossier et la file de
 * la hiérarchie. Les deux écrans montrent la même chose : ce serait une faute
 * de goût — et un risque de divergence — d'en écrire deux versions.
 */
export function CarteSignalement({
  signalement,
  avecDossier = false,
  peutTraiter = false,
  onPrendre,
  onRefermer,
  enCours = false,
}) {
  const type = TYPES[signalement.type] || TYPES.BLOCAGE;
  const priorite = PRIORITES[signalement.priorite] || PRIORITES.NORMALE;
  const statut = STATUTS[signalement.statut] || STATUTS.OUVERT;
  const traiteur = identiteTraiteur(signalement);
  const ouvert = signalement.statut === 'OUVERT' || signalement.statut === 'EN_COURS';

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge className={type.classe}>{type.label}</Badge>
        <Badge className={priorite.classe}>Priorité {priorite.label.toLowerCase()}</Badge>
        <Badge className={statut.classe} dot>{statut.label}</Badge>
        {avecDossier && (
          <Link
            to={`/dossiers/${signalement.dossier_id}`}
            className="ml-auto text-sm font-semibold text-primary-700 hover:underline"
          >
            {signalement.dossier_numero}
          </Link>
        )}
        {!avecDossier && (
          <span className="ml-auto text-xs text-slate-400">
            Signalement n° {signalement.id}
          </span>
        )}
      </div>

      {avecDossier && (
        <p className="mt-1.5 text-xs text-slate-500">
          {signalement.dossier_objet}
          {signalement.division_nom ? ` · ${signalement.division_nom}` : ''}
        </p>
      )}

      <p className="mt-3 whitespace-pre-line text-sm text-slate-700">
        {signalement.motif}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1">
          <User className="h-3.5 w-3.5" />
          {identite(signalement)}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          Ouvert le {formatDateTime(signalement.created_at)}
        </span>
        {traiteur && (
          <span>Pris en charge par {traiteur}</span>
        )}
      </div>

      {signalement.resolution && (
        <div
          className={`mt-3 rounded-md border px-3 py-2 text-sm ${
            signalement.statut === 'RESOLU'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-slate-200 bg-slate-50 text-slate-700'
          }`}
        >
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide">
            {signalement.statut === 'RESOLU'
              ? <CheckCircle2 className="h-3.5 w-3.5" />
              : <XCircle className="h-3.5 w-3.5" />}
            {signalement.statut === 'RESOLU' ? 'Résolution' : 'Motif du rejet'}
          </p>
          <p className="mt-1 whitespace-pre-line">{signalement.resolution}</p>
          {signalement.date_resolution && (
            <p className="mt-1 text-xs opacity-75">
              {formatDateTime(signalement.date_resolution)}
            </p>
          )}
        </div>
      )}

      {peutTraiter && ouvert && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
          {signalement.statut === 'OUVERT' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onPrendre?.(signalement)}
              disabled={enCours}
            >
              Prendre en charge
            </Button>
          )}
          <Button
            size="sm"
            variant="success"
            onClick={() => onRefermer?.(signalement, 'RESOLU')}
            disabled={enCours}
          >
            <CheckCircle2 className="h-4 w-4" /> Résoudre
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onRefermer?.(signalement, 'REJETE')}
            disabled={enCours}
          >
            <XCircle className="h-4 w-4" /> Rejeter
          </Button>
        </div>
      )}
    </article>
  );
}

/**
 * Modale de décision : résolution ou rejet, toujours écrits.
 *
 * Le texte est obligatoire — y compris pour un rejet. « Rejeté » sans motif ne
 * dit pas à l'auteur pourquoi sa difficulté n'a pas été retenue, et le
 * signalement devient une porte qui claque sans explication.
 */
export function ModaleResolution({ cible, onClose, onConfirm, enCours = false }) {
  const [resolution, setResolution] = useState('');

  useEffect(() => {
    Promise.resolve().then(() => setResolution(''));
  }, [cible]);

  if (!cible) return null;
  const rejet = cible.statut === 'REJETE';

  return (
    <Modal
      open
      onClose={() => !enCours && onClose?.()}
      title={rejet ? 'Rejeter le signalement' : 'Résoudre le signalement'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={enCours}>
            Annuler
          </Button>
          <Button
            variant={rejet ? 'danger' : 'success'}
            loading={enCours}
            disabled={resolution.trim().length < 10}
            onClick={() => onConfirm?.(resolution)}
          >
            {rejet ? 'Rejeter' : 'Résoudre'}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <p className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-600">
          {cible.signalement.dossier_numero} — {cible.signalement.motif}
        </p>
        <TextAreaInput
          label={rejet ? 'Motif du rejet' : 'Résolution'}
          required
          rows={4}
          maxLength={2000}
          value={resolution}
          onChange={setResolution}
          placeholder={
            rejet
              ? 'Pourquoi la difficulté n’est-elle pas retenue ?'
              : 'Ce qui a été décidé et fait pour débloquer le dossier.'
          }
          hint="10 caractères minimum : la décision doit pouvoir être relue."
        />
      </div>
    </Modal>
  );
}

/**
 * Panneau de la fiche dossier : ce qui a été signalé, et le geste pour le
 * faire.
 */
export function SignalementsPanel({ dossierId, onChanged }) {
  const { hasAnyPermission } = useAuth();
  const { toastSuccess, toastError } = useNotification();

  const [liste, setListe] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [formulaireOuvert, setFormulaireOuvert] = useState(false);
  const [form, setForm] = useState({ type: 'BLOCAGE', priorite: 'NORMALE', motif: '' });
  const [envoi, setEnvoi] = useState(false);
  const [cible, setCible] = useState(null);
  const [traitement, setTraitement] = useState(false);

  const peutSignaler = hasAnyPermission(['signaler_dossier']);
  const peutTraiter = hasAnyPermission(['traiter_signalement']);

  const charger = useCallback(async () => {
    if (!dossierId) return;
    try {
      setChargement(true);
      setErreur(null);
      setListe(await signalementService.parDossier(dossierId));
    } catch (e) {
      setErreur(e);
    } finally {
      setChargement(false);
    }
  }, [dossierId]);

  useEffect(() => { Promise.resolve().then(charger); }, [charger]);

  const signaler = async () => {
    if (form.motif.trim().length < 10) {
      toastError('Le motif doit être explicite (10 caractères minimum).');
      return;
    }
    setEnvoi(true);
    try {
      await signalementService.creer(dossierId, form);
      toastSuccess('Signalement transmis à la hiérarchie.');
      setForm({ type: 'BLOCAGE', priorite: 'NORMALE', motif: '' });
      setFormulaireOuvert(false);
      await charger();
      onChanged?.();
    } catch (e) {
      toastError(e.message);
    } finally {
      setEnvoi(false);
    }
  };

  const prendre = async (signalement) => {
    setTraitement(true);
    try {
      await signalementService.prendre(signalement.id);
      toastSuccess('Signalement pris en charge.');
      await charger();
      onChanged?.();
    } catch (e) {
      toastError(e.message);
    } finally {
      setTraitement(false);
    }
  };

  const refermer = async (resolution) => {
    if (!cible) return;
    setTraitement(true);
    try {
      await signalementService.resoudre(cible.signalement.id, {
        statut: cible.statut,
        resolution,
      });
      toastSuccess(cible.statut === 'REJETE' ? 'Signalement rejeté.' : 'Signalement résolu.');
      setCible(null);
      await charger();
      onChanged?.();
    } catch (e) {
      toastError(e.message);
    } finally {
      setTraitement(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card
        title="Signalements"
        subtitle="Difficultés remontées à la hiérarchie pour ce dossier"
        actions={
          <Button variant="ghost" size="sm" onClick={charger} title="Recharger">
            <RefreshCw className="h-4 w-4" />
          </Button>
        }
      >
        {peutSignaler && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50/60 p-3">
            {!formulaireOuvert ? (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-amber-800">
                  Le dossier est bloqué ou demande un arbitrage ? Remontez-le.
                </p>
                <Button size="sm" variant="outline" onClick={() => setFormulaireOuvert(true)}>
                  <TriangleAlert className="h-4 w-4" /> Signaler un blocage
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Select
                    label="Nature"
                    value={form.type}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  >
                    {Object.entries(TYPES).map(([code, t]) => (
                      <option key={code} value={code}>{t.label}</option>
                    ))}
                  </Select>
                  <Select
                    label="Priorité"
                    value={form.priorite}
                    onChange={(e) => setForm((f) => ({ ...f, priorite: e.target.value }))}
                  >
                    {Object.entries(PRIORITES).map(([code, p]) => (
                      <option key={code} value={code}>{p.label}</option>
                    ))}
                  </Select>
                </div>
                <TextAreaInput
                  label="Motif"
                  required
                  rows={3}
                  maxLength={2000}
                  value={form.motif}
                  onChange={(motif) => setForm((f) => ({ ...f, motif }))}
                  placeholder="La pièce manquante, le service qui ne répond pas, le point de désaccord…"
                  hint="Ce texte est transmis tel quel au chef de service."
                />
                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm" onClick={signaler} loading={envoi}>
                    <Send className="h-4 w-4" /> Transmettre
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setFormulaireOuvert(false)}
                    disabled={envoi}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {chargement ? (
          <Spinner className="py-6" />
        ) : erreur ? (
          <Alert type="warning" title="Signalements indisponibles">
            {erreur.message}
          </Alert>
        ) : liste.length === 0 ? (
          <p className="rounded-md bg-slate-50 px-3 py-4 text-sm text-slate-500">
            Aucun signalement sur ce dossier.
            {!peutSignaler && ' Seuls les chefs de division peuvent en ouvrir un.'}
          </p>
        ) : (
          <div className="space-y-3">
            {liste.map((signalement) => (
              <CarteSignalement
                key={signalement.id}
                signalement={signalement}
                peutTraiter={peutTraiter}
                onPrendre={prendre}
                onRefermer={(s, statut) => setCible({ signalement: s, statut })}
                enCours={traitement}
              />
            ))}
          </div>
        )}
      </Card>

      <ModaleResolution
        cible={cible}
        enCours={traitement}
        onClose={() => setCible(null)}
        onConfirm={refermer}
      />
    </div>
  );
}

export default SignalementsPanel;
