import { useState, useEffect, useCallback } from 'react';
import {
  UserPlus, Landmark, Wallet, RefreshCw, Search, AlertTriangle, CheckCircle2,
} from 'lucide-react';
import { immatriculationService } from '../../services/immatriculationService.js';
import { divisionService } from '../../services/divisionService.js';
import { useNotification } from '../../hooks/useNotification.js';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Select } from '../../components/ui/Select.jsx';
import { TextInput, TextAreaInput, DateInput } from '../../components/fields/index.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { AnimatedCard } from '../../components/ui/AnimatedCard.jsx';
import { formatDateString } from '../../utils/formatDate.js';

/**
 * Module d'immatriculation — l'écran de la Coordination.
 *
 * Le cahier (§ 11.2) confie à la Coordination : l'attribution des numéros
 * d'immatriculation aux nouveaux agents publics, l'insertion des nouveaux
 * arrivants dans les systèmes de paie et de pension, les changements de mode
 * de paiement, et les volumes d'activité.
 *
 * L'écran est organisé en trois temps, dans l'ordre où les actes se
 * produisent : la demande d'immatriculation, l'insertion en paie, le
 * changement de mode de paiement.
 */

/** États d'une immatriculation. */
const STATUTS_IMMA = {
  EN_ATTENTE: { label: 'En attente', classe: 'border-amber-200 bg-amber-50 text-amber-700' },
  ACTIVE: { label: 'Active', classe: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  REJETEE: { label: 'Rejetée', classe: 'border-red-200 bg-red-50 text-red-700' },
};

/** Modes de paiement admis. */
const MODES_PAIEMENT = [
  { code: 'VIREMENT', label: 'Virement' },
  { code: 'CHEQUE', label: 'Chèque' },
  { code: 'ESPECES', label: 'Espèces' },
  { code: 'MANDAT', label: 'Mandat' },
];

/** État d'une insertion en paie. */
const STATUTS_INSERTION = {
  A_INSERER: { label: 'À insérer', classe: 'border-amber-200 bg-amber-50 text-amber-700' },
  INSERE: { label: 'Inséré', classe: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  REJETE: { label: 'Rejeté', classe: 'border-red-200 bg-red-50 text-red-700' },
};

export function ImmatriculationsPage() {
  const { toastSuccess, toastError } = useNotification();
  const [liste, setListe] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [volumes, setVolumes] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [recherche, setRecherche] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('');

  const [detail, setDetail] = useState(null);
  const [modaleNouvelle, setModaleNouvelle] = useState(false);
  const [modaleInsertion, setModaleInsertion] = useState(false);
  const [modalePaiement, setModalePaiement] = useState(false);
  const [enCours, setEnCours] = useState(false);

  const [nouvelle, setNouvelle] = useState({
    nom: '', prenom: '', cin: '', date_naissance: '', corps: '',
    grade: '', indice: '', date_entree: '', division_id: '', observations: '',
  });
  const [insertion, setInsertion] = useState({
    matricule_augure: '', situation_familiale: '', adresse: '', telephone: '',
    indice_base: '', salaire_base: '', observations: '',
  });
  const [paiement, setPaiement] = useState({
    mode: 'VIREMENT', banque: '', compte_bancaire: '', motif: '',
    pieces_verifiees: false,
  });

  const charger = useCallback(async () => {
    try {
      setChargement(true);
      setErreur(null);
      const [donnees, vol] = await Promise.all([
        immatriculationService.list({
          search: recherche || undefined,
          statut: filtreStatut || undefined,
        }),
        immatriculationService.volumes().catch(() => null),
      ]);
      setListe(donnees || []);
      setVolumes(vol);
    } catch (e) {
      setErreur(e);
    } finally {
      setChargement(false);
    }
  }, [recherche, filtreStatut]);

  useEffect(() => { Promise.resolve().then(charger); }, [charger]);

  useEffect(() => {
    divisionService.list()
      .then((d) => setDivisions(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  const ouvrirDetail = async (id) => {
    try {
      setDetail(await immatriculationService.get(id));
    } catch (e) {
      toastError(e.message);
    }
  };

  const creerImmatriculation = async () => {
    setEnCours(true);
    try {
      const resultat = await immatriculationService.create({
        ...nouvelle,
        indice: nouvelle.indice === '' ? null : Number(nouvelle.indice),
        division_id: nouvelle.division_id === '' ? null : Number(nouvelle.division_id),
      });
      toastSuccess(`Immatriculation enregistrée — référence ${resultat.reference}.`);
      setModaleNouvelle(false);
      setNouvelle({
        nom: '', prenom: '', cin: '', date_naissance: '', corps: '',
        grade: '', indice: '', date_entree: '', division_id: '', observations: '',
      });
      await charger();
    } catch (e) {
      toastError(e.message);
    } finally {
      setEnCours(false);
    }
  };

  const enregistrerInsertion = async () => {
    if (!detail) return;
    setEnCours(true);
    try {
      await immatriculationService.createInsertion(detail.id, {
        ...insertion,
        immatriculation_id: detail.id,
        indice_base: insertion.indice_base === '' ? null : Number(insertion.indice_base),
        salaire_base: insertion.salaire_base === '' ? null : Number(insertion.salaire_base),
      });
      toastSuccess('Insertion en paie enregistrée.');
      setModaleInsertion(false);
      await ouvrirDetail(detail.id);
      await charger();
    } catch (e) {
      toastError(e.message);
    } finally {
      setEnCours(false);
    }
  };

  const enregistrerPaiement = async () => {
    if (!detail) return;
    setEnCours(true);
    try {
      await immatriculationService.createChangement(detail.id, {
        ...paiement,
        immatriculation_id: detail.id,
      });
      toastSuccess('Demande de changement de mode de paiement enregistrée.');
      setModalePaiement(false);
      setPaiement({
        mode: 'VIREMENT', banque: '', compte_bancaire: '', motif: '',
        pieces_verifiees: false,
      });
      await ouvrirDetail(detail.id);
      await charger();
    } catch (e) {
      toastError(e.message);
    } finally {
      setEnCours(false);
    }
  };

  return (
    <AnimatedCard
      title="Immatriculations"
      subtitle="Nouveaux agents publics, insertion en paie et changements de mode de paiement."
      delay={0}
    >
      <div className="space-y-5">
        {/* Les volumes : l'activité de la coordination en un coup d'œil. */}
        {volumes && (
          <div className="grid gap-3 sm:grid-cols-3">
            {(volumes.par_type || []).map((v) => (
              <div key={v.type} className="rounded-lg border border-slate-200 bg-white px-4 py-3">
                <p className="text-xs font-medium text-slate-500">{v.type}</p>
                <p className="mt-1 text-2xl font-bold text-slate-800">{v.total}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[16rem] flex-1">
            <TextInput
              label="Recherche"
              value={recherche}
              onChange={setRecherche}
              placeholder="Nom, prénom, CIN ou référence"
              clearable
            />
          </div>
          <div className="w-full sm:w-56">
            <Select
              label="État"
              value={filtreStatut}
              onChange={(e) => setFiltreStatut(e.target.value)}
              placeholder="Tous les états"
            >
              {Object.entries(STATUTS_IMMA).map(([code, s]) => (
                <option key={code} value={code}>{s.label}</option>
              ))}
            </Select>
          </div>
          <Button variant="ghost" size="sm" onClick={charger} title="Actualiser">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={() => setModaleNouvelle(true)}>
            <UserPlus className="h-4 w-4" /> Nouvelle immatriculation
          </Button>
        </div>

        {erreur && (
          <Alert type="warning" title="Immatriculations indisponibles">
            {erreur.message}
          </Alert>
        )}

        <Card title="Demandes d'immatriculation">
          {chargement ? (
            <Spinner className="py-6" />
          ) : liste.length === 0 ? (
            <p className="rounded-md bg-slate-50 px-3 py-4 text-sm text-slate-500">
              Aucune immatriculation.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {liste.map((i) => {
                const etat = STATUTS_IMMA[i.statut] || STATUTS_IMMA.EN_ATTENTE;
                return (
                  <li key={i.id} className="flex flex-wrap items-center gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-800">
                        {i.nom} {i.prenom}
                      </p>
                      <p className="text-xs text-slate-500">
                        {[i.matricule, i.cin, i.corps, i.division_nom]
                          .filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    {i.insertion_statut && (
                      <Badge className={(STATUTS_INSERTION[i.insertion_statut] || {}).classe}>
                        Paie : {(STATUTS_INSERTION[i.insertion_statut] || {}).label || i.insertion_statut}
                      </Badge>
                    )}
                    <Badge className={etat.classe}>{etat.label}</Badge>
                    <Button size="sm" variant="outline" onClick={() => ouvrirDetail(i.id)}>
                      Ouvrir
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        {/* La fiche d'une immatriculation : ses trois volets. */}
        {detail && (
          <Card
            title={`${detail.nom} ${detail.prenom}`}
            subtitle={detail.matricule ? `Référence ${detail.matricule}` : undefined}
            actions={
              <Button variant="ghost" size="sm" onClick={() => setDetail(null)}>
                Fermer
              </Button>
            }
          >
            <div className="space-y-5">
              <dl className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <dt className="text-xs font-medium text-slate-500">CIN</dt>
                  <dd className="text-sm text-slate-700">{detail.cin || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500">Date de naissance</dt>
                  <dd className="text-sm text-slate-700">
                    {detail.date_naissance ? formatDateString(detail.date_naissance) : '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500">Date d’entrée</dt>
                  <dd className="text-sm text-slate-700">
                    {detail.date_entree ? formatDateString(detail.date_entree) : '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500">Corps</dt>
                  <dd className="text-sm text-slate-700">{detail.corps || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500">Grade</dt>
                  <dd className="text-sm text-slate-700">{detail.grade || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500">Indice</dt>
                  <dd className="text-sm text-slate-700">{detail.indice ?? '—'}</dd>
                </div>
              </dl>

              {/* Insertion en paie. */}
              <div className="rounded-lg border border-slate-200 p-3">
                <p className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Landmark className="h-4 w-4 text-slate-400" />
                  Insertion dans les systèmes de paie et de pension
                </p>
                {detail.insertion ? (
                  <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                    <Badge className={(STATUTS_INSERTION[detail.insertion.statut] || {}).classe}>
                      {(STATUTS_INSERTION[detail.insertion.statut] || {}).label || detail.insertion.statut}
                    </Badge>
                    <span>
                      Matricule {detail.insertion.matricule_augure || '—'}
                      {detail.insertion.salaire_base
                        && ` — salaire de base ${Number(detail.insertion.salaire_base).toLocaleString('fr-FR')} Ar`}
                    </span>
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">
                    L’insertion n’est pas encore préparée.
                  </p>
                )}
                <Button
                  size="sm"
                  variant="secondary"
                  className="mt-3"
                  onClick={() => {
                    setInsertion({
                      matricule_augure: '', situation_familiale: '',
                      adresse: '', telephone: '', indice_base: '',
                      salaire_base: '', observations: '',
                    });
                    setModaleInsertion(true);
                  }}
                >
                  <Landmark className="h-3.5 w-3.5" />
                  {detail.insertion ? 'Mettre à jour l’insertion' : 'Préparer l’insertion'}
                </Button>
              </div>

              {/* Changements de mode de paiement. */}
              <div className="rounded-lg border border-slate-200 p-3">
                <p className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Wallet className="h-4 w-4 text-slate-400" />
                  Changements de mode de paiement
                </p>
                {(detail.paiements || []).length === 0 ? (
                  <p className="mt-2 text-sm text-slate-500">
                    Aucune demande enregistrée.
                  </p>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {detail.paiements.map((p) => (
                      <li key={p.id} className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-600">
                        <span className="font-medium text-slate-800">
                          {MODES_PAIEMENT.find((m) => m.code === p.mode)?.label || p.mode}
                        </span>
                        <span className="ml-2">{p.motif}</span>
                        {p.pieces_verifiees ? (
                          <span className="ml-2 inline-flex items-center gap-1 text-xs text-emerald-700">
                            <CheckCircle2 className="h-3 w-3" /> pièces vérifiées
                          </span>
                        ) : (
                          <span className="ml-2 inline-flex items-center gap-1 text-xs text-amber-700">
                            <AlertTriangle className="h-3 w-3" /> pièces non vérifiées
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
                <Button
                  size="sm"
                  variant="secondary"
                  className="mt-3"
                  onClick={() => {
                    setPaiement({
                      mode: 'VIREMENT', banque: '', compte_bancaire: '',
                      motif: '', pieces_verifiees: false,
                    });
                    setModalePaiement(true);
                  }}
                >
                  <Wallet className="h-3.5 w-3.5" /> Demander un changement
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Nouvelle immatriculation. */}
      <Modal
        open={modaleNouvelle}
        onClose={() => !enCours && setModaleNouvelle(false)}
        title="Nouvelle demande d’immatriculation"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModaleNouvelle(false)} disabled={enCours}>
              Annuler
            </Button>
            <Button onClick={creerImmatriculation} loading={enCours} disabled={!nouvelle.nom || !nouvelle.prenom}>
              Enregistrer
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-slate-500">
            La référence est attribuée automatiquement. Le CIN et le matricule
            ne peuvent pas être partagés : un doublon est refusé à
            l’enregistrement, pas découvert plus tard à la paie.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <TextInput
              label="Nom"
              required
              value={nouvelle.nom}
              onChange={(v) => setNouvelle((n) => ({ ...n, nom: v }))}
              maxLength={100}
            />
            <TextInput
              label="Prénom"
              required
              value={nouvelle.prenom}
              onChange={(v) => setNouvelle((n) => ({ ...n, prenom: v }))}
              maxLength={100}
            />
            <TextInput
              label="CIN"
              value={nouvelle.cin}
              onChange={(v) => setNouvelle((n) => ({ ...n, cin: v }))}
              maxLength={50}
              hint="5 à 20 caractères alphanumériques"
            />
            <DateInput
              label="Date de naissance"
              value={nouvelle.date_naissance}
              onChange={(v) => setNouvelle((n) => ({ ...n, date_naissance: v }))}
            />
            <TextInput
              label="Corps"
              value={nouvelle.corps}
              onChange={(v) => setNouvelle((n) => ({ ...n, corps: v }))}
              maxLength={100}
            />
            <TextInput
              label="Grade"
              value={nouvelle.grade}
              onChange={(v) => setNouvelle((n) => ({ ...n, grade: v }))}
              maxLength={100}
            />
            <TextInput
              label="Indice"
              type="number"
              value={nouvelle.indice}
              onChange={(v) => setNouvelle((n) => ({ ...n, indice: v }))}
            />
            <DateInput
              label="Date d’entrée"
              value={nouvelle.date_entree}
              onChange={(v) => setNouvelle((n) => ({ ...n, date_entree: v }))}
            />
          </div>
          <Select
            label="Division"
            value={nouvelle.division_id}
            onChange={(e) => setNouvelle((n) => ({ ...n, division_id: e.target.value }))}
            placeholder="— Choisir —"
          >
            {divisions.map((d) => (
              <option key={d.id} value={d.id}>{d.nom}</option>
            ))}
          </Select>
          <TextAreaInput
            label="Observations"
            rows={2}
            value={nouvelle.observations}
            onChange={(v) => setNouvelle((n) => ({ ...n, observations: v }))}
            maxLength={2000}
          />
        </div>
      </Modal>

      {/* Insertion en paie. */}
      <Modal
        open={modaleInsertion}
        onClose={() => !enCours && setModaleInsertion(false)}
        title="Insertion dans les systèmes de paie"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModaleInsertion(false)} disabled={enCours}>
              Annuler
            </Button>
            <Button onClick={enregistrerInsertion} loading={enCours}>
              Enregistrer
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <TextInput
              label="Matricule du système de paie"
              value={insertion.matricule_augure}
              onChange={(v) => setInsertion((i) => ({ ...i, matricule_augure: v }))}
              maxLength={50}
            />
            <TextInput
              label="Situation familiale"
              value={insertion.situation_familiale}
              onChange={(v) => setInsertion((i) => ({ ...i, situation_familiale: v }))}
              maxLength={100}
            />
            <TextInput
              label="Adresse"
              value={insertion.adresse}
              onChange={(v) => setInsertion((i) => ({ ...i, adresse: v }))}
              maxLength={255}
            />
            <TextInput
              label="Téléphone"
              value={insertion.telephone}
              onChange={(v) => setInsertion((i) => ({ ...i, telephone: v }))}
              maxLength={30}
            />
            <TextInput
              label="Indice de base"
              type="number"
              value={insertion.indice_base}
              onChange={(v) => setInsertion((i) => ({ ...i, indice_base: v }))}
            />
            <TextInput
              label="Salaire de base (Ar)"
              type="number"
              step="0.01"
              value={insertion.salaire_base}
              onChange={(v) => setInsertion((i) => ({ ...i, salaire_base: v }))}
            />
          </div>
          <TextAreaInput
            label="Observations"
            rows={2}
            value={insertion.observations}
            onChange={(v) => setInsertion((i) => ({ ...i, observations: v }))}
            maxLength={2000}
          />
        </div>
      </Modal>

      {/* Changement de mode de paiement. */}
      <Modal
        open={modalePaiement}
        onClose={() => !enCours && setModalePaiement(false)}
        title="Demande de changement de mode de paiement"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalePaiement(false)} disabled={enCours}>
              Annuler
            </Button>
            <Button onClick={enregistrerPaiement} loading={enCours} disabled={!paiement.motif.trim()}>
              Enregistrer la demande
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="flex items-start gap-1.5 text-sm text-slate-500">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
            <span>
              Une décision sans motif ne s’explique ni ne s audite : le motif
              est obligatoire. Un virement exige aussi un numéro de compte.
            </span>
          </p>
          <Select
            label="Mode de paiement"
            required
            value={paiement.mode}
            onChange={(e) => setPaiement((p) => ({ ...p, mode: e.target.value }))}
          >
            {MODES_PAIEMENT.map((m) => (
              <option key={m.code} value={m.code}>{m.label}</option>
            ))}
          </Select>
          <div className="grid gap-3 sm:grid-cols-2">
            <TextInput
              label="Banque"
              value={paiement.banque}
              onChange={(v) => setPaiement((p) => ({ ...p, banque: v }))}
              maxLength={100}
            />
            <TextInput
              label="Numéro de compte"
              value={paiement.compte_bancaire}
              onChange={(v) => setPaiement((p) => ({ ...p, compte_bancaire: v }))}
              maxLength={50}
              hint="Obligatoire pour un virement."
            />
          </div>
          <TextAreaInput
            label="Motif"
            required
            rows={3}
            value={paiement.motif}
            onChange={(v) => setPaiement((p) => ({ ...p, motif: v }))}
            maxLength={1000}
            placeholder="Ce qui justifie la demande."
          />
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={paiement.pieces_verifiees}
              onChange={(e) => setPaiement((p) => ({ ...p, pieces_verifiees: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-primary-600"
            />
            Pièces justificatives vérifiées
          </label>
        </div>
      </Modal>
    </AnimatedCard>
  );
}

export default ImmatriculationsPage;
