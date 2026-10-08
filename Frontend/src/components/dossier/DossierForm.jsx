import { useState, useEffect, useMemo, useRef } from 'react';
import { dossierService } from '../../services/dossierService.js';
import { referentielService } from '../../services/referentielService.js';
import { divisionService } from '../../services/divisionService.js';
import { Button } from '../ui/Button.jsx';
import { Input } from '../ui/Input.jsx';
import { Select } from '../ui/Select.jsx';
import { Alert } from '../ui/Alert.jsx';
import {
  CINInput,
  PhoneInput,
  EmailInput,
  NameInput,
  FirstNameInput,
  AddressInput,
  ObservationInput,
  TextAreaInput,
} from '../fields/index.jsx';
import { todayISO, pourChampDate } from '../../utils/formatDate.js';
import { validerDossier, validerTout, cinPlausible, compacterCIN } from '../../utils/validationDossier.js';
import { useNotification } from '../../hooks/useNotification.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { CheckCircle2, Info, Search, ArrowLeft, ArrowRight, Check } from 'lucide-react';

/* Les règles de saisie — dont le format du matricule — vivent dans
   utils/validationDossier.js, où elles sont testables. Voir ce fichier pour
   pourquoi un format strict est un défaut : il bloquait l'agent. */

const vide = (initial) => ({
  type_id: initial?.type_id ?? '',
  objet: initial?.objet ?? '',
  demandeur_nom: initial?.demandeur_nom ?? '',
  demandeur_prenom: initial?.demandeur_prenom ?? '',
  demandeur_tel: initial?.demandeur_tel ?? '',
  demandeur_email: initial?.demandeur_email ?? '',
  demandeur_adresse: initial?.demandeur_adresse ?? '',
  demandeur: initial?.demandeur ?? '',
  matricule: initial?.matricule ?? '',
  date_reception: initial?.date_reception ? pourChampDate(initial.date_reception) : todayISO(),
  division_id: initial?.division_id ?? '',
  priorite_id: initial?.priorite_id ?? '',
  observation: initial?.observation ?? '',
  date_limite: initial?.date_limite ? pourChampDate(initial.date_limite) : '',
});

/**
 * Formulaire de création / modification d'un dossier, en trois étapes.
 *
 * L'étape 1 choisit le type, qui détermine seul la division : la sélectionner
 * séparément serait une question sans réponse, la division n'étant pas libre.
 *
 * L'étape 2 est celle où se joue l'accueil du demandeur : CIN, identité,
 * coordonnées. Le CIN interroge le système pendant la saisie et propose de
 * reprendre les informations déjà connues.
 *
 * L'étape 3 porte l'objet, la priorité et l'échéance, puis le récapitulatif.
 *
 * Le mode édition reste en un seul bloc : les étapes ont un intérêt quand on
 * part de zéro, et ralentiraient la simple correction d'un champ.
 */
