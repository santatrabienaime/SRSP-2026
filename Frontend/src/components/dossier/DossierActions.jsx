import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Pencil, Send, UserCheck, ClipboardCheck, ShieldCheck, PenLine, Lock, Archive,
  CheckCircle2, Trash2, FileQuestion, ShieldAlert,
} from 'lucide-react';
import { dossierService } from '../../services/dossierService.js';
import { divisionService } from '../../services/divisionService.js';
import { agentService } from '../../services/agentService.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useNotification } from '../../hooks/useNotification.js';
import { Button } from '../ui/Button.jsx';
import { Select } from '../ui/Select.jsx';
import { TextAreaInput, ReferenceInput } from '../fields/index.jsx';
import { Modal } from '../ui/Modal.jsx';
import { ConfirmDialog } from '../ui/ConfirmDialog.jsx';
import { STATUTS } from '../../config/constants.js';

/**
 * Actions métier disponibles selon le statut du dossier et les permissions
 * de l'utilisateur connecté (workflow v2.0).
 *
 * Trois règles gouvernent ce composant :
 *
 *  1. Une action n'est proposée que si elle aboutira. Un bouton qui répond
 *     toujours « 403 » apprend à l'agent à ignorer les boutons.
 *  2. Toute décision qui refuse, renvoie ou supprime exige un motif : le
 *     motif est ce qui dit à l'intéressé ce qu'il doit faire.
 *  3. La signature VISA appartient au Chef de Service. Le contrôle est fait
 *     par le serveur (rôle strict), l'écran ne montre donc l'action qu'au
 *     profil concerné, et rappelle que la vérification de division n'en
 *     tient pas lieu.
 */

/** Statuts depuis lesquels le dossier peut encore être supprimé. */
const STATUTS_SUPPRESSIBLES = [STATUTS.RECU, STATUTS.ENREGISTRE, STATUTS.ORIENTE];

/** Champs VISA obligatoires au moment de la validation. */
const CHAMPS_VISA = [
  ['reference_visa', 'référence VISA'],
  ['date_heure_reception', 'date et heure de réception'],
  ['origine_presentateur', 'origine / présentateur'],
  ['comptable_presentateur', 'comptable présentateur'],
  ['objet', 'objet'],
  ['type_acte', "type d'acte"],
  ['annee_reference', 'année de référence'],
  ['verificateur_id', 'vérificateur'],
];

