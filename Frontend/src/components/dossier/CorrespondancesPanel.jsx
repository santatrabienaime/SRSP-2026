import { useState, useEffect, useCallback } from 'react';
import {
  Mail, Plus, Send, Inbox, ScrollText, RefreshCw, PenLine,
} from 'lucide-react';
import { correspondanceService } from '../../services/correspondanceService.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useNotification } from '../../hooks/useNotification.js';
import { Card } from '../ui/Card.jsx';
import { Button } from '../ui/Button.jsx';
import { Badge } from '../ui/Badge.jsx';
import { Spinner } from '../ui/Spinner.jsx';
import { Alert } from '../ui/Alert.jsx';
import { Modal } from '../ui/Modal.jsx';
import { Select } from '../ui/Select.jsx';
import { Input } from '../ui/Input.jsx';
import { TextInput, TextAreaInput } from '../fields/index.jsx';
import { formatDateTime, pourChampDateTime, pourSqlDateTime } from '../../utils/formatDate.js';
import {
  TYPES_CORRESPONDANCE,
  ETATS_CORRESPONDANCE,
  ETATS_REPONSE_CORRESPONDANCE,
  ETATS_RECEPTION_CENTRALE,
} from '../../config/constants.js';

/**
 * Correspondances d'un dossier.
 *
 * Une correspondance est une lettre ou une notification : une prescription,
 * une demande de dossier mère, une opposition. Elle est suivie jusqu'au
 * niveau central — réponse reçue, bordereau de transmission, accusé de
 * réception du central.
 *
 * Le panneau montre deux choses : ce qui est parti (type, destinataire,
 * objet, date d'envoi) et ce qui en est revenu (réponse, réception
 * centrale). Une correspondance sans suivi n'est pas une correspondance
 * inutile : c'est une correspondance qui attend.
 */

/** Formulaire d'une nouvelle correspondance. */
const NOUVELLE = {
  type: 'LETTRE_PRESCRIPTION',
  reference: '',
  destinataire: '',
  objet: '',
  contenu: '',
  date_transmission_central: '',
  destinataire_central: '',
  reference_bordereau: '',
};

/** Formulaire du suivi d'une correspondance. */
const SUIVI = {
  etat: '',
  etat_reponse: '',
  date_reponse: '',
  reponse: '',
  etat_reception_central: '',
};

/**
 * Libellé d'un état : celui du référentiel s'il existe, le code brut sinon.
 * Un état que l'écran ne connaît pas ne doit pas disparaître du dossier.
 */
function libelleEtat(code, referentiel) {
  if (!code) return null;
  return referentiel[code] || code;
}

