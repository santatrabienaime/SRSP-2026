import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Save, ShieldCheck, BadgeCheck, RefreshCw, TriangleAlert, SlidersHorizontal,
} from 'lucide-react';
import { dossierService } from '../../services/dossierService.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useNotification } from '../../hooks/useNotification.js';
import { Card } from '../ui/Card.jsx';
import { Button } from '../ui/Button.jsx';
import { Badge } from '../ui/Badge.jsx';
import { Spinner } from '../ui/Spinner.jsx';
import { Alert } from '../ui/Alert.jsx';
import { Modal } from '../ui/Modal.jsx';
import { ConfirmDialog } from '../ui/ConfirmDialog.jsx';
import { Select } from '../ui/Select.jsx';
import { TextInput, TextAreaInput, DateInput } from '../fields/index.jsx';
import { formatDateString, formatDateTime, pourChampDate, todayISO } from '../../utils/formatDate.js';
import { DECISIONS_CONTROLE_OPERATION } from '../../config/constants.js';

/**
 * Données propres à l'opération d'un dossier.
 *
 * Les divisions Solde et Pensions portent, sur chacun de leurs dossiers, des
 * données qui n'appartiennent qu'à l'opération : la date d'un transfert, la
 * version produite d'une fiche de contrôle, la mention « Vu bon à payer » d'un
 * bon de caisse.
 *
 * Le formulaire n'est **pas figé** : il est construit sur le **schéma de
 * l'opération**, que l'administration tient à l'écran *Référentiel*. Un agent
 * qui instruit une domiciliation ne voit donc ni « période concernée », ni
 * « version produite » — et il voit exactement les champs qui le
 * concernent.
 *
 * Deux gestes distincts, et c'est le fond de la chose :
 *
 *   - l'agent qui instruit le dossier **prépare** l'opération ;
 *   - le chef de division **la contrôle** : il enregistre sa décision, et
 *     c'est cette décision qui fait foi.
 *
 * L'écran ne confond jamais les deux : celui qui saisit ne contrôle pas, et
 * celui qui contrôle n'écrit pas la saisie. Aucun montant n'est calculé ici —
 * il est saisi, sa source est conservée, et le contrôle atteste qu'il a été
 * vu.
 */

/** Montant lisible : « 1 500 000,00 Ar ». */
function formaterMontant(valeur) {
  if (valeur === null || valeur === undefined || valeur === '') return '—';
  const nombre = Number(valeur);
  if (Number.isNaN(nombre)) return '—';
  return `${new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(nombre)} Ar`;
}

/** Une valeur du schéma, prête pour un champ de formulaire. */
function valeurPourChamp(champ, valeur) {
  if (valeur === null || valeur === undefined) return '';
  /* Le montant part en nombre côté serveur : le champ doit donc le rendre
     tel quel, et non au format local. */
  if (champ.cle === 'montant') return String(valeur);
  /* Une date stockée en base est une date SQL : elle doit être rendue dans
     le format du champ, sinon le navigateur la lit un jour décalé. */
  if (champ.type_champ === 'date') {
    return pourChampDate(valeur);
  }
  return String(valeur);
}

/** Un champ du schéma, rendu selon son type déclaré. */
function Champ({ champ, valeur, onChange, erreur }) {
  const commun = {
    label: champ.libelle,
    value: valeur,
    onChange,
    error: erreur || undefined,
    required: Boolean(champ.requis),
  };

  if (champ.type_champ === 'nombre') {
    return (
      <TextInput
        {...commun}
        type="number"
        step="0.01"
        min="0"
        hint={champ.aide || undefined}
      />
    );
  }
  if (champ.type_champ === 'date') {
    return <DateInput {...commun} hint={champ.aide || undefined} />;
  }
  if (champ.type_champ === 'textarea') {
    return (
      <TextAreaInput
        {...commun}
        rows={3}
        maxLength={2000}
        hint={champ.aide || undefined}
      />
    );
  }
  if (champ.type_champ === 'choix') {
    const options = String(champ.options || '').split('|').filter(Boolean);
    return (
      <Select
        {...commun}
        placeholder="— Choisir —"
        hint={champ.aide || undefined}
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </Select>
    );
  }
  return (
    <TextInput
      {...commun}
      maxLength={255}
      hint={champ.aide || undefined}
    />
  );
}

export function OperationPanel({ dossier }) {
  const { hasAnyPermission } = useAuth();
  const { toastSuccess, toastError } = useNotification();

  const [reponse, setReponse] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [enregistrement, setEnregistrement] = useState(false);

  /* Le formulaire et sa référence : la référence est l'état du serveur au
     dernier chargement. Le bouton « Enregistrer » compare les deux — il ne
     s'active que si l'agent a réellement changé quelque chose. */
  const [formulaire, setFormulaire] = useState({});
  const [reference, setReference] = useState({});

  /* Contrôle : la décision du chef de division. */
  const [modaleControle, setModaleControle] = useState(false);
  const [controle, setControle] = useState({
    decision: '',
    observations: '',
    date_controle: todayISO(),
  });
  const [controleEnCours, setControleEnCours] = useState(false);

  /* Validation du montant. */
  const [demandeValidation, setDemandeValidation] = useState(false);
  const [validationEnCours, setValidationEnCours] = useState(false);

  const peutSaisir = hasAnyPermission(['saisir_donnees_operation']);
  const peutControler = hasAnyPermission(['controler_donnees_operation']);

  const charger = useCallback(async () => {
    try {
      setChargement(true);
      setErreur(null);
      const data = await dossierService.getOperation(dossier.id);
      setReponse(data);
      const valeurs = data?.valeurs || {};
      setFormulaire(valeurs);
      setReference(valeurs);
    } catch (e) {
      setErreur(e);
    } finally {
      setChargement(false);
    }
  }, [dossier.id]);

  useEffect(() => { Promise.resolve().then(charger); }, [charger]);

  const modifier = (cle, valeur) =>
    setFormulaire((f) => ({ ...f, [cle]: valeur }));

  const modifie = useMemo(
    () => JSON.stringify(formulaire) !== JSON.stringify(reference),
    [formulaire, reference]
  );

  const schema = reponse?.schema || [];
  const donnees = reponse?.donnees || null;

  /* La charge envoyée au serveur : le montant part en nombre (le serveur
     refuse un texte), et un champ laissé vide part à null — la ligne
     enregistrée garde ainsi « rien de saisi » plutôt qu'une chaîne vide. */
  const charge = () => {
    const valeurs = {};
    for (const champ of schema) {
      const v = formulaire[champ.cle];
      if (champ.cle === 'montant') {
        valeurs[champ.cle] = v === '' || v === null || v === undefined ? null : Number(v);
      } else {
        valeurs[champ.cle] = v === '' ? null : v;
      }
    }
    return { valeurs };
  };

  const enregistrer = async () => {
    setEnregistrement(true);
    try {
      await dossierService.saveOperation(dossier.id, charge());
      toastSuccess('Données de l’opération enregistrées.');
      await charger();
    } catch (e) {
      toastError(e.message);
    } finally {
      setEnregistrement(false);
    }
  };

  const ouvrirControle = () => {
    setControle({
      decision: donnees?.decision_controle || '',
      observations: donnees?.observations_controle || '',
      date_controle: todayISO(),
    });
    setModaleControle(true);
  };

  const controler = async () => {
    if (!controle.decision) {
      toastError('La décision de contrôle est requise.');
      return;
    }
    setControleEnCours(true);
    try {
      await dossierService.controlerOperation(dossier.id, {
        decision: controle.decision,
        observations: controle.observations || null,
        date_controle: controle.date_controle || null,
      });
      toastSuccess('Contrôle de l’opération enregistré.');
      setModaleControle(false);
      await charger();
    } catch (e) {
      toastError(e.message);
    } finally {
      setControleEnCours(false);
    }
  };

  /* La validation porte sur le montant, rien d'autre. Les observations du
     contrôle sont renvoyées telles quelles : ne pas les renvoyer effacerait
     la décision du contrôleur. */
  const valider = async () => {
    setValidationEnCours(true);
    try {
      await dossierService.validerMontantOperation(dossier.id, {
        observations: donnees?.observations_controle || null,
      });
      toastSuccess('Montant validé.');
      setDemandeValidation(false);
      await charger();
    } catch (e) {
      toastError(e.message);
    } finally {
      setValidationEnCours(false);
    }
  };

  if (chargement) return <Spinner className="py-6" />;

  if (erreur) {
    return (
      <Alert type="warning" title="Données de l’opération indisponibles">
        {erreur.message}
      </Alert>
    );
  }

  const montantSaisi =
    donnees?.montant !== null && donnees?.montant !== undefined && donnees?.montant !== '';

  /* Une opération sans schéma n'a pas de formulaire : le dire est plus utile
     qu'un écran vide. */
  const sansSchema = schema.length === 0;

  return (
    <div className="space-y-5">
      <Card
        title="Données de l’opération"
        subtitle={reponse?.operation?.libelle || 'Opération du dossier'}
        actions={
          <Button variant="ghost" size="sm" onClick={charger} title="Recharger les données">
            <RefreshCw className="h-4 w-4" />
          </Button>
        }
      >
        {sansSchema ? (
          <Alert type="info" title="Aucun champ propre à cette opération">
            Les champs communs (référence, dossier mère, période, montant, source,
            observation) restent utilisables sur l’onglet *Opération* de la
            division. Cette opération n’a pas de formulaire spécifique : c’est
            l’administrateur qui peut en définir un depuis *Référentiel*.
          </Alert>
        ) : !peutSaisir ? (
          <p className="rounded-md bg-slate-50 px-3 py-3 text-sm text-slate-500">
            La saisie des données d’opération n’est pas ouverte à votre profil.
            {donnees && ' Les données enregistrées restent consultables ci-dessous.'}
          </p>
        ) : (
          <div className="space-y-4">
            <p className="flex items-start gap-1.5 text-xs text-slate-500">
              <SlidersHorizontal className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                Ces champs sont ceux de l’opération
                {' '}<strong className="font-medium text-slate-700">{reponse?.operation?.libelle}</strong>.
                Ils sont définis par l’administration et évoluent sans développement.
              </span>
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              {schema.map((champ) => (
                <Champ
                  key={champ.cle}
                  champ={champ}
                  valeur={valeurPourChamp(champ, formulaire[champ.cle])}
                  onChange={(v) => modifier(champ.cle, v)}
                />
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={enregistrer} loading={enregistrement} disabled={!modifie}>
                <Save className="h-4 w-4" /> Enregistrer
              </Button>
              {!modifie && (
                <span className="text-xs text-slate-400">
                  Aucune modification à enregistrer.
                </span>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* L'état de l'opération : ce qui est enregistré, et ce qu'en ont dit
          le contrôleur et le validateur. */}
      <Card title="État de l’opération">
        {!donnees ? (
          <p className="rounded-md bg-slate-50 px-3 py-4 text-sm text-slate-500">
            Ce dossier ne comporte pas encore de données d’opération. La saisie
            ci-dessus les enregistrera.
          </p>
        ) : (
          <div className="space-y-4">
            <dl className="grid gap-x-8 sm:grid-cols-2">
              <Ligne
                label="Montant saisi"
                valeur={
                  <span className="font-medium text-slate-800">
                    {formaterMontant(donnees.montant)}
                  </span>
                }
              />
              <Ligne label="Source du montant" valeur={donnees.source_montant} />
              <Ligne
                label="Date de référence"
                valeur={donnees.date_reference ? formatDateString(donnees.date_reference) : null}
              />
              <Ligne label="Destinataire" valeur={donnees.destinataire} />
              <Ligne label="Localité" valeur={donnees.localisation} />
              <Ligne label="Référence externe" valeur={donnees.reference_externe} />
              <Ligne label="Dossier mère" valeur={donnees.reference_dossier_mere} />
              <Ligne label="Période" valeur={donnees.periode} />
            </dl>

            {/* Les champs propres à l'opération : ceux que le schéma a
                déclarés et qui ne sont pas des colonnes communes. */}
            {donnees.donnees && Object.keys(donnees.donnees).length > 0 && (
              <dl className="grid gap-x-8 sm:grid-cols-2">
                {Object.entries(donnees.donnees).map(([cle, valeur]) => (
                  <Ligne
                    key={cle}
                    label={schema.find((c) => c.cle === cle)?.libelle || cle}
                    valeur={valeur}
                  />
                ))}
              </dl>
            )}

            {donnees.observation && (
              <p className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
                <span className="font-semibold">Observation : </span>
                {donnees.observation}
              </p>
            )}

            {/* Les deux traces du contrôle et de la validation : ce sont elles
                qui distinguent une opération vérifiée d'une opération
                seulement saisie. */}
            <div className="space-y-2">
              {donnees.date_controle && (
                <p className="flex flex-wrap items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                  <ShieldCheck className="h-4 w-4 text-slate-400" />
                  <span>
                    Contrôlé le {formatDateTime(donnees.date_controle)}
                    {donnees.controleur_username ? ` par ${donnees.controleur_username}` : ''}
                    {' — décision '}
                    <span className="font-medium text-slate-800">
                      {DECISIONS_CONTROLE_OPERATION[donnees.decision_controle] ||
                        donnees.decision_controle ||
                        'enregistrée'}
                    </span>
                  </span>
                  {donnees.decision_controle && (
                    <Badge
                      className={
                        donnees.decision_controle === 'APPROUVE'
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : donnees.decision_controle === 'RETOURNE'
                            ? 'border-amber-200 bg-amber-50 text-amber-700'
                            : 'border-slate-200 bg-slate-50 text-slate-600'
                      }
                    >
                      {DECISIONS_CONTROLE_OPERATION[donnees.decision_controle] ||
                        donnees.decision_controle}
                    </Badge>
                  )}
                </p>
              )}
              {donnees.observations_controle && (
                <p className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                  <span className="font-semibold">Observations du contrôle : </span>
                  {donnees.observations_controle}
                </p>
              )}
              {donnees.date_validation && (
                <p className="flex flex-wrap items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                  <BadgeCheck className="h-4 w-4" />
                  <span>
                    Montant validé le {formatDateTime(donnees.date_validation)}
                    {donnees.valide_par_username ? ` par ${donnees.valide_par_username}` : ''}.
                  </span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Les actes du chef de division. Un bouton qui aboutirait
            toujours à un 403 est pire que pas de bouton : ils n'existent
            que pour qui a le droit de les faire. */}
        {peutControler && (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
            <Button variant="outline" onClick={ouvrirControle}>
              <ShieldCheck className="h-4 w-4" /> Contrôler l’opération
            </Button>
            <Button
              variant="success"
              onClick={() => setDemandeValidation(true)}
              disabled={!montantSaisi}
              title={
                montantSaisi
                  ? 'Valider le montant saisi'
                  : 'Aucun montant saisi : il n’y a rien à valider'
              }
            >
              <BadgeCheck className="h-4 w-4" /> Valider le montant
            </Button>
            {!montantSaisi && (
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <TriangleAlert className="h-3.5 w-3.5" />
                Aucun montant saisi : il n’y a rien à valider.
              </span>
            )}
          </div>
        )}
      </Card>

      {/* Modale de contrôle : la décision, les observations et la date. */}
      <Modal
        open={modaleControle}
        onClose={() => !controleEnCours && setModaleControle(false)}
        title="Contrôler l’opération"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setModaleControle(false)}
              disabled={controleEnCours}
            >
              Annuler
            </Button>
            <Button onClick={controler} loading={controleEnCours}>
              <ShieldCheck className="h-4 w-4" /> Enregistrer la décision
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Select
            label="Décision"
            required
            value={controle.decision}
            onChange={(e) => setControle((c) => ({ ...c, decision: e.target.value }))}
            placeholder="— Choisir une décision —"
          >
            {Object.entries(DECISIONS_CONTROLE_OPERATION).map(([code, libelle]) => (
              <option key={code} value={code}>
                {libelle}
              </option>
            ))}
          </Select>
          <DateInput
            label="Date de contrôle"
            value={controle.date_controle}
            onChange={(v) => setControle((c) => ({ ...c, date_controle: v }))}
          />
          <TextAreaInput
            label="Observations"
            rows={4}
            maxLength={2000}
            value={controle.observations}
            onChange={(v) => setControle((c) => ({ ...c, observations: v }))}
            placeholder="Ce que le contrôleur a vérifié, et ce qu’il demande le cas échéant."
          />
        </div>
      </Modal>

      {/* Validation du montant : elle porte sur le montant saisi, et rien
          d'autre ne change. */}
      <ConfirmDialog
        open={demandeValidation}
        onClose={() => !validationEnCours && setDemandeValidation(false)}
        onConfirm={valider}
        loading={validationEnCours}
        title="Valider le montant"
        message={`Valider le montant de ${formaterMontant(donnees?.montant)} ? Cette validation est enregistrée au nom de l'agent connecté, avec la date du jour.`}
        confirmLabel="Valider"
      />
    </div>
  );
}

/** Une ligne de la fiche d'état : libellé à gauche, valeur à droite. */
function Ligne({ label, valeur }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 py-2 last:border-0">
      <dt className="shrink-0 text-xs font-medium text-slate-500">{label}</dt>
      <dd className="text-right text-sm text-slate-700">{valeur || '—'}</dd>
    </div>
  );
}

export default OperationPanel;