export function DossierActions({ dossier, onDone, onDeleted, actionDemandee, onActionDemandee }) {
  const { hasPermission, hasAnyPermission, isRole } = useAuth();
  const { toastSuccess, toastError } = useNotification();

  const [divisions, setDivisions] = useState([]);
  const [agents, setAgents] = useState([]);
  /* L'action ouverte peut être demandée de l'extérieur — c'est le bloc
     « À faire ensuite » qui l'ouvre. Le composant reste maître de son
     état quand personne ne le pilote. */
  const [actionInterne, setActionInterne] = useState(null); // 'orienter' | 'affecter' | ...
  const [payload, setPayload] = useState({});
  const [confirmAction, setConfirmAction] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const action = actionDemandee !== undefined ? actionDemandee : actionInterne;
  const setAction = (valeur) => {
    if (onActionDemandee) onActionDemandee(valeur);
    else setActionInterne(valeur);
  };

  /* Une action ouverte de l'extérieur repart d'un formulaire vierge : les
     valeurs d'une action précédente ne doivent pas fuiter dans la nouvelle. */
  useEffect(() => {
    if (actionDemandee) setPayload({});
  }, [actionDemandee]);
  const [resume, setResume] = useState(null);

  const statut = dossier?.statut_code;
  const estVisa = dossier?.type_code === 'VISA';

  useEffect(() => {
    divisionService
      .list()
      .then((d) => setDivisions(Array.isArray(d) ? d : []))
      .catch(() => {});
    agentService
      .list()
      .then((a) => setAgents(Array.isArray(a) ? a : []))
      .catch(() => {});
  }, []);

  /* Résumé du dépouillement : il permet d'afficher, avant la validation, ce
     qui manque. Un chef de division ne doit pas découvrir l'incomplétude
     seulement après avoir cliqué sur « Valider » : le résumé est donc chargé
     pour tout profil qui peut décider, pas seulement pour le chef de service
     titulaire de la dérogation. */
  const peutDeroger = hasPermission('deroger_validation');
  const peutDecider = hasAnyPermission(['verifier_dossier', 'valider_dossier', 'deroger_validation']);
  const dossierId = dossier?.id;
  const [resumeChargement, setResumeChargement] = useState(false);
  const [resumeErreur, setResumeErreur] = useState(null);
  const chargerResume = useCallback(async () => {
    if (!dossierId || !peutDecider) return;
    setResumeChargement(true);
    setResumeErreur(null);
    try {
      const data = await dossierService.getDepouillement(dossierId);
      setResume(data?.resume || null);
    } catch (e) {
      setResume(null);
      setResumeErreur(e);
    } finally {
      setResumeChargement(false);
    }
  }, [dossierId, peutDecider]);

  useEffect(() => { Promise.resolve().then(chargerResume); }, [chargerResume]);

  /* Les pièces ont pu être contrôlées dans l'onglet voisin depuis le premier
     chargement : à l'ouverture de la décision, on relit le résumé pour ne pas
     afficher un état périmé. */
  useEffect(() => {
    if (action === 'valider') Promise.resolve().then(chargerResume);
  }, [action, chargerResume]);

  if (!dossier) return null;

  /** Exécute une action, déclenche le rechargement et du feedback. */
  const run = async (fn, successMsg) => {
    setSubmitting(true);
    try {
      await fn();
      toastSuccess(successMsg);
      setAction(null);
      setConfirmAction(null);
      setPayload({});
      onDone?.();
    } catch (err) {
      toastError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const actions = [];
  const can = (p) => hasPermission(p);

  /* Un brouillon n'est pas dans le circuit : la seule action de workflow
     possible est sa publication. */
  if (statut === STATUTS.BROUILLON) {
    actions.push({
      key: 'publier',
      label: 'Publier le brouillon',
      icon: Send,
      variant: 'primary',
    });
  }

  /* Un dossier VISA ne se clôture pas : son circuit va de « Signé » à
     « À archiver ». La clôture intermédiaire n'existe que pour les autres
     divisions. */
  const peutCloturer = !estVisa && statut === STATUTS.SIGNE && can('cloturer_dossier');
  const peutArchiver = estVisa
    ? [STATUTS.SIGNE, STATUTS.CLOTURE].includes(statut) && can('archiver_dossier')
    : statut === STATUTS.CLOTURE && can('archiver_dossier');

  const canEdit = can('edit_dossier') && !['CLOTURE', 'ARCHIVE'].includes(statut);

  // Orientation (§14.2 : Secrétaire — ENREGISTRE/ORIENTE → division)
  if ((statut === STATUTS.ENREGISTRE || statut === STATUTS.ORIENTE) && can('orienter_dossier')) {
    actions.push({
      key: 'orienter',
      label: 'Orienter vers une division',
      icon: Send,
      variant: 'secondary',
    });
  }
  /* Affectation (§14.2 : Chef de Division — → AFFECTE).
     Le dossier arrive normalement déjà affecté à l'agent de traitement de sa
     division. Le bouton n'est donc plus une étape du parcours courant, mais une
     REGISTRE : il change l'agent, et le libellé doit le dire, sinon le chef
     croirait que le dossier attend encore d'être affecté. */
  if ([STATUTS.ENREGISTRE, STATUTS.ORIENTE, STATUTS.AFFECTE, STATUTS.CORRECTION_DEMANDEE, STATUTS.EN_ATTENTE_COMPLEMENT].includes(statut) && can('affecter_dossier')) {
    const dejaAffecte = Boolean(dossier.agent_responsable_id);
    actions.push({
      key: 'affecter',
      label: dejaAffecte ? 'Changer l\'agent affecté' : 'Affecter à un agent',
      icon: UserCheck,
      variant: 'secondary',
    });
  }
  // Traitement (§14.2 : Vérificateur / Liquidateur / Chargé)
  if ([STATUTS.AFFECTE, STATUTS.CORRECTION_DEMANDEE, STATUTS.EN_ATTENTE_COMPLEMENT].includes(statut) && can('traiter_dossier')) {
    actions.push({ key: 'traiter', label: 'Prendre en charge', icon: ClipboardCheck, variant: 'primary' });
  }
  // Soumission à vérification (§14.2 : agent)
  if (statut === STATUTS.EN_TRAITEMENT && can('soumettre_verification')) {
    actions.push({ key: 'verifier', label: 'Soumettre à vérification', icon: ShieldCheck, variant: 'secondary' });
  }
  /* Demande de complément : le dossier repart en attente d'un complément
     parlementaire. Le motif est obligatoire — c'est lui que le secrétariat
     transmettra au demandeur. */
  if ([STATUTS.EN_TRAITEMENT, STATUTS.SOUMIS_A_VERIFICATION].includes(statut)
    && hasAnyPermission(['traiter_dossier', 'soumettre_verification', 'verifier_dossier'])) {
    actions.push({
      key: 'complement',
      label: 'Demander un complément',
      icon: FileQuestion,
      variant: 'secondary',
    });
  }
  // Décision (SOUMIS → VALIDE | CORRECTION) — Chef de Division / Chef de Service
  if (statut === STATUTS.SOUMIS_A_VERIFICATION && hasAnyPermission(['verifier_dossier', 'valider_dossier'])) {
    actions.push({ key: 'valider', label: 'Décider (valider / corriger)', icon: CheckCircle2, variant: 'primary' });
  }
  /* Signature (§14.2 : Chef de Service).
     Pour un dossier VISA, la signature du Chef de Service est distincte de la
     vérification par la division : aucun rôle technique ne peut la produire à
     sa place. Le serveur le contrôle de nouveau côté rôle ; l'écran ne montre
     donc l'action qu'au Chef de Service. */
  if (statut === STATUTS.VALIDE && can('signer_dossier') && (!estVisa || isRole('CHEF_SERVICE'))) {
    actions.push({ key: 'signer', label: 'Signer le dossier', icon: PenLine, variant: 'secondary' });
  }
  // Clôture
  if (peutCloturer) {
    actions.push({ key: 'cloturer', label: 'Clôturer', icon: Lock, variant: 'secondary' });
  }
  /* Archivage. Un dossier VISA s'archive depuis « Signé » : le vérificateur
     VISA archive lui-même les dossiers signés de sa division. */
  if (peutArchiver) {
    actions.push({
      key: 'archiver',
      label: estVisa ? 'Archiver (dossier signé)' : 'Archiver',
      icon: Archive,
      variant: 'secondary',
    });
  }
  /* Suppression définitive (CRUD complet). Elle reste séparée des transitions
     de workflow : supprimer n'est pas une étape du parcours, c'est un acte
     d'administration, réservé à l'administrateur technique, et possible tant
     que le dossier n'a pas d'historique de traitement. Au-delà, la bonne
     opération est l'archivage. */
  if (can('delete_dossier') && STATUTS_SUPPRESSIBLES.includes(statut)) {
    actions.push({ key: 'supprimer', label: 'Supprimer', icon: Trash2, variant: 'danger' });
  }

  const agentsOfDivision = agents.filter(
    (a) => !payload.division_id || a.division_id === Number(payload.division_id)
  );

  /* Réaffectation : le serveur exige un motif dès que l'agent change. Le
     dossier portant déjà un agent, on le demande systématiquement — il
     n'est pas bloquant à l'écran, mais il ne peut pas être vide. */
  const reaffectation = Boolean(dossier.agent_responsable_id);

  /* Éléments manquants signalés avant validation. */
  const champsVisaManquants = estVisa
    ? CHAMPS_VISA
        .filter(([colonne]) => {
          const v = dossier[colonne];
          return v === null || v === undefined || String(v).trim() === '';
        })
        .map(([, libelle]) => libelle)
    : [];
  const piecesManquantes = resume?.par_phase?.DEPOUILLEMENT?.pieces_manquantes || [];
  const dossierIncomplet = champsVisaManquants.length > 0 || piecesManquantes.length > 0;

  /* -------------------------- Contenu des modales -------------------------- */
  const renderActionContent = () => {
    switch (action) {
      case 'orienter':
        return (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              Orienter le dossier <b>{dossier.numero}</b> vers une division.
            </p>
            <Select
              label="Division cible"
              required
              success={Boolean(payload.division_id)}
              successMessage="Division choisie."
              value={payload.division_id || ''}
              onChange={(e) => setPayload((p) => ({ ...p, division_id: e.target.value }))}
            >
              <option value="">Sélectionner…</option>
              {divisions.map((d) => (
                <option key={d.id} value={d.id}>{d.nom}</option>
              ))}
            </Select>
          </div>
        );
      case 'affecter':
        return (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              Affecter le dossier <b>{dossier.numero}</b> à un agent.
            </p>
            <Select
              label="Division"
              value={payload.division_id || ''}
              onChange={(e) => {
                setPayload((p) => ({ ...p, division_id: e.target.value, agent_id: '' }));
              }}
            >
              <option value="">Garder la division actuelle</option>
              {divisions.map((d) => (
                <option key={d.id} value={d.id}>{d.nom}</option>
              ))}
            </Select>
            <Select
              label="Agent responsable"
              required
              value={payload.agent_id || ''}
              onChange={(e) => setPayload((p) => ({ ...p, agent_id: e.target.value }))}
            >
              <option value="">Sélectionner…</option>
              {agentsOfDivision.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nom} {a.prenom}
                </option>
              ))}
            </Select>
            {agentsOfDivision.length === 0 && (
              <p className="text-xs text-amber-600">
                Aucun agent trouvé pour cette division. Chargez d'abord des agents.
              </p>
            )}
            {reaffectation && (
              <>
                <TextAreaInput
                  label="Motif du changement d'agent"
                  required
                  rows={3}
                  value={payload.motif || ''}
                  onChange={(v) => setPayload((p) => ({ ...p, motif: v }))}
                  maxLength={500}
                  placeholder="Ex. absence de l'agent, réorientation, surcharge…"
                />
                <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  Le changement d'agent est tracé : l'ancien agent, le nouveau,
                  l'auteur et le motif sont conservés dans la fiche.
                </p>
              </>
            )}
          </div>
        );
      case 'traiter':
        return (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              Prendre le dossier <b>{dossier.numero}</b> en charge pour traitement.
            </p>
            <TextAreaInput
              label="Observation"
              value={payload.observation || ''}
              onChange={(v) => setPayload((p) => ({ ...p, observation: v }))}
              maxLength={1000}
              placeholder="Étapes de traitement réalisées…"
            />
          </div>
        );
      case 'verifier':
        return (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              Après traitement, soumettre <b>{dossier.numero}</b> à vérification ou demander une correction.
            </p>
            <Select
              label="Résultat"
              required
              success={Boolean(payload.resultat)}
              successMessage="Résultat choisi."
              value={payload.resultat || ''}
              onChange={(e) => setPayload((p) => ({ ...p, resultat: e.target.value }))}
            >
              <option value="">Sélectionner…</option>
              <option value="OK">Soumettre à vérification</option>
              <option value="KO">Demander une correction</option>
            </Select>
            <TextAreaInput
              label={payload.resultat === 'KO' ? 'Motif de la correction' : 'Observation'}
              required={payload.resultat === 'KO'}
              value={payload.observation || ''}
              onChange={(v) => setPayload((p) => ({ ...p, observation: v }))}
              maxLength={1000}
              placeholder="Détails de la vérification…"
            />
          </div>
        );
      case 'complement':
        return (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              Demander un complément sur le dossier <b>{dossier.numero}</b>. Le dossier
              passe en « En attente de complément ».
            </p>
            <TextAreaInput
              label="Motif du complément demandé"
              required
              rows={4}
              value={payload.motif || ''}
              onChange={(v) => setPayload((p) => ({ ...p, motif: v }))}
              maxLength={1000}
              placeholder="Ex. copie de l'acte de naissance illisible, certificat de résidence manquant…"
            />
            <p className="rounded-md bg-sky-50 px-3 py-2 text-xs text-sky-800">
              Le motif est obligatoire : il est celui que le secrétariat transmettra
              au demandeur.
            </p>
          </div>
        );
      case 'valider':
        return (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              Décision sur le dossier <b>{dossier.numero}</b> (soumis à vérification).
            </p>
            <Select
              label="Décision"
              required
              success={Boolean(payload.decision)}
              successMessage="Décision choisie."
              value={payload.decision || ''}
              onChange={(e) => setPayload((p) => ({ ...p, decision: e.target.value }))}
            >
              <option value="">Sélectionner…</option>
              <option value="VALIDE">Valider le dossier</option>
              <option value="CORRECTION">Demander une correction</option>
            </Select>
            <TextAreaInput
              label={payload.decision === 'CORRECTION' ? 'Motif du renvoi' : 'Commentaire'}
              required={payload.decision === 'CORRECTION'}
              value={payload.commentaire || ''}
              onChange={(v) => setPayload((p) => ({ ...p, commentaire: v }))}
              maxLength={1000}
              placeholder="Commentaire de validation…"
            />
            {payload.decision === 'VALIDE' && (
              <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
                Règle forte : un dossier « correction demandée » ne peut pas passer directement à « validé » ; il doit repasser par le traitement.
              </p>
            )}

            {/* Contrôle de complétude avant décision. Le chef de division
                doit voir ce qui manque avant de cliquer : la validation est
                bloquée par les pièces obligatoires et, pour un VISA, par les
                champs de réception. Seul le chef de service peut déroger ;
                pour les autres, l'écran explique la voie de sortie
                (demander une correction) au lieu d'un refus serveur sec. */}
            {payload.decision === 'VALIDE' && (
              <div
                className={`space-y-2 rounded-lg border p-3 ${
                  dossierIncomplet
                    ? 'border-amber-200 bg-amber-50/60'
                    : 'border-emerald-200 bg-emerald-50/60'
                }`}
              >
                <p
                  className={`flex items-center gap-1.5 text-sm font-medium ${
                    dossierIncomplet ? 'text-amber-800' : 'text-emerald-800'
                  }`}
                >
                  {dossierIncomplet
                    ? <ShieldAlert className="h-4 w-4" />
                    : <CheckCircle2 className="h-4 w-4" />}
                  {dossierIncomplet ? 'Le dossier est incomplet' : 'Le dossier est complet'}
                </p>

                {resumeChargement ? (
                  <p className="text-xs text-amber-800">
                    Vérification des pièces obligatoires en cours…
                  </p>
                ) : resumeErreur ? (
                  <p className="rounded-md bg-white/70 px-3 py-2 text-xs text-red-700">
                    Le contrôle de complétude n'a pas pu être chargé
                    {resumeErreur.message ? ` (${resumeErreur.message})` : ''}. Le serveur
                    effectuera le contrôle au moment de l'enregistrement.
                  </p>
                ) : dossierIncomplet ? (
                  <>
                    <p className="text-xs text-amber-800">Il reste à satisfaire :</p>
                    <ul className="list-disc space-y-0.5 pl-5 text-xs text-amber-800">
                      {champsVisaManquants.map((champ) => (
                        <li key={champ}>Champ VISA : {champ}</li>
                      ))}
                      {piecesManquantes.map((piece) => (
                        <li key={piece}>Pièce obligatoire : {piece}</li>
                      ))}
                    </ul>
                    {peutDeroger ? (
                      <>
                        <p className="text-xs text-amber-800">
                          En tant que chef de service, vous pouvez valider malgré ces
                          manques en motivant la dérogation ci-dessous.
                        </p>
                        <TextAreaInput
                          label="Motif de la dérogation"
                          required
                          rows={3}
                          value={payload.motif_exception || ''}
                          onChange={(v) => setPayload((p) => ({ ...p, motif_exception: v }))}
                          maxLength={500}
                          placeholder="Ex. pièce justificative à réclamer au guichet, délai urgent…"
                        />
                        <p className="text-[11px] text-amber-700">
                          La dérogation est enregistrée sur le dossier et dans l'historique :
                          elle reste visible et attribuée.
                        </p>
                      </>
                    ) : (
                      <p className="rounded-md bg-white/70 px-3 py-2 text-xs text-amber-800">
                        Votre profil ne peut pas déroger à ce contrôle. Choisissez
                        « Demander une correction » pour que l'agent complète le dossier ;
                        les pièces se contrôlent dans l'onglet « Pièces » de ce dossier.
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-emerald-800">
                    Toutes les pièces obligatoires de dépouillement et tous les champs
                    requis sont renseignés.
                  </p>
                )}
              </div>
            )}
          </div>
        );
      case 'signer':
        return (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              Signer le dossier validé <b>{dossier.numero}</b>.
            </p>
            <ReferenceInput
              label="Référence de signature"
              value={payload.reference || ''}
              onChange={(v) => setPayload((p) => ({ ...p, reference: v }))}
              placeholder="N° 045/SRSP/2026"
              hint="Lettre, chiffres et barres obliques. Elle figure sur l'acte signé."
              maxLength={50}
            />
            <TextAreaInput
              label="Observation"
              value={payload.observation || ''}
              onChange={(v) => setPayload((p) => ({ ...p, observation: v }))}
              maxLength={1000}
            />
            {estVisa && (
              <p className="rounded-md bg-violet-50 px-3 py-2 text-xs text-violet-800">
                Dossier VISA : la signature relève du Chef de Service. La
                vérification par le Chef de Division est une étape distincte et
                ne vaut pas signature.
              </p>
            )}
          </div>
        );
      case 'publier':
        return (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Publier le brouillon <b>{dossier.numero}</b> ? Il entre alors dans
              le circuit : il est orienté vers la division, affecté à un agent,
              et devient visible par le service.
            </p>
            <p className="rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-500">
              Un brouillon n’est visible que de vous. Une fois publié, il ne
              l’est plus : la saisie pourra être modifiée, mais le dossier
              appartiendra au circuit.
            </p>
          </div>
        );
      case 'supprimer':
        return (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              Supprimer définitivement le dossier <b>{dossier.numero}</b> ?
            </p>
            <TextAreaInput
              label="Motif de la suppression"
              required
              rows={3}
              value={payload.motif || ''}
              onChange={(v) => setPayload((p) => ({ ...p, motif: v }))}
              maxLength={500}
              placeholder="Ex. dossier créé par erreur, doublon de la demande…"
            />
            <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
              Suppression définitive : l'historique du dossier est conservé
              (l'opération est tracée), mais le dossier disparaît des listes.
              Au-delà du statut « orienté », l'archivage est l'opération
              appropriée.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  const confirmSubmit = async () => {
    const id = dossier.id;
    switch (action) {
      case 'orienter':
        await run(
          () => dossierService.orienter(id, { division_id: Number(payload.division_id) }),
          'Dossier orienté.'
        );
        break;
      case 'affecter':
        await run(
          () =>
            dossierService.affecter(id, {
              division_id: payload.division_id ? Number(payload.division_id) : undefined,
              agent_id: Number(payload.agent_id),
              motif: payload.motif || undefined,
            }),
          'Dossier affecté.'
        );
        break;
      case 'traiter':
        await run(
          () => dossierService.traiter(id, { observation: payload.observation }),
          'Dossier pris en charge.'
        );
        break;
      case 'verifier':
        await run(
          () =>
            dossierService.verifier(id, {
              resultat: payload.resultat,
              observation: payload.observation,
            }),
          payload.resultat === 'OK'
            ? 'Dossier soumis à vérification.'
            : 'Correction demandée.'
        );
        break;
      case 'complement':
        await run(
          () => dossierService.demanderComplement(id, { motif: payload.motif }),
          'Complément demandé.'
        );
        break;
      case 'valider':
        await run(
          () =>
            dossierService.valider(id, {
              decision: payload.decision,
              commentaire: payload.commentaire,
              motif_exception: payload.motif_exception || undefined,
            }),
          payload.decision === 'VALIDE'
            ? 'Dossier validé.'
            : 'Correction demandée.'
        );
        break;
      case 'signer':
        await run(
          () =>
            dossierService.signer(id, {
              reference: payload.reference,
              observation: payload.observation,
            }),
          'Dossier signé.'
        );
        break;
      case 'supprimer':
        /* La suppression quitte la fiche : recharger un dossier supprimé
           renverrait 404. On n'appelle donc pas `onDone`, mais `onDeleted`. */
        setSubmitting(true);
        try {
          await dossierService.delete(id, payload.motif);
          toastSuccess('Dossier supprimé.');
          setAction(null);
          setPayload({});
          (onDeleted || onDone)?.(id);
        } catch (err) {
          toastError(err.message);
        } finally {
          setSubmitting(false);
        }
        break;
      case 'publier':
        await run(
          () => dossierService.publier(id),
          'Brouillon publié : le dossier entre dans le circuit.'
        );
        break;
    }
  };

  const confirmSimple = async () => {
    const id = dossier.id;
    if (confirmAction === 'cloturer') {
      await run(() => dossierService.cloturer(id), 'Dossier clôturé.');
    } else if (confirmAction === 'archiver') {
      await run(() => dossierService.archiver(id), 'Dossier archivé.');
    }
  };

  /* Libellés et gravité de la confirmation selon l'action en attente. */
  const confirmations = {
    cloturer: {
      title: 'Clôturer le dossier',
      message: `Confirmer la clôture du dossier ${dossier.numero} ? Cette action est définitive.`,
      confirmLabel: 'Clôturer',
      danger: false,
    },
    archiver: {
      title: 'Archiver le dossier',
      message: estVisa
        ? `Archiver le dossier VISA signé ${dossier.numero} ? L'archivage exige la signature du Chef de Service et les pièces d'archivage requises.`
        : `Confirmer l'archivage du dossier clôturé ${dossier.numero} ?`,
      confirmLabel: 'Archiver',
      danger: true,
    },
  };
  const confirmation = confirmAction ? confirmations[confirmAction] : null;

  /* Le bouton de validation est bloqué tant que l'action demandée n'est pas
     complète : un motif manquant doit être bloqué ici, pas par un 422. */
  const actionIncomplete = () => {
    switch (action) {
      case 'orienter':
        return !payload.division_id;
      case 'affecter':
        return !payload.agent_id || (reaffectation && !String(payload.motif || '').trim());
      case 'verifier':
        return !payload.resultat
          || (payload.resultat === 'KO' && !String(payload.observation || '').trim());
      case 'complement':
        return !String(payload.motif || '').trim();
      case 'valider':
        if (!payload.decision) return true;
        if (payload.decision === 'CORRECTION') return !String(payload.commentaire || '').trim();
        /* Un dossier incomplet ne se valide pas sans dérogation. Le bloc
           affiché au-dessus explique le manque et la voie de sortie : le
           bouton désactivé n'est jamais la seule information. */
        if (dossierIncomplet && !peutDeroger) return true;
        if (dossierIncomplet && peutDeroger) return !String(payload.motif_exception || '').trim();
        return false;
      case 'signer':
        return false;
      case 'supprimer':
        return !String(payload.motif || '').trim();
      default:
        return false;
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {canEdit && (
        <Link to={`/dossiers/${dossier.id}/modifier`}>
          <Button variant="ghost" size="sm">
            <Pencil className="h-4 w-4" /> Modifier
          </Button>
        </Link>
      )}

      {actions.map((a) => (
        <Button
          key={a.key}
          variant={a.variant || 'secondary'}
          size="sm"
          onClick={() => {
            if (a.key === 'cloturer' || a.key === 'archiver') {
              setConfirmAction(a.key);
            } else {
              setAction(a.key);
              setPayload({});
            }
          }}
        >
          <a.icon className="h-4 w-4" /> {a.label}
        </Button>
      ))}

      {actions.length === 0 && !canEdit && (
        <p className="text-xs text-slate-400">
          Aucune action disponible pour ce statut et ce profil.
        </p>
      )}

      {/* Modale d'action avec formulaire */}
      <Modal
        open={action !== null}
        onClose={() => !submitting && setAction(null)}
        title={`Action sur ${dossier.numero}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setAction(null)} disabled={submitting}>
              Annuler
            </Button>
            <Button
              onClick={confirmSubmit}
              loading={submitting}
              disabled={actionIncomplete()}
            >
              Confirmer
            </Button>
          </>
        }
      >
        {renderActionContent()}
      </Modal>

      {/* Confirmation simple (clôture / archivage) */}
      <ConfirmDialog
        open={confirmAction !== null}
        onClose={() => !submitting && setConfirmAction(null)}
        onConfirm={confirmSimple}
        loading={submitting}
        danger={confirmation?.danger || false}
        title={confirmation?.title || 'Confirmer'}
        message={confirmation?.message || ''}
        confirmLabel={confirmation?.confirmLabel || 'Confirmer'}
      />
    </div>
  );
}

export default DossierActions;