export function DossierForm({ initial = null, onSaved }) {
  const { toastSuccess, toastError } = useNotification();

  const [referentiel, setReferentiel] = useState({ types_dossiers: [], priorites: [], statuts: [] });
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState(() => vide(initial));
  const [etape, setEtape] = useState(1);

  // Recherche du demandeur pendant la saisie du CIN.
  const [recherche, setRecherche] = useState(null);
  const [verifEnCours, setVerifEnCours] = useState(false);
  const cinDebounce = useDebounce(form.matricule, 500);
  const derniereRecherche = useRef('');

  // Routage automatique : la division affichée découle du type choisi.
  // L'utilisateur ne la saisit plus (spécification « Routage automatique »).
  const divisionDuType = useMemo(() => {
    if (!form.type_id || !divisions.length) return null;
    return divisions.find((d) => d.type_dossier_id === Number(form.type_id)) || null;
  }, [form.type_id, divisions]);

  useEffect(() => {
    Promise.all([referentielService.get(), divisionService.list()])
      .then(([ref, divs]) => {
        setReferentiel(ref);
        setDivisions(Array.isArray(divs) ? divs : []);
        setLoading(false);
      })
      .catch((e) => {
        setError(e);
        setLoading(false);
      });
  }, []);

  /* Vérification du CIN pendant la saisie.
     On n'interroge le serveur que si le CIN est complet, et jamais deux fois
     pour la même valeur : une saisie caractère par caractère déclencherait
     autant d'appels que de lettres. */
  useEffect(() => {
    if (initial) return undefined; // pas de recherche en modification
    const cin = compacterCIN(cinDebounce);
    // On n'interroge le serveur que sur un matricule plausible : chercher un
    // dossier à un numéro tronqué ne peut rien retourner, et afficherait
    // « inconnu » à chaque frappe.
    if (!cin || !cinPlausible(cin)) {
      Promise.resolve().then(() => setRecherche(null));
      return undefined;
    }
    if (cin === derniereRecherche.current) return undefined;
    derniereRecherche.current = cin;

    let actif = true;
    Promise.resolve().then(() => { if (actif) setVerifEnCours(true); });
    dossierService.rechercherParCIN(form.matricule)
      .then((r) => { if (actif) setRecherche(r); })
      .catch(() => { if (actif) setRecherche(null); })
      .finally(() => { if (actif) setVerifEnCours(false); });
    return () => { actif = false; };
  }, [cinDebounce, form.matricule, initial]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  /** Setter pour les composants de champ (useInputControl) :
      ils reçoivent la valeur formatée, pas l'événement. */
  const setVal = (field) => (v) => setForm((f) => ({ ...f, [field]: v }));

  /**
   * Reprend les coordonnées déjà connues.
   *
   * On ne remplace que les champs VIDES : une secrétaire qui a rectifié un nom
   * voit sa correction écrasée si on la remplit intégralement.
   */
  const utiliserIdentite = () => {
    if (!recherche?.identite) return;
    setForm((f) => ({
      ...f,
      demandeur_nom: f.demandeur_nom || recherche.identite.nom || '',
      demandeur_prenom: f.demandeur_prenom || recherche.identite.prenom || '',
      demandeur_tel: f.demandeur_tel || recherche.identite.telephone || '',
      demandeur_email: f.demandeur_email || recherche.identite.email || '',
      demandeur_adresse: f.demandeur_adresse || recherche.identite.adresse || '',
    }));
  };

  /* Le nom affiché est dérivé des deux champs, pas saisi une troisième fois :
     trois sources pour un seul nom finissent par diverger. */
  useEffect(() => {
    if (initial) return;
    const { demandeur_nom: nom, demandeur_prenom: prenom } = form;
    if (!nom && !prenom) return;
    Promise.resolve().then(() => setForm((f) => ({ ...f, demandeur: [nom, prenom].filter(Boolean).join(' ') })));
  }, [form.demandeur_nom, form.demandeur_prenom, initial]);

  /* La validation vit dans utils/validationDossier.js, donc testable sans
     navigateur. Elle distingue ce qui BLOQUE (erreur) de ce qui INFORME
     (avertissement) : exiger un format de CIN strict immobilisait l'agent, les
     numéros réels du service n'ayant pas tous la même longueur. */
  const etape1 = useMemo(() => validerDossier(form, 1), [form]);
  const etape2 = useMemo(() => validerDossier(form, 2), [form]);
  const etape3 = useMemo(() => validerDossier(form, 3), [form]);
  const tout = useMemo(() => validerTout(form), [form]);

  const problemesEtape1 = etape1.erreurs;
  const problemesEtape2 = etape2.erreurs;
  const problemesEtape3 = etape3.erreurs;
  const avertissementsEtape = { 1: etape1, 2: etape2, 3: etape3 }[etape].avertissements;
  const validation = tout.erreurs;

  const allerA = (n) => {
    setError(null);
    setEtape(n);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (validation.length) {
      setError({ message: 'Veuillez corriger les points suivants :', details: validation });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        type_id: Number(form.type_id),
        objet: form.objet,
        demandeur: form.demandeur,
        demandeur_nom: form.demandeur_nom || null,
        demandeur_prenom: form.demandeur_prenom || null,
        demandeur_tel: form.demandeur_tel || null,
        demandeur_email: form.demandeur_email || null,
        demandeur_adresse: form.demandeur_adresse || null,
        matricule: form.matricule || null,
        date_reception: form.date_reception,
        priorite_id: Number(form.priorite_id),
        observation: form.observation || null,
        date_limite: form.date_limite || null,
      };
      if (initial) {
        await dossierService.update(initial.id, payload);
        toastSuccess('Dossier mis à jour.');
        onSaved?.(initial.id);
      } else {
        const created = await dossierService.create(payload);
        toastSuccess(`Dossier ${created.numero} créé et enregistré.`);
        onSaved?.(created.id);
      }
    } catch (err) {
      setError(err);
      toastError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="py-10 text-center text-sm text-slate-400">Chargement du formulaire…</p>;

  /* Mode modification : un seul bloc. Les étapes servent l'accueil d'un dossier
     neuf, et ralentiraient la correction d'un champ sur un dossier existant. */
  if (initial) {
    return (
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <Alert type="error" title="Impossible d'enregistrer">
            {error.message}
            {error.details && (
              <ul className="mt-1 list-inside list-disc text-xs">
                {error.details.map((d) => <li key={d}>{d}</li>)}
              </ul>
            )}
          </Alert>
        )}

        <fieldset disabled>
          <legend className="mb-2 block text-sm font-medium text-slate-700">
            Type de dossier <span className="text-red-500">*</span>
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {referentiel.types_dossiers.map((t) => (
              <label
                key={t.id}
                className={`flex items-start gap-2 rounded-md border px-3 py-2 text-sm ${
                  String(form.type_id) === String(t.id)
                    ? 'border-emerald-400 bg-emerald-50 ring-1 ring-emerald-300'
                    : 'border-slate-200 bg-white opacity-70'
                }`}
              >
                <input
                  type="radio"
                  name="type_id_mode"
                  value={t.id}
                  checked={String(form.type_id) === String(t.id)}
                  readOnly
                  className="mt-0.5 h-4 w-4 accent-emerald-600"
                />
                <span className="min-w-0">
                  <span className="block font-semibold text-slate-800">{t.libelle}</span>
                  {t.description && (
                    <span className="block text-[11px] leading-tight text-slate-500">{t.description}</span>
                  )}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Priorité" required value={form.priorite_id} onChange={set('priorite_id')}>
            <option value="">Sélectionner…</option>
            {referentiel.priorites.map((p) => (
              <option key={p.id} value={p.id}>{p.libelle}</option>
            ))}
          </Select>
          <div>
            <p className="mb-1 block text-sm font-medium text-slate-700">Division affectée</p>
            <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span className="font-semibold">{divisionDuType?.nom || '—'}</span>
            </div>
          </div>
        </div>

        <TextAreaInput
          label="Objet"
          required
          rows={3}
          maxLength={500}
          value={form.objet}
          onChange={(v) => setVal('objet')(v.charAt(0).toUpperCase() + v.slice(1))}
          placeholder="Objet de la demande…"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <NameInput label="Nom" required value={form.demandeur_nom} onChange={setVal('demandeur_nom')} placeholder="RAKOTO" />
          <FirstNameInput label="Prénom" value={form.demandeur_prenom} onChange={setVal('demandeur_prenom')} placeholder="Jean" />
          <CINInput label="Matricule / CIN" value={form.matricule} onChange={setVal('matricule')} />
          <PhoneInput label="Téléphone" value={form.demandeur_tel} onChange={setVal('demandeur_tel')} />
          <EmailInput label="Email" value={form.demandeur_email} onChange={setVal('demandeur_email')} placeholder="rakoto.jean@email.mg" />
          <AddressInput value={form.demandeur_adresse} onChange={setVal('demandeur_adresse')} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Date de réception" required type="date" value={form.date_reception} onChange={set('date_reception')} />
          <Input label="Date limite (optionnel)" type="date" value={form.date_limite} onChange={set('date_limite')} />
        </div>

        <ObservationInput
          value={form.observation}
          onChange={setVal('observation')}
        />


        <div className="flex justify-end gap-2">
          <Button type="submit" loading={saving}>Enregistrer les modifications</Button>
        </div>
      </form>
    );
  }

  const ETAPES = [
    { n: 1, titre: 'Type de dossier', problemes: problemesEtape1 },
    { n: 2, titre: 'Demandeur', problemes: problemesEtape2 },
    { n: 3, titre: 'Dossier', problemes: problemesEtape3 },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <Alert type="error" title={etape === 3 ? 'Impossible d\'enregistrer' : 'Vérification'}>
          {error.message}
          {error.details && (
            <ul className="mt-1 list-inside list-disc text-xs">
              {error.details.map((d) => <li key={d}>{d}</li>)}
            </ul>
          )}
        </Alert>
      )}

      {/* Avertissements : ils n'empêchent PAS de continuer, contrairement aux
          erreurs. Les afficher évite que l'agent se demande pourquoi le système
          doute d'une saisie qu'il sait correcte. */}
      {avertissementsEtape.length > 0 && (
        <Alert type="warning" title="Points à vérifier">
          <ul className="list-inside list-disc text-xs">
            {avertissementsEtape.map((m) => <li key={m}>{m}</li>)}
          </ul>
          <p className="mt-1 text-[11px] text-slate-500">
            Vous pouvez continuer : ces points n\'empêchent pas l\'enregistrement.
          </p>
        </Alert>
      )}

      {/* Progression : la secrétaire sait où elle en est dans la procédure. */}
      <ol className="flex items-center gap-2">
        {ETAPES.map((e, i) => {
          const actif = etape === e.n;
          const fait = etape > e.n;
          return (
            <li key={e.n} className="flex flex-1 items-center gap-2">
              <button
                type="button"
                onClick={() => allerA(e.n)}
                className={`flex min-w-0 flex-1 items-center gap-2 rounded-md border px-2.5 py-2 text-left text-xs transition ${
                  actif
                    ? 'border-primary-500 bg-primary-50 text-primary-800'
                    : fait
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                      : 'border-slate-200 bg-white text-slate-500'
                }`}
              >
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                  actif ? 'bg-primary-600 text-white' : fait ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {fait ? <Check className="h-3 w-3" /> : e.n}
                </span>
                <span className="truncate font-medium">
                  Étape {e.n}/3 — {e.titre}
                </span>
              </button>
              {i < ETAPES.length - 1 && <ArrowRight className="h-3 w-3 shrink-0 text-slate-300" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>

      {/* ── Étape 1 : le type, qui détermine seul la division ── */}
      {etape === 1 && (
        <fieldset className="space-y-3">
          <legend className="block text-sm font-medium text-slate-700">
            Sélectionnez le type de dossier <span className="text-red-500">*</span>
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {referentiel.types_dossiers.map((t) => (
              <label
                key={t.id}
                className={`flex cursor-pointer items-start gap-2 rounded-md border px-3 py-2 text-sm transition ${
                  String(form.type_id) === String(t.id)
                    ? 'border-emerald-400 bg-emerald-50 ring-1 ring-emerald-300'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="type_id"
                  value={t.id}
                  checked={String(form.type_id) === String(t.id)}
                  onChange={set('type_id')}
                  className="mt-0.5 h-4 w-4 accent-emerald-600"
                />
                <span className="min-w-0">
                  <span className="block font-semibold text-slate-800">{t.libelle}</span>
                  {t.description && (
                    <span className="block text-[11px] leading-tight text-slate-500">
                      {t.description}
                    </span>
                  )}
                </span>
              </label>
            ))}
          </div>
          <p className="flex items-center gap-1 text-[11px] text-slate-500">
            <Info className="h-3 w-3 shrink-0" />
            La division sera déterminée automatiquement à partir du type choisi.
          </p>
          {/* Routage automatique : la division découle du type (règle 1). */}
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
            Division affectée
          </p>
          <div className="mt-1 flex items-center gap-2 text-sm">
            {divisionDuType ? (
              <>
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span className="font-semibold text-emerald-900">{divisionDuType.nom}</span>
                <span className="text-xs text-emerald-700">(automatique)</span>
              </>
            ) : (
              <span className="text-slate-500">Choisir un type pour déterminer la division</span>
            )}
          </div>
        </div>

          <div className="flex items-end justify-end">
            <Button type="button" onClick={() => allerA(2)} disabled={problemesEtape1.length > 0}>
              Continuer <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </fieldset>
      )}

      {/* ── Étape 2 : le demandeur ── */}
      {etape === 2 && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <CINInput
              label="CIN du demandeur"
              value={form.matricule}
              onChange={(v) => {
                setVal('matricule')(v);
                setRecherche(null);
              }}
              hint={verifEnCours ? 'Recherche en cours…' : undefined}
            />
            <div className="flex items-end">
              {/* Résultat de la recherche : une aide, jamais un blocage. */}
              {recherche?.trouve ? (
                <div className="w-full rounded-md border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
                  <p className="flex items-center gap-1.5 font-semibold">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Demandeur déjà connu
                  </p>
                  <p className="mt-1">
                    {recherche.identite?.nom} — {recherche.dossiers.length} dossier(s) existant(s) :
                    {' '}{recherche.dossiers.slice(0, 3).map((d) => d.numero).join(', ')}
                  </p>
                  <Button type="button" size="sm" variant="secondary" className="mt-2" onClick={utiliserIdentite}>
                    Utiliser ces informations
                  </Button>
                </div>
              ) : recherche && !recherche.trouve ? (
                <p className="w-full rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                  <Search className="mr-1 inline h-3.5 w-3.5" />
                  Ce CIN n'est pas encore connu : saisissez les informations.
                </p>
              ) : (
                <p className="w-full text-[11px] text-slate-500">
                  Saisissez le CIN complet pour retrouver une fiche déjà enregistrée.
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <NameInput label="Nom" required value={form.demandeur_nom} onChange={setVal('demandeur_nom')} placeholder="RAKOTO" />
            <FirstNameInput label="Prénom" value={form.demandeur_prenom} onChange={setVal('demandeur_prenom')} placeholder="Jean" />
            <PhoneInput label="Téléphone" value={form.demandeur_tel} onChange={setVal('demandeur_tel')} />
            <EmailInput label="Email" value={form.demandeur_email} onChange={setVal('demandeur_email')} placeholder="rakoto.jean@email.mg" />
          </div>
          <AddressInput value={form.demandeur_adresse} onChange={setVal('demandeur_adresse')} />

          <div className="flex justify-between">
            <Button type="button" variant="ghost" onClick={() => allerA(1)}>
              <ArrowLeft className="h-4 w-4" /> Retour
            </Button>
            <Button type="button" onClick={() => allerA(3)} disabled={problemesEtape2.length > 0}>
              Continuer <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ── Étape 3 : l'objet, la priorité, l'échéance, puis le récapitulatif ── */}
      {etape === 3 && (
        <div className="space-y-4">
          <TextAreaInput
            label="Objet"
            required
            rows={3}
            maxLength={500}
            value={form.objet}
            onChange={(v) => setVal('objet')(v.charAt(0).toUpperCase() + v.slice(1))}
            placeholder="Demande d'intégration"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Priorité" required value={form.priorite_id} onChange={set('priorite_id')}>
              <option value="">Sélectionner…</option>
              {referentiel.priorites.map((p) => (
                <option key={p.id} value={p.id}>{p.libelle}</option>
              ))}
            </Select>
            <Input label="Date limite (optionnel)" type="date" value={form.date_limite} onChange={set('date_limite')} />
          </div>
          <ObservationInput
            value={form.observation}
            onChange={setVal('observation')}
          />

          {/* Récapitulatif : la secrétaire vérifie avant de valider. */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Récapitulatif
            </p>
            <dl className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Type</dt>
                <dd className="font-medium text-slate-800">
                  {referentiel.types_dossiers.find((t) => String(t.id) === String(form.type_id))?.libelle || '—'}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Division</dt>
                <dd className="font-medium text-emerald-700">{divisionDuType?.nom || '—'} (automatique)</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Demandeur</dt>
                <dd className="font-medium text-slate-800">
                  {form.demandeur || '—'}{form.matricule ? ` (CIN : ${form.matricule})` : ''}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Priorité</dt>
                <dd className="font-medium text-slate-800">
                  {referentiel.priorites.find((p) => String(p.id) === String(form.priorite_id))?.libelle || '—'}
                </dd>
              </div>
            </dl>
          </div>

          <div className="flex justify-between">
            <Button type="button" variant="ghost" onClick={() => allerA(2)}>
              <ArrowLeft className="h-4 w-4" /> Retour
            </Button>
            <Button type="submit" loading={saving} disabled={validation.length > 0}>
              <Check className="h-4 w-4" /> Créer le dossier
            </Button>
          </div>
        </div>
      )}
    </form>
  );
}

export default DossierForm;