import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Send, UserCheck, ClipboardCheck, ShieldCheck, PenLine, Lock, Archive, CheckCircle2 } from 'lucide-react';
import { dossierService } from '../../services/dossierService.js';
import { divisionService } from '../../services/divisionService.js';
import { agentService } from '../../services/agentService.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useNotification } from '../../hooks/useNotification.js';
import { Button } from '../ui/Button.jsx';
import { Select } from '../ui/Select.jsx';
import { Input } from '../ui/Input.jsx';
import { Textarea } from '../ui/Textarea.jsx';
import { Modal } from '../ui/Modal.jsx';
import { ConfirmDialog } from '../ui/ConfirmDialog.jsx';
import { STATUTS } from '../../config/constants.js';

/**
 * Actions métier disponibles selon le statut du dossier et les permissions
 * de l'utilisateur connecté (workflow v2.0).
 */
export function DossierActions({ dossier, onDone }) {
  const { hasPermission } = useAuth();
  const { toastSuccess, toastError } = useNotification();

  const [divisions, setDivisions] = useState([]);
  const [agents, setAgents] = useState([]);
  const [action, setAction] = useState(null); // 'orienter' | 'affecter' | 'traiter' | ...
  const [payload, setPayload] = useState({});
  const [confirmAction, setConfirmAction] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const statut = dossier?.statut_code;

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
  const canEdit = can('dossier.modifier') && !['CLOTURE', 'ARCHIVE'].includes(statut);

  // Orientation
  if ((statut === STATUTS.ENREGISTRE || statut === STATUTS.ORIENTE) && can('dossier.affecter')) {
    actions.push({
      key: 'orienter',
      label: 'Orienter vers une division',
      icon: Send,
      variant: 'secondary',
    });
  }
  // Affectation
  if ([STATUTS.ENREGISTRE, STATUTS.ORIENTE, STATUTS.AFFECTE, STATUTS.CORRECTION_DEMANDEE].includes(statut) && can('dossier.affecter')) {
    actions.push({
      key: 'affecter',
      label: 'Affecter à un agent',
      icon: UserCheck,
      variant: 'secondary',
    });
  }
  // Traitement
  if ([STATUTS.AFFECTE, STATUTS.CORRECTION_DEMANDEE].includes(statut) && can('dossier.traiter')) {
    actions.push({ key: 'traiter', label: 'Prendre en charge', icon: ClipboardCheck, variant: 'primary' });
  }
  // Vérification
  if (statut === STATUTS.EN_TRAITEMENT && can('dossier.verifier')) {
    actions.push({ key: 'verifier', label: 'Soumettre à vérification', icon: ShieldCheck, variant: 'secondary' });
  }
  // Validation
  if (statut === STATUTS.SOUMIS_A_VERIFICATION && can('dossier.valider')) {
    actions.push({ key: 'valider', label: 'Décider (valider / corriger)', icon: CheckCircle2, variant: 'primary' });
  }
  // Signature
  if (statut === STATUTS.VALIDE && can('dossier.valider')) {
    actions.push({ key: 'signer', label: 'Signer le dossier', icon: PenLine, variant: 'secondary' });
  }
  // Clôture
  if (statut === STATUTS.SIGNE && can('dossier.cloturer')) {
    actions.push({ key: 'cloturer', label: 'Clôturer', icon: Lock, variant: 'secondary' });
  }
  // Archivage
  if (statut === STATUTS.CLOTURE && can('dossier.archiver')) {
    actions.push({ key: 'archiver', label: 'Archiver', icon: Archive, variant: 'secondary' });
  }

  const agentsOfDivision = agents.filter(
    (a) => !payload.division_id || a.division_id === Number(payload.division_id)
  );

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
          </div>
        );
      case 'traiter':
        return (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              Prendre le dossier <b>{dossier.numero}</b> en charge pour traitement.
            </p>
            <Textarea
              label="Observation"
              value={payload.observation || ''}
              onChange={(e) => setPayload((p) => ({ ...p, observation: e.target.value }))}
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
              value={payload.resultat || ''}
              onChange={(e) => setPayload((p) => ({ ...p, resultat: e.target.value }))}
            >
              <option value="">Sélectionner…</option>
              <option value="OK">Soumettre à vérification</option>
              <option value="KO">Demander une correction</option>
            </Select>
            <Textarea
              label="Observation"
              value={payload.observation || ''}
              onChange={(e) => setPayload((p) => ({ ...p, observation: e.target.value }))}
              placeholder="Détails de la vérification…"
            />
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
              value={payload.decision || ''}
              onChange={(e) => setPayload((p) => ({ ...p, decision: e.target.value }))}
            >
              <option value="">Sélectionner…</option>
              <option value="VALIDE">Valider le dossier</option>
              <option value="CORRECTION">Demander une correction</option>
            </Select>
            <Textarea
              label="Commentaire"
              value={payload.commentaire || ''}
              onChange={(e) => setPayload((p) => ({ ...p, commentaire: e.target.value }))}
              placeholder="Commentaire de validation…"
            />
            {payload.decision === 'VALIDE' && (
              <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
                Règle forte : un dossier « correction demandée » ne peut pas passer directement à « validé » ; il doit repasser par le traitement.
              </p>
            )}
          </div>
        );
      case 'signer':
        return (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              Signer le dossier validé <b>{dossier.numero}</b>.
            </p>
            <Input
              label="Référence de signature"
              value={payload.reference || ''}
              onChange={(e) => setPayload((p) => ({ ...p, reference: e.target.value }))}
              placeholder="ex. N° 045/SRSP/2026"
            />
            <Textarea
              label="Observation"
              value={payload.observation || ''}
              onChange={(e) => setPayload((p) => ({ ...p, observation: e.target.value }))}
            />
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
      case 'valider':
        await run(
          () =>
            dossierService.valider(id, {
              decision: payload.decision,
              commentaire: payload.commentaire,
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
              disabled={
                (action === 'orienter' && !payload.division_id) ||
                (action === 'affecter' && !payload.agent_id) ||
                ((action === 'verifier' || action === 'valider') && !payload.resultat && !payload.decision)
              }
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
        danger={confirmAction === 'archiver'}
        title={confirmAction === 'cloturer' ? 'Clôturer le dossier' : 'Archiver le dossier'}
        message={
          confirmAction === 'cloturer'
            ? `Confirmer la clôture du dossier ${dossier.numero} ? Cette action est définitive.`
            : `Confirmer l'archivage du dossier clôturé ${dossier.numero} ?`
        }
        confirmLabel={confirmAction === 'cloturer' ? 'Clôturer' : 'Archiver'}
      />
    </div>
  );
}

export default DossierActions;