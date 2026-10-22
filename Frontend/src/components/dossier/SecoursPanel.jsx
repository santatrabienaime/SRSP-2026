import { useState, useEffect, useCallback } from 'react';
import {
  Stamp, FileCheck2, Users, PenLine, CircleCheck, CircleDashed, ClipboardList,
  Archive,
} from 'lucide-react';
import { dossierService } from '../../services/dossierService.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useNotification } from '../../hooks/useNotification.js';
import { Card } from '../ui/Card.jsx';
import { Badge } from '../ui/Badge.jsx';
import { Button } from '../ui/Button.jsx';
import { Spinner } from '../ui/Spinner.jsx';
import { Alert } from '../ui/Alert.jsx';
import { TextInput, TextAreaInput } from '../fields/index.jsx';
import { formatDateString, formatDateTime } from '../../utils/formatDate.js';

/**
 * Module Secours de décès — les cinq étapes du mandat.
 *
 * Le cahier des fonctionnalités (§10.3, §10.5) décrit ces étapes :
 * le visa du contrôle financier, l'état de décompte et le mandatement, les
 * références du logiciel Secours, l'état d'émargement, la signature de
 * l'ordonnateur et le cachet.
 *
 * L'écran les présente **comme l'agent les vit** : il ne se demande pas
 * « le cachet est-il posé ? », il regarde où en est le mandat. Les cinq
 * étapes sont donc affichées ensemble, avec leur état, et les actes
 * possibles sont regroupés sous l'étape concernée.
 *
 * Ce panneau existait côté serveur depuis le début ; il était inaccessible
 * depuis l'interface. Les fonctions décrites par le cahier n'étaient donc,
 * pour l'agent, pas du tout disponibles.
 */

/** Les cinq étapes, dans l'ordre où le mandat les traverse. */
const ETAPES = [
  { cle: 'visa', titre: 'Visa du contrôle financier', Icone: Stamp },
  { cle: 'references', titre: 'Références du logiciel Secours', Icone: ClipboardList },
  { cle: 'emargement', titre: 'État d’émargement', Icone: Users },
  { cle: 'signature', titre: 'Signature de l’ordonnateur', Icone: PenLine },
  { cle: 'cachet', titre: 'Cachet, titre et date', Icone: FileCheck2 },
];

