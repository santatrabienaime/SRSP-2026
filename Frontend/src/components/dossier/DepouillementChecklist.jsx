import { useState, useEffect, useCallback } from 'react';
import { CircleCheck, CircleX, Loader2, EyeOff, PencilLine, MinusCircle, History } from 'lucide-react';
import { dossierService } from '../../services/dossierService.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useNotification } from '../../hooks/useNotification.js';
import { Card } from '../ui/Card.jsx';
import { Spinner } from '../ui/Spinner.jsx';
import { Alert } from '../ui/Alert.jsx';
import { Badge } from '../ui/Badge.jsx';
import { Modal } from '../ui/Modal.jsx';
import { Button } from '../ui/Button.jsx';
import { TextAreaInput } from '../fields/index.jsx';
import { formatDateTime } from '../../utils/formatDate.js';
import { ETATS_PIECE, ETATS_PIECE_LABELS, ETATS_PIECE_BADGES, ETATS_PIECE_A_MOTIVER } from '../../config/constants.js';

/**
 * Dépouillement des pièces d'un dossier.
 *
 * Quatre états, et non deux : une pièce peut être reçue mais illisible, ou
 * présente mais à corriger. Seule « présente » satisfait une obligation ; les
 * trois autres états doivent être motivés, parce que c'est le motif qui dit à
 * l'agent ce qu'il doit rapporter.
 */
const ACTIONS = [
  { etat: ETATS_PIECE.PRESENTE, label: 'Présente', Icone: CircleCheck, actif: 'border-emerald-600 bg-emerald-600 text-white', repos: 'border-emerald-300 text-emerald-700 hover:bg-emerald-50' },
  { etat: ETATS_PIECE.MANQUANTE, label: 'Manquante', Icone: CircleX, actif: 'border-red-600 bg-red-600 text-white', repos: 'border-red-300 text-red-700 hover:bg-red-50' },
  { etat: ETATS_PIECE.ILLISIBLE, label: 'Illisible', Icone: EyeOff, actif: 'border-amber-600 bg-amber-600 text-white', repos: 'border-amber-300 text-amber-700 hover:bg-amber-50' },
  { etat: ETATS_PIECE.A_CORRIGER, label: 'À corriger', Icone: PencilLine, actif: 'border-orange-600 bg-orange-600 text-white', repos: 'border-orange-300 text-orange-700 hover:bg-orange-50' },
  /* Une pièce qui ne s'applique pas à ce dossier n'a pas à être fournie :
     elle ne bloque pas la validation et ne demande pas de motif. */
  { etat: ETATS_PIECE.NON_APPLICABLE, label: 'Non applicable', Icone: MinusCircle, actif: 'border-slate-600 bg-slate-600 text-white', repos: 'border-slate-300 text-slate-700 hover:bg-slate-50' },
];

export function DepouillementChecklist({ dossierId }) {
  const { hasAnyPermission } = useAuth();
  const { toastSuccess } = useNotification();
  const canControl = hasAnyPermission(['depouiller_pieces', 'gerer_ordonnancement', 'preparer_mandatement']);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [saving, setSaving] = useState(null);
  const [pieceAMotiver, setPieceAMotiver] = useState(null);
  const [motif, setMotif] = useState('');

  /* La trace chronologique des contrôles. Elle est chargée à part : c'est un
     complément de la check-list, pas sa condition — son absence ne doit pas
     empêcher de dépouiller. */
  const [historique, setHistorique] = useState([]);
  const [historiqueOuvert, setHistoriqueOuvert] = useState(false);
  const [historiqueErreur, setHistoriqueErreur] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setData(await dossierService.getDepouillement(dossierId));
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [dossierId]);

  useEffect(() => {
    Promise.resolve().then(load);
  }, [load]);

  /* La trace n'est chargée que lorsqu'on la demande : personne ne fait
     défiler un historique pour une check-list de dix pièces. */
  const basculerHistorique = async () => {
    const ouvert = !historiqueOuvert;
    setHistoriqueOuvert(ouvert);
    if (!ouvert || historique.length > 0 || historiqueErreur) return;
    try {
      setHistoriqueErreur(null);
      setHistorique(await dossierService.getDepouillementHistorique(dossierId));
    } catch (e) {
      setHistoriqueErreur(e);
    }
  };

  const enregistrer = async (piece, etat, motifSaisi) => {
    setSaving(piece.code);
    setActionError(null);
    try {
      await dossierService.saveDepouillement(dossierId, {
        piece: piece.code,
        presente: etat === ETATS_PIECE.PRESENTE || etat === ETATS_PIECE.NON_APPLICABLE,
        etat,
        motif: motifSaisi || undefined,
      });
      /* Le serveur renvoie le résumé et la liste à plat ; recharger la fiche
         complète garde les deux phases groupées et le même contrat d'affichage. */
      await load();
      toastSuccess(`« ${piece.libelle} » : ${ETATS_PIECE_LABELS[etat].toLowerCase()}.`);
      setPieceAMotiver(null);
      setMotif('');
    } catch (e) {
      setActionError(e);
    } finally {
      setSaving(null);
    }
  };

  const choisirEtat = (piece, etat) => {
    /* Seuls les états qui restent à traiter demandent un motif. « Présente »
       n'a rien à expliquer, et « non applicable » non plus : la pièce n'a
       simplement pas à être fournie. */
    if (!ETATS_PIECE_A_MOTIVER.includes(etat)) {
      enregistrer(piece, etat);
      return;
    }
    setPieceAMotiver({ piece, etat });
    setMotif(piece.motif || '');
  };

  if (loading) return <Spinner className="py-6" />;
  if (error) {
    return (
      <Alert type="warning" title="Dépouillement indisponible">
        {error.message}
      </Alert>
    );
  }
  if (!data || !data.pieces?.length) {
    return (
      <p className="rounded-md bg-slate-50 px-3 py-4 text-sm text-slate-500">
        Aucune pièce n'est configurée pour ce type de dossier.
      </p>
    );
  }

  const { resume } = data;

  return (
    <Card
      title="Dépouillement des pièces"
      subtitle={`${resume.presentes}/${resume.total} pièces obligatoires présentes`}
      actions={
        <Badge className={resume.complet
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
          : 'border-amber-200 bg-amber-50 text-amber-700'}>
          {resume.complet ? 'Complet' : `${resume.manquantes} à traiter`}
        </Badge>
      }
    >
      {actionError && (
        <p className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {actionError.message}
        </p>
      )}

      {resume.pieces_manquantes?.length > 0 && (
        <p className="mb-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Pièces obligatoires non satisfaites : {resume.pieces_manquantes.join(', ')}.
        </p>
      )}

      <div className="space-y-5">
        {[
          { phase: 'DEPOUILLEMENT', titre: 'Pièces du contrôle', pieces: data.depouillement },
          { phase: 'ARCHIVAGE', titre: "Pièces d'archivage", pieces: data.archivage },
        ].map(({ phase, titre, pieces }) => {
          const r = data.resume?.par_phase?.[phase];
          if (!pieces?.length) return null;
          return (
            <section key={phase}>
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {titre}
                </h4>
                <span className={`text-xs font-semibold ${r?.complet ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {r?.presentes}/{r?.total}
                </span>
              </div>
              <ul className="space-y-2">
                {pieces.map((piece) => (
                  <li
                    key={piece.code}
                    className="rounded-md border border-slate-200 px-3 py-2"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-700">
                          {piece.libelle}
                          {piece.obligatoire && (
                            <span className="ml-1 text-xs text-amber-600">(obligatoire)</span>
                          )}
                        </p>
                        <p className="text-xs text-slate-400">
                          {piece.date_controle
                            ? `Contrôlée le ${formatDateTime(piece.date_controle)}${piece.agent ? ` par ${piece.agent}` : ''}`
                            : 'Pas encore contrôlée'}
                        </p>
                      </div>
                      <Badge className={ETATS_PIECE_BADGES[piece.etat] || ETATS_PIECE_BADGES.MANQUANTE}>
                        {ETATS_PIECE_LABELS[piece.etat] || piece.etat}
                      </Badge>
                    </div>

                    {(piece.observation || piece.motif) && (
                      <p className="mt-1 rounded bg-slate-50 px-2 py-1 text-xs text-slate-600">
                        {piece.motif || piece.observation}
                      </p>
                    )}

                    {canControl && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {ACTIONS.map(({ etat, label, Icone, actif, repos }) => {
                          const selectionne = piece.etat === etat;
                          return (
                            <button
                              key={etat}
                              type="button"
                              onClick={() => choisirEtat(piece, etat)}
                              disabled={saving === piece.code}
                              aria-pressed={selectionne}
                              className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
                                selectionne ? actif : repos
                              }`}
                            >
                              {saving === piece.code && selectionne
                                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                : <Icone className="h-3.5 w-3.5" />}
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}

        {/* La trace chronologique des contrôles. La check-list montre l'état
            courant de chaque pièce ; ceci répond à une autre question : dans
            quel ordre les pièces ont-elles été contrôlées, et par qui. */}
        <section className="border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={basculerHistorique}
            aria-expanded={historiqueOuvert}
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-700"
          >
            <History className="h-3.5 w-3.5" />
            Historique des contrôles
            {historique.length > 0 && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                {historique.length}
              </span>
            )}
          </button>

          {historiqueOuvert && (
            <div className="mt-2">
              {historiqueErreur ? (
                <Alert type="warning" title="Historique indisponible">
                  {historiqueErreur.message}
                </Alert>
              ) : historique.length === 0 ? (
                <p className="rounded-md bg-slate-50 px-3 py-3 text-sm text-slate-500">
                  Aucune pièce n'a encore été contrôlée sur ce dossier.
                </p>
              ) : (
                <ul className="space-y-1">
                  {historique.map((h) => (
                    <li
                      key={`${h.piece}-${h.date_controle}`}
                      className="flex flex-wrap items-center gap-2 rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-600"
                    >
                      <span className="font-medium text-slate-700">{h.libelle || h.piece}</span>
                      <Badge className={ETATS_PIECE_BADGES[h.etat] || ETATS_PIECE_BADGES.MANQUANTE}>
                        {ETATS_PIECE_LABELS[h.etat] || h.etat}
                      </Badge>
                      <span className="text-slate-400">
                        {h.date_controle ? formatDateTime(h.date_controle) : '—'}
                        {h.agent_nom
                          ? ` — ${h.agent_prenom || ''} ${h.agent_nom}`.trim()
                          : ''}
                      </span>
                      {(h.motif || h.observation) && (
                        <span className="text-slate-500">— {h.motif || h.observation}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>
      </div>

      <Modal
        open={pieceAMotiver !== null}
        onClose={() => !saving && setPieceAMotiver(null)}
        title={`Motif — ${pieceAMotiver?.piece?.libelle || ''}`}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setPieceAMotiver(null)} disabled={saving}>
              Annuler
            </Button>
            <Button
              onClick={() => enregistrer(pieceAMotiver.piece, pieceAMotiver.etat, motif)}
              loading={saving !== null}
              disabled={!motif.trim()}
            >
              Enregistrer
            </Button>
          </>
        }
      >
        <p className="mb-3 text-sm text-slate-600">
          Une pièce « {ETATS_PIECE_LABELS[pieceAMotiver?.etat]?.toLowerCase()} » doit être
          motivée : le motif est transmis au secrétariat et conservé dans la fiche.
        </p>
        <TextAreaInput
          label="Motif"
          required
          rows={3}
          value={motif}
          onChange={setMotif}
          maxLength={500}
          placeholder="Ex. copie illisible, acte à faire rectifier par la mairie…"
        />
      </Modal>
    </Card>
  );
}

export default DepouillementChecklist;