export function CorrespondancesPanel({ dossierId }) {
  const { hasAnyPermission } = useAuth();
  const { toastSuccess, toastError } = useNotification();

  const [correspondances, setCorrespondances] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  const [modaleNouvelle, setModaleNouvelle] = useState(false);
  const [formulaire, setFormulaire] = useState(NOUVELLE);
  const [enregistrement, setEnregistrement] = useState(false);

  /* La correspondance dont on suit l'envoi : elle est mémorisée pour que la
     modale de suivi sache de quoi elle parle. */
  const [suivie, setSuivie] = useState(null);
  const [formulaireSuivi, setFormulaireSuivi] = useState(SUIVI);
  const [miseAJourEnCours, setMiseAJourEnCours] = useState(false);

  /* Le serveur protège les correspondances par la permission
     « gerer_correspondances » : sans elle, il n'y a ni lecture ni écriture. */
  const peutGerer = hasAnyPermission(['gerer_correspondances']);

  const charger = useCallback(async () => {
    try {
      setChargement(true);
      setErreur(null);
      const liste = await correspondanceService.list(dossierId);
      setCorrespondances(Array.isArray(liste) ? liste : []);
    } catch (e) {
      setErreur(e);
    } finally {
      setChargement(false);
    }
  }, [dossierId]);

  useEffect(() => { Promise.resolve().then(charger); }, [charger]);

  const modifier = (cle, valeur) =>
    setFormulaire((f) => ({ ...f, [cle]: valeur }));

  const modifierSuivi = (cle, valeur) =>
    setFormulaireSuivi((f) => ({ ...f, [cle]: valeur }));

  const creer = async () => {
    if (!formulaire.destinataire.trim() || !formulaire.objet.trim()) {
      toastError('Le destinataire et l’objet sont obligatoires.');
      return;
    }
    setEnregistrement(true);
    try {
      await correspondanceService.create({
        dossier_id: dossierId,
        type: formulaire.type,
        reference: formulaire.reference || null,
        destinataire: formulaire.destinataire,
        objet: formulaire.objet,
        contenu: formulaire.contenu || null,
        date_transmission_central: formulaire.date_transmission_central
          ? pourSqlDateTime(formulaire.date_transmission_central)
          : null,
        destinataire_central: formulaire.destinataire_central || null,
        reference_bordereau: formulaire.reference_bordereau || null,
      });
      toastSuccess('Correspondance enregistrée.');
      setModaleNouvelle(false);
      setFormulaire(NOUVELLE);
      await charger();
    } catch (e) {
      toastError(e.message);
    } finally {
      setEnregistrement(false);
    }
  };

  const ouvrirSuivi = (correspondance) => {
    setSuivie(correspondance);
    setFormulaireSuivi({
      etat: correspondance.etat || '',
      etat_reponse: correspondance.etat_reponse || '',
      date_reponse: correspondance.date_reponse
        ? pourChampDateTime(correspondance.date_reponse)
        : '',
      reponse: correspondance.reponse || '',
      etat_reception_central: correspondance.etat_reception_central || '',
    });
  };

  const mettreAJour = async () => {
    if (!suivie) return;
    setMiseAJourEnCours(true);
    try {
      await correspondanceService.update(suivie.id, {
        etat: formulaireSuivi.etat || undefined,
        etat_reponse: formulaireSuivi.etat_reponse || null,
        date_reponse: formulaireSuivi.date_reponse
          ? pourSqlDateTime(formulaireSuivi.date_reponse)
          : null,
        reponse: formulaireSuivi.reponse || null,
        etat_reception_central: formulaireSuivi.etat_reception_central || null,
      });
      toastSuccess('Suivi de la correspondance mis à jour.');
      setSuivie(null);
      await charger();
    } catch (e) {
      toastError(e.message);
    } finally {
      setMiseAJourEnCours(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card
        title="Correspondances"
        subtitle="Lettres et notifications envoyées pour ce dossier, et leur suivi"
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={charger} title="Recharger la liste">
              <RefreshCw className="h-4 w-4" />
            </Button>
            {peutGerer && (
              <Button size="sm" onClick={() => setModaleNouvelle(true)}>
                <Plus className="h-4 w-4" /> Nouvelle correspondance
              </Button>
            )}
          </>
        }
      >
        {/* Sans la permission, le serveur refuse aussi bien la lecture que
            l'écriture : le panneau le dit plutôt que d'afficher une liste
            vide qui ferait croire qu'aucune correspondance n'existe. */}
        {erreur ? (
          <Alert type="warning" title="Correspondances indisponibles">
            {erreur.message}
          </Alert>
        ) : !peutGerer ? (
          <Alert type="info" title="Suivi des correspondances non accessible">
            La gestion des correspondances n’est pas ouverte à votre profil : les
            correspondances de ce dossier ne sont ni listables ni modifiables
            depuis cet écran.
          </Alert>
        ) : null}

        {chargement ? (
          <Spinner className="py-6" />
        ) : correspondances.length === 0 ? (
          <p className="rounded-md bg-slate-50 px-3 py-4 text-sm text-slate-500">
            Aucune correspondance pour ce dossier. Les prescriptions, demandes
            de dossier mère et oppositions y apparaîtront, avec leur suivi.
          </p>
        ) : (
          <ul className="space-y-3">
            {correspondances.map((c) => {
              const etatEnvoi = ETATS_CORRESPONDANCE[c.etat] || c.etat;
              return (
                <li
                  key={c.id}
                  className="rounded-lg border border-slate-200 p-3 transition-colors hover:border-slate-300"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-800">
                        <Mail className="h-4 w-4 text-slate-400" />
                        {libelleEtat(c.type, TYPES_CORRESPONDANCE)}
                        {c.reference && (
                          <span className="text-xs font-normal text-slate-500">
                            · Réf. {c.reference}
                          </span>
                        )}
                      </p>
                      <p className="mt-1 text-sm text-slate-700">{c.objet}</p>
                      <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-600">
                        <Send className="h-3 w-3 text-slate-400" />
                        <span>À {c.destinataire}</span>
                      </p>
                      <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
                        <ScrollText className="h-3 w-3" />
                        <span>
                          {c.date_envoi
                            ? `Envoyée le ${formatDateTime(c.date_envoi)}`
                            : 'Pas encore envoyée'}
                        </span>
                        {c.auteur && <span>· rédigée par {c.auteur}</span>}
                      </p>
                      {c.contenu && (
                        <p className="mt-2 rounded bg-slate-50 px-2 py-1 text-xs text-slate-600">
                          {c.contenu}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={
                          c.etat === 'ENVOYEE'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-slate-200 bg-slate-50 text-slate-600'
                        }
                      >
                        {etatEnvoi}
                      </Badge>
                      {peutGerer && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => ouvrirSuivi(c)}
                          title="Mettre à jour le suivi de cette correspondance"
                        >
                          <PenLine className="h-3.5 w-3.5" /> Suivi
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Le suivi : ce qui est revenu de la correspondance, et ce
                      qu'elle devient au niveau central. */}
                  <dl className="mt-3 grid gap-x-6 gap-y-1 border-t border-slate-100 pt-3 text-xs sm:grid-cols-2">
                    <div className="flex justify-between gap-2">
                      <dt className="text-slate-500">État de réponse</dt>
                      <dd className="text-right text-slate-700">
                        {libelleEtat(c.etat_reponse, ETATS_REPONSE_CORRESPONDANCE) || '—'}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-slate-500">Date de réponse</dt>
                      <dd className="text-right text-slate-700">
                        {c.date_reponse ? formatDateTime(c.date_reponse) : '—'}
                      </dd>
                    </div>
                    {c.reponse && (
                      <div className="flex justify-between gap-2 sm:col-span-2">
                        <dt className="shrink-0 text-slate-500">Réponse</dt>
                        <dd className="text-right text-slate-700">{c.reponse}</dd>
                      </div>
                    )}
                    <div className="flex justify-between gap-2">
                      <dt className="text-slate-500">Transmission centrale</dt>
                      <dd className="text-right text-slate-700">
                        {c.date_transmission_central
                          ? formatDateTime(c.date_transmission_central)
                          : '—'}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-slate-500">Destinataire central</dt>
                      <dd className="text-right text-slate-700">
                        {c.destinataire_central || '—'}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-slate-500">Référence du bordereau</dt>
                      <dd className="text-right text-slate-700">
                        {c.reference_bordereau || '—'}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-slate-500">Réception au central</dt>
                      <dd className="text-right text-slate-700">
                        {libelleEtat(c.etat_reception_central, ETATS_RECEPTION_CENTRALE) || '—'}
                      </dd>
                    </div>
                  </dl>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {/* Nouvelle correspondance : ce qui est écrit et à qui. */}
      <Modal
        open={modaleNouvelle}
        onClose={() => !enregistrement && setModaleNouvelle(false)}
        title="Nouvelle correspondance"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setModaleNouvelle(false)}
              disabled={enregistrement}
            >
              Annuler
            </Button>
            <Button onClick={creer} loading={enregistrement}>
              <Send className="h-4 w-4" /> Enregistrer
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Select
            label="Type de correspondance"
            required
            value={formulaire.type}
            onChange={(e) => modifier('type', e.target.value)}
          >
            {Object.entries(TYPES_CORRESPONDANCE).map(([code, libelle]) => (
              <option key={code} value={code}>
                {libelle}
              </option>
            ))}
          </Select>
          <TextInput
            label="Référence"
            value={formulaire.reference}
            onChange={(v) => modifier('reference', v)}
            maxLength={100}
            placeholder="Ex. OPP-2026-0001"
          />
          <TextInput
            label="Destinataire"
            required
            value={formulaire.destinataire}
            onChange={(v) => modifier('destinataire', v)}
            maxLength={150}
            placeholder="Ex. Direction centrale des pensions"
          />
          <TextInput
            label="Objet"
            required
            value={formulaire.objet}
            onChange={(v) => modifier('objet', v)}
            maxLength={200}
            placeholder="Ex. Opposition sur pension alimentaire"
          />
          <TextAreaInput
            label="Contenu"
            rows={4}
            maxLength={2000}
            value={formulaire.contenu}
            onChange={(v) => modifier('contenu', v)}
            placeholder="Ce que la lettre dit, en quelques lignes."
          />
          <Input
            label="Date et heure de transmission au central"
            type="datetime-local"
            value={formulaire.date_transmission_central}
            onChange={(e) => modifier('date_transmission_central', e.target.value)}
          />
          <TextInput
            label="Destinataire central"
            value={formulaire.destinataire_central}
            onChange={(v) => modifier('destinataire_central', v)}
            maxLength={150}
            placeholder="Ex. Direction centrale"
          />
          <TextInput
            label="Référence du bordereau"
            value={formulaire.reference_bordereau}
            onChange={(v) => modifier('reference_bordereau', v)}
            maxLength={100}
            placeholder="Ex. BORD-CENTRAL-0001"
          />
        </div>
      </Modal>

      {/* Suivi : ce que la correspondance a reçu, et ce qu'elle est devenue
          au niveau central. */}
      <Modal
        open={Boolean(suivie)}
        onClose={() => !miseAJourEnCours && setSuivie(null)}
        title="Mettre à jour le suivi de la correspondance"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setSuivie(null)}
              disabled={miseAJourEnCours}
            >
              Annuler
            </Button>
            <Button onClick={mettreAJour} loading={miseAJourEnCours}>
              <Inbox className="h-4 w-4" /> Enregistrer le suivi
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          {/* L'état d'envoi se met à jour ici : une correspondance rédigée
              doit pouvoir quitter l'état « brouillon » quand elle part. */}
          <Select
            label="État de la correspondance"
            value={formulaireSuivi.etat}
            onChange={(e) => modifierSuivi('etat', e.target.value)}
            placeholder="— Non précisé —"
          >
            {Object.entries(ETATS_CORRESPONDANCE).map(([code, libelle]) => (
              <option key={code} value={code}>
                {libelle}
              </option>
            ))}
          </Select>
          <Select
            label="État de la réponse"
            value={formulaireSuivi.etat_reponse}
            onChange={(e) => modifierSuivi('etat_reponse', e.target.value)}
            placeholder="— Non précisé —"
          >
            {Object.entries(ETATS_REPONSE_CORRESPONDANCE).map(([code, libelle]) => (
              <option key={code} value={code}>
                {libelle}
              </option>
            ))}
          </Select>
          <Input
            label="Date de réponse"
            type="datetime-local"
            value={formulaireSuivi.date_reponse}
            onChange={(e) => modifierSuivi('date_reponse', e.target.value)}
          />
          <TextAreaInput
            label="Réponse"
            rows={4}
            maxLength={2000}
            value={formulaireSuivi.reponse}
            onChange={(v) => modifierSuivi('reponse', v)}
            placeholder="Ce que le destinataire a répondu."
          />
          <Select
            label="État de la réception au central"
            value={formulaireSuivi.etat_reception_central}
            onChange={(e) => modifierSuivi('etat_reception_central', e.target.value)}
            placeholder="— Non précisé —"
          >
            {Object.entries(ETATS_RECEPTION_CENTRALE).map(([code, libelle]) => (
              <option key={code} value={code}>
                {libelle}
              </option>
            ))}
          </Select>
        </div>
      </Modal>
    </div>
  );
}

export default CorrespondancesPanel;