export function SecoursPanel({ dossierId, onRefresh }) {
  const { hasAnyPermission } = useAuth();
  const { toastSuccess, toastError } = useNotification();
  const [etat, setEtat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [enCours, setEnCours] = useState(false);
  const [visa, setVisa] = useState({
    numero_visa: '', signe_par: '', date_visa: '', commentaire: '',
  });

  const charger = useCallback(async () => {
    try {
      setLoading(true);
      setErreur(null);
      setEtat(await dossierService.getSecoursEtat(dossierId));
    } catch (e) {
      setErreur(e);
    } finally {
      setLoading(false);
    }
  }, [dossierId]);

  useEffect(() => { Promise.resolve().then(charger); }, [charger]);

  const executer = async (fn, message) => {
    setEnCours(true);
    try {
      await fn();
      toastSuccess(message);
      await charger();
      onRefresh?.();
    } catch (e) {
      toastError(e.message);
    } finally {
      setEnCours(false);
    }
  };

  if (loading) return <Spinner className="py-6" />;

  if (erreur) {
    return (
      <Alert type="warning" title="Module Secours indisponible">
        {erreur.message}
      </Alert>
    );
  }

  if (!etat) {
    return (
      <p className="rounded-md bg-slate-50 px-3 py-4 text-sm text-slate-500">
        Ce dossier ne comporte pas encore de mandatement. Préparez-le depuis
        l’onglet « Secours » pour suivre les cinq étapes du mandat.
      </p>
    );
  }

  const { visa: etatVisa, references, emargement, signature, cachet } = etat;

  /* Une étape est faite quand son élément existe. */
  const etatDe = (cle) => {
    if (cle === 'visa') return etatVisa ? 'faite' : 'a_faire';
    if (cle === 'references') {
      const restants = (references || []).filter((r) => !r.reporte);
      return restants.length === 0 && (references || []).length > 0 ? 'faite' : 'a_faire';
    }
    if (cle === 'emargement') return emargement ? 'faite' : 'a_faire';
    if (cle === 'signature') return signature ? 'faite' : 'a_faire';
    if (cle === 'cachet') return cachet ? 'faite' : 'a_faire';
    return 'a_faire';
  };

  return (
    <div className="space-y-4">
      {/* Les cinq étapes, d'un coup d'œil. */}
      <Card title="Avancement du mandat" subtitle="Les cinq étapes, dans l’ordre où le mandat les traverse">
        <ol className="space-y-2">
          {ETAPES.map(({ cle, titre, Icone }) => {
            const faite = etatDe(cle) === 'faite';
            return (
              <li
                key={cle}
                className="flex items-center gap-3 rounded-md border border-slate-200 px-3 py-2"
              >
                {faite ? (
                  <CircleCheck className="h-4 w-4 shrink-0 text-emerald-600" />
                ) : (
                  <CircleDashed className="h-4 w-4 shrink-0 text-slate-400" />
                )}
                <Icone className="h-4 w-4 shrink-0 text-slate-400" />
                <span className="flex-1 text-sm text-slate-700">{titre}</span>
                <Badge
                  className={faite
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-slate-50 text-slate-600'}
                >
                  {faite ? 'Fait' : 'À faire'}
                </Badge>
              </li>
            );
          })}
        </ol>
      </Card>

      {/* 1.1 — Visa du contrôle financier. */}
      <Card
        title="Visa du contrôle financier"
        subtitle="Numéro de visa, date et signature portée sur la pièce"
      >
        {etatVisa ? (
          <dl className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500">Numéro de visa</dt>
              <dd className="font-medium text-slate-800">{etatVisa.numero_visa}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500">Date du visa</dt>
              <dd className="text-slate-700">{formatDateString(etatVisa.date_visa)}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500">Signé par</dt>
              <dd className="text-slate-700">
                {etatVisa.signe_par || <span className="text-amber-700">non renseignée</span>}
              </dd>
            </div>
            {etatVisa.commentaire && (
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Commentaire</dt>
                <dd className="text-slate-700">{etatVisa.commentaire}</dd>
              </div>
            )}
          </dl>
        ) : hasAnyPermission(['enregistrer_visa_cf']) ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Saisissez les informations visibles sur la décision visée. L’original
              n’est pas modifié : la plateforme n’enregistre que ses références.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextInput
                label="Numéro de visa"
                required
                value={visa.numero_visa}
                onChange={(v) => setVisa((s) => ({ ...s, numero_visa: v }))}
                maxLength={100}
              />
              <TextInput
                label="Date du visa"
                type="date"
                required
                value={visa.date_visa}
                onChange={(e) => setVisa((s) => ({ ...s, date_visa: e.target.value }))}
              />
            </div>
            <TextInput
              label="Signé par"
              value={visa.signe_par}
              onChange={(v) => setVisa((s) => ({ ...s, signe_par: v }))}
              maxLength={150}
              hint="La signature portée sur la pièce papier."
            />
            <TextAreaInput
              label="Commentaire"
              rows={2}
              value={visa.commentaire}
              onChange={(v) => setVisa((s) => ({ ...s, commentaire: v }))}
              maxLength={1000}
            />
            <Button
              onClick={() => executer(
                () => dossierService.enregistrerSecoursVisa(dossierId, visa),
                'Visa du contrôle financier enregistré.'
              )}
              loading={enCours}
              disabled={!visa.numero_visa.trim() || !visa.date_visa}
            >
              <Stamp className="h-4 w-4" /> Enregistrer le visa
            </Button>
          </div>
        ) : (
          <p className="rounded-md bg-slate-50 px-3 py-3 text-sm text-slate-500">
            Ce dossier n’est pas encore visé par le contrôle financier.
          </p>
        )}
      </Card>

      {/* 1.6 — Références du logiciel Secours. */}
      <Card
        title="Références du logiciel Secours"
        subtitle="Références reportées depuis le logiciel métier"
      >
        {(references || []).length === 0 ? (
          <p className="rounded-md bg-slate-50 px-3 py-3 text-sm text-slate-500">
            Aucune référence à reporter pour ce mandat.
          </p>
        ) : (
          <ul className="space-y-2">
            {references.map((r) => (
              <li
                key={r.code}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-slate-200 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium text-slate-700">{r.libelle}</p>
                  <p className="text-xs text-slate-400">Code : {r.code}</p>
                </div>
                {r.valeur ? (
                  <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                    {r.valeur}
                  </Badge>
                ) : hasAnyPermission(['generer_etat_emargement']) ? (
                  <Button
                    size="sm"
                    variant="outline"
                    loading={enCours}
                    onClick={() => executer(
                      () => dossierService.marquerSecoursReference(dossierId, r.code),
                      `Référence ${r.code} reportée.`
                    )}
                  >
                    Reporter
                  </Button>
                ) : (
                  <Badge className="border-slate-200 bg-slate-50 text-slate-600">
                    à reporter
                  </Badge>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* 1.6 — État d'émargement. */}
      <Card title="État d’émargement" subtitle="Remise de la somme aux bénéficiaires">
        {emargement ? (
          <dl className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500">Généré le</dt>
              <dd className="text-slate-700">{formatDateTime(emargement.genere_le)}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500">Bénéficiaires</dt>
              <dd className="text-slate-700">
                {(emargement.beneficiaires || []).length}
              </dd>
            </div>
          </dl>
        ) : hasAnyPermission(['generer_etat_emargement']) ? (
          <Button
            onClick={() => executer(
              () => dossierService.genererSecoursEmargement(dossierId),
              'État d’émargement généré.'
            )}
            loading={enCours}
          >
            <Users className="h-4 w-4" /> Générer l’état d’émargement
          </Button>
        ) : (
          <p className="rounded-md bg-slate-50 px-3 py-3 text-sm text-slate-500">
            L’état d’émargement n’est pas encore généré.
          </p>
        )}
      </Card>

      {/* 1.7 — Signature des pièces par l’ordonnateur. */}
      <Card
        title="Signature de l’ordonnateur"
        subtitle="Signature des pièces du mandat"
      >
        {signature ? (
          <>
            <dl className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Référence</dt>
                <dd className="font-medium text-slate-800">{signature.reference_signature}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Signé le</dt>
                <dd className="text-slate-700">{formatDateTime(signature.signe_le)}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Copie signée archivée le</dt>
                <dd className="text-slate-700">
                  {signature.archive_le ? formatDateTime(signature.archive_le) : '—'}
                </dd>
              </div>
            </dl>

            {/* Archiver la copie signée est le dernier geste du mandat.
                Sans cela, la signature reste un état indéfiniment : personne
                ne sait si la copie papier a été conservée. */}
            {signature.archive_le ? (
              <p className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                La copie signée est archivée.
              </p>
            ) : hasAnyPermission(['archiver_copie_mandatement', 'archiver_dossier']) ? (
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                loading={enCours}
                onClick={() => executer(
                  () => dossierService.archiverSecoursSignature(dossierId),
                  'Copie signée archivée.'
                )}
              >
                <Archive className="h-3.5 w-3.5" /> Archiver la copie signée
              </Button>
            ) : null}
          </>
        ) : hasAnyPermission(['signer_pieces_mandatement']) ? (
          <SignatureSecours dossierId={dossierId} onExecuter={executer} enCours={enCours} />
        ) : (
          <p className="rounded-md bg-slate-50 px-3 py-3 text-sm text-slate-500">
            Les pièces du mandat ne sont pas encore signées.
          </p>
        )}
      </Card>

      {/* 2.4 — Cachet, titre et date de l’ordonnateur. */}
      <Card
        title="Cachet, titre et date"
        subtitle="Identification portée sur la pièce"
      >
        {cachet ? (
          <dl className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500">Titre</dt>
              <dd className="font-medium text-slate-800">{cachet.titre_ordonnateur}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500">Nom</dt>
              <dd className="text-slate-700">{cachet.nom_ordonnateur}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500">Date du cachet</dt>
              <dd className="text-slate-700">{formatDateString(cachet.date_cachet)}</dd>
            </div>
          </dl>
        ) : hasAnyPermission(['apposer_cachet']) ? (
          <CachetSecours dossierId={dossierId} onExecuter={executer} enCours={enCours} />
        ) : (
          <p className="rounded-md bg-slate-50 px-3 py-3 text-sm text-slate-500">
            Le cachet n’est pas encore apposé.
          </p>
        )}
      </Card>
    </div>
  );
}

/** Formulaire de signature des pièces du mandat. */
function SignatureSecours({ dossierId, onExecuter, enCours }) {
  const [reference, setReference] = useState('');
  const [observations, setObservations] = useState('');

  return (
    <div className="space-y-3">
      <TextInput
        label="Référence de signature"
        required
        value={reference}
        onChange={setReference}
        maxLength={100}
        placeholder="N° 045/SEC/2026"
      />
      <TextAreaInput
        label="Observations"
        rows={2}
        value={observations}
        onChange={setObservations}
        maxLength={1000}
      />
      <Button
        onClick={() => onExecuter(
          () => dossierService.enregistrerSecoursSignature(dossierId, {
            reference_signature: reference,
            observations,
          }),
          'Signature enregistrée.'
        )}
        loading={enCours}
        disabled={reference.trim().length < 5}
      >
        <PenLine className="h-4 w-4" /> Enregistrer la signature
      </Button>
    </div>
  );
}

/** Formulaire d'apposition du cachet. */
function CachetSecours({ dossierId, onExecuter, enCours }) {
  const [form, setForm] = useState({
    titre_ordonnateur: '', nom_ordonnateur: '', date_cachet: '', observations: '',
  });

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <TextInput
          label="Titre de l’ordonnateur"
          required
          value={form.titre_ordonnateur}
          onChange={(v) => setForm((f) => ({ ...f, titre_ordonnateur: v }))}
          maxLength={200}
        />
        <TextInput
          label="Nom de l’ordonnateur"
          required
          value={form.nom_ordonnateur}
          onChange={(v) => setForm((f) => ({ ...f, nom_ordonnateur: v }))}
          maxLength={150}
        />
      </div>
      <TextInput
        label="Date du cachet"
        type="date"
        required
        value={form.date_cachet}
        onChange={(e) => setForm((f) => ({ ...f, date_cachet: e.target.value }))}
      />
      <TextAreaInput
        label="Observations"
        rows={2}
        value={form.observations}
        onChange={(v) => setForm((f) => ({ ...f, observations: v }))}
        maxLength={500}
      />
      <Button
        onClick={() => onExecuter(
          () => dossierService.apposerSecoursCachet(dossierId, form),
          'Cachet enregistré.'
        )}
        loading={enCours}
        disabled={!form.titre_ordonnateur.trim() || !form.nom_ordonnateur.trim() || !form.date_cachet}
      >
        <FileCheck2 className="h-4 w-4" /> Enregistrer le cachet
      </Button>
    </div>
  );
}

export default SecoursPanel;
