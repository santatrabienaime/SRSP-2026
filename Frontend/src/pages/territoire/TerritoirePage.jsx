import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  MapPinned, Building2, RefreshCw, Search, Link2, AlertTriangle,
} from 'lucide-react';
import { geographieService } from '../../services/geographieService.js';
import { divisionService } from '../../services/divisionService.js';
import { dossierService } from '../../services/dossierService.js';
import { useNotification } from '../../hooks/useNotification.js';
import { useAuth } from '../../hooks/useAuth.js';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { AnimatedCard } from '../../components/ui/AnimatedCard.jsx';
import { Table } from '../../components/ui/Table.jsx';
import { Select } from '../../components/ui/Select.jsx';
import { TextInput } from '../../components/fields/index.jsx';
import { formatDateString } from '../../utils/formatDate.js';

/**
 * Écran « Territoire » — le périmètre géographique du SRSP Fitovinany.
 *
 * Six districts, deux antennes, un siège : la carte administrative du
 * service. Elle existait dans l'organigramme officiel et nulle part dans la
 * plateforme — un dossier ne disait pas de quel district venait le
 * demandeur. Cet écran expose enfin ce que le module sait déjà.
 *
 * Trois volets :
 *  1. la synthèse par antenne, filtrable par division ;
 *  2. le référentiel territorial : les antennes et leurs districts ;
 *  3. le rattachement d'un dossier à un district, avec l'historique des
 *     rattachements successifs.
 *
 * Le rattachement est un acte d'administration : il engage la compétence
 * territoriale de l'antenne. Le serveur en contrôle l'accès (403) ; l'écran
 * ne le propose qu'aux profils habilités, et ne laisse jamais croire qu'un
 * rattachement a réussi quand il a échoué.
 */

/** Origines possibles d'un rattachement, telles que le serveur les enregistre. */
const ORIGINES = {
  SAISIE: 'Saisie',
  DEDUIT: 'Déduit',
  CORRECTION: 'Correction',
};

/** Permissions qui autorisent l'acte de rattachement (cf. rbac côté serveur). */
const PERMS_RATTACHEMENT = ['create_dossier', 'orienter_dossier', 'edit_dossier'];

/** Arrondi d'un pourcentage à une décimale, sans "-0". */
function pourcentage(part, total) {
  if (!total) return 0;
  const valeur = Math.round((part / total) * 1000) / 10;
  return Object.is(valeur, -0) ? 0 : valeur;
}

export function TerritoirePage() {
  const { toastSuccess, toastError } = useNotification();
  const { hasAnyPermission } = useAuth();

  /* ── Référentiel et synthèse ────────────────────────────────────── */
  const [referentiel, setReferentiel] = useState(null);
  const [divisions, setDivisions] = useState([]);
  const [synthese, setSynthese] = useState(null);
  const [divisionId, setDivisionId] = useState('');
  const [chargement, setChargement] = useState(true);
  const [chargementSynthese, setChargementSynthese] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [erreurSynthese, setErreurSynthese] = useState(null);

  /* ── Rattachement d'un dossier ──────────────────────────────────── */
  const [numeroDossier, setNumeroDossier] = useState('');
  const [dossiersTrouves, setDossiersTrouves] = useState([]);
  const [dossierChoisi, setDossierChoisi] = useState(null);
  const [districtChoisi, setDistrictChoisi] = useState('');
  const [rechercheEnCours, setRechercheEnCours] = useState(false);
  const [rattachementEnCours, setRattachementEnCours] = useState(false);
  const [districtCourant, setDistrictCourant] = useState(null);
  const [historique, setHistorique] = useState([]);
  const [erreurRattachement, setErreurRattachement] = useState(null);

  const peutRattacher = hasAnyPermission(PERMS_RATTACHEMENT);

  const chargerReferentiel = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      const [ref, divs] = await Promise.all([
        geographieService.referentiel(),
        divisionService.list(),
      ]);
      setReferentiel(ref || {});
      setDivisions(Array.isArray(divs) ? divs : []);
    } catch (e) {
      setErreur(e.message || 'Le référentiel territorial est indisponible.');
    } finally {
      setChargement(false);
    }
  }, []);

  const chargerSynthese = useCallback(async (division) => {
    setChargementSynthese(true);
    setErreurSynthese(null);
    try {
      const s = await geographieService.synthese(
        division ? { division_id: division } : undefined,
      );
      setSynthese(s || null);
    } catch (e) {
      setErreurSynthese(e.message || 'La synthèse par antenne est indisponible.');
    } finally {
      setChargementSynthese(false);
    }
  }, []);

  useEffect(() => { Promise.resolve().then(chargerReferentiel); }, [chargerReferentiel]);

  useEffect(() => {
    Promise.resolve().then(() => chargerSynthese(divisionId));
  }, [divisionId, chargerSynthese]);

  const antennes = useMemo(
    () => (Array.isArray(referentiel?.antennes) ? referentiel.antennes : []),
    [referentiel],
  );
  const districts = useMemo(
    () => (Array.isArray(referentiel?.districts) ? referentiel.districts : []),
    [referentiel],
  );

  /* Les districts sont regroupés par antenne : c'est ainsi que le
    référentiel se lit — l'antenne d'abord, ses districts ensuite. */
  const districtsParAntenne = useMemo(() => {
    const parAntenne = new Map();
    antennes.forEach((a) => parAntenne.set(a.id, []));
    districts.forEach((d) => {
      if (!parAntenne.has(d.antenne_id)) parAntenne.set(d.antenne_id, []);
      parAntenne.get(d.antenne_id).push(d);
    });
    return parAntenne;
  }, [antennes, districts]);

  const lignesSynthese = useMemo(() => {
    const liste = Array.isArray(synthese?.antennes) ? synthese.antennes : [];
    /* La part se calcule sur les dossiers RATTACHÉS à une antenne : c'est la
       seule base qui s'additionne à 100 %. Les dossiers sans district sont
       comptés à part — les perdre dans la somme ferait croire que le
       service en a moins qu'il n'en a. */
    const rattaches = Number(synthese?.dossiers_rattaches || 0);
    return liste.map((a) => ({
      id: a.antenne_id,
      antenne: a.antenne_libelle || a.antenne_code || `Antenne ${a.antenne_id}`,
      code: a.antenne_code || '—',
      total: Number(a.total || 0),
      en_cours: Number(a.en_cours || 0),
      en_retard: Number(a.en_retard || 0),
      part: pourcentage(Number(a.total || 0), rattaches),
    }));
  }, [synthese]);

  const totaux = useMemo(() => ({
    total: Number(synthese?.total || 0),
    rattaches: Number(synthese?.dossiers_rattaches || 0),
    sansDistrict: Number(synthese?.dossiers_sans_district || 0),
  }), [synthese]);

  const nomDivision = useMemo(() => {
    const d = divisions.find((x) => String(x.id) === String(divisionId));
    return d ? d.nom : '';
  }, [divisions, divisionId]);

  /* ── Rattachement ────────────────────────────────────────────────── */

  /* Le district courant et l'historique sont deux questions différentes :
     « quel district maintenant » et « par quel district est-il passé ». */
  const chargerRattachement = useCallback(async (dossierId) => {
    setDistrictCourant(null);
    setHistorique([]);
    try {
      const [courant, histo] = await Promise.all([
        geographieService.districtCourant(dossierId),
        geographieService.historique(dossierId),
      ]);
      setDistrictCourant(courant || null);
      setHistorique(Array.isArray(histo) ? histo : []);
    } catch (e) {
      setErreurRattachement(e.message || 'Le rattachement de ce dossier est inaccessible.');
    }
  }, []);

  const rechercherDossier = useCallback(async () => {
    const saisie = numeroDossier.trim();
    if (!saisie) {
      setErreurRattachement('Saisissez le numéro du dossier à rattacher.');
      return;
    }
    setRechercheEnCours(true);
    setErreurRattachement(null);
    setDossiersTrouves([]);
    setDossierChoisi(null);
    setDistrictCourant(null);
    setHistorique([]);
    try {
      const resultats = await dossierService.list({ search: saisie, tri: 'numero' });
      const liste = Array.isArray(resultats) ? resultats : [];
      /* Le numéro saisi est prioritaire : une correspondance exacte ne laisse
         pas le choix à l'agent. Sinon, les dossiers approchants sont
         proposés — le numéro saisi peut être une référence de visa. */
      const exacts = liste.filter(
        (d) => String(d.numero || '').trim().toUpperCase() === saisie.toUpperCase(),
      );
      const retenus = exacts.length > 0 ? exacts : liste;
      setDossiersTrouves(retenus);
      if (retenus.length === 0) {
        setErreurRattachement('Aucun dossier ne porte ce numéro dans votre périmètre.');
      } else if (retenus.length === 1) {
        setDossierChoisi(retenus[0]);
        await chargerRattachement(retenus[0].id);
      }
    } catch (e) {
      setErreurRattachement(e.message || 'Aucun dossier ne correspond à ce numéro.');
    } finally {
      setRechercheEnCours(false);
    }
  }, [numeroDossier, chargerRattachement]);

  const choisirDossier = useCallback(async (dossier) => {
    setDossierChoisi(dossier);
    setDossiersTrouves([]);
    setErreurRattachement(null);
    await chargerRattachement(dossier.id);
  }, [chargerRattachement]);

  const rattacher = useCallback(async () => {
    if (!dossierChoisi || !districtChoisi) return;
    setRattachementEnCours(true);
    setErreurRattachement(null);
    try {
      const resultat = await geographieService.rattacher(dossierChoisi.id, {
        district_id: Number(districtChoisi),
      });
      toastSuccess(
        `Dossier ${dossierChoisi.numero} rattaché au district ${resultat?.district || 'choisi'}.`,
      );
      setDistrictChoisi('');
      await Promise.all([
        chargerRattachement(dossierChoisi.id),
        chargerSynthese(divisionId),
      ]);
    } catch (e) {
      const message = e.message || 'Le rattachement a échoué.';
      setErreurRattachement(message);
      toastError(message);
    } finally {
      setRattachementEnCours(false);
    }
  }, [dossierChoisi, districtChoisi, divisionId, chargerRattachement, chargerSynthese, toastSuccess, toastError]);

  /* ── Colonnes des tableaux ───────────────────────────────────────── */

  const colonnesSynthese = useMemo(() => [
    {
      key: 'antenne',
      label: 'Antenne',
      render: (row) => (
        <div>
          <p className="font-medium text-slate-800">{row.antenne}</p>
          <Badge className="mt-1 border-slate-200 bg-slate-50 text-slate-600">{row.code}</Badge>
        </div>
      ),
    },
    {
      key: 'total',
      label: 'Dossiers',
      render: (row) => <span className="font-semibold text-slate-800">{row.total}</span>,
    },
    { key: 'en_cours', label: 'En cours' },
    {
      key: 'en_retard',
      label: 'En retard',
      render: (row) => (row.en_retard > 0
        ? <span className="font-medium text-red-600">{row.en_retard}</span>
        : <span className="text-slate-400">0</span>),
    },
    {
      key: 'part',
      label: 'Part',
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="w-14 text-right text-sm text-slate-700">{row.part} %</span>
          <span
            className="h-2 w-24 overflow-hidden rounded-full bg-slate-100"
            aria-hidden="true"
          >
            <span
              className="block h-full rounded-full bg-primary-500"
              style={{ width: `${Math.min(100, row.part)}%` }}
            />
          </span>
        </div>
      ),
    },
  ], []);

  const colonnesHistorique = useMemo(() => [
    {
      key: 'district_libelle',
      label: 'District',
      render: (row) => (
        <div>
          <p className="font-medium text-slate-700">{row.district_libelle || '—'}</p>
          <p className="text-xs text-slate-500">{row.district_code || ''}</p>
        </div>
      ),
    },
    { key: 'antenne_libelle', label: 'Antenne' },
    {
      key: 'date_rattachement',
      label: 'Date de rattachement',
      render: (row) => formatDateString(row.date_rattachement),
    },
    {
      key: 'origine',
      label: 'Origine',
      render: (row) => ORIGINES[row.origine] || row.origine || '—',
    },
    {
      key: 'courante',
      label: 'État',
      render: (row) => (Number(row.courante) === 1
        ? <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">Courante</Badge>
        : <Badge className="border-slate-200 bg-slate-100 text-slate-500">Ancienne</Badge>),
    },
  ], []);

  return (
    <AnimatedCard
      title="Territoire"
      subtitle="Antennes, districts et rattachement des dossiers du SRSP Fitovinany."
      Icon={MapPinned}
      delay={0}
    >
      <div className="space-y-5">
        {erreur && (
          <Alert type="error" title="Référentiel territorial indisponible">
            {erreur}
          </Alert>
        )}

        {/* Filtre de périmètre : la synthèse se lit division par division. */}
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-full sm:w-72">
            <Select
              id="territoire-division"
              label="Division"
              value={divisionId}
              onChange={(e) => setDivisionId(e.target.value)}
              placeholder="Toutes les divisions"
              hint="Filtre la synthèse par antenne."
            >
              {divisions.map((d) => (
                <option key={d.id} value={d.id}>{d.nom}</option>
              ))}
            </Select>
          </div>
          <Button variant="outline" onClick={chargerReferentiel} loading={chargement}>
            <RefreshCw className="h-4 w-4" /> Actualiser
          </Button>
        </div>

        {/* ── Synthèse par antenne ─────────────────────────────────── */}
        <Card
          title="Synthèse par antenne"
          subtitle={nomDivision
            ? `Dossiers rattachés — ${nomDivision}`
            : 'Dossiers rattachés — toutes divisions'}
        >
          {erreurSynthese && (
            <div className="mb-4">
              <Alert type="error" title="Synthèse indisponible">
                {erreurSynthese}
              </Alert>
            </div>
          )}

          {chargementSynthese ? (
            <Spinner label="Chargement de la synthèse…" />
          ) : (
            <>
              <div className="mb-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
                  <p className="text-xs font-medium text-slate-500">Dossiers ouverts</p>
                  <p className="mt-1 text-2xl font-bold text-slate-800">{totaux.total}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
                  <p className="text-xs font-medium text-slate-500">Rattachés à une antenne</p>
                  <p className="mt-1 text-2xl font-bold text-slate-800">{totaux.rattaches}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
                  <p className="text-xs font-medium text-slate-500">Sans district</p>
                  <p className="mt-1 text-2xl font-bold text-amber-600">{totaux.sansDistrict}</p>
                </div>
              </div>

              {lignesSynthese.length === 0 ? (
                <p className="rounded-md bg-slate-50 px-3 py-4 text-sm text-slate-500">
                  Aucune antenne ne porte de dossier rattaché pour ce périmètre.
                </p>
              ) : (
                <Table
                  columns={colonnesSynthese}
                  data={lignesSynthese}
                  emptyLabel="Aucun dossier rattaché à une antenne."
                />
              )}
            </>
          )}
        </Card>

        {/* ── Référentiel territorial ─────────────────────────────── */}
        <Card
          title="Référentiel territorial"
          subtitle="Antennes du service et districts qui leur sont rattachés"
        >
          {chargement ? (
            <Spinner label="Chargement du référentiel…" />
          ) : antennes.length === 0 ? (
            <p className="rounded-md bg-slate-50 px-3 py-4 text-sm text-slate-500">
              Aucune antenne enregistrée.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {antennes.map((a) => {
                const liste = districtsParAntenne.get(a.id) || [];
                return (
                  <li key={a.id} className="py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Building2 className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                      <span className="font-medium text-slate-800">{a.libelle}</span>
                      <Badge className="border-slate-200 bg-slate-50 text-slate-600">{a.code}</Badge>
                      {Number(a.siege) === 1 && (
                        <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                          Siège
                        </Badge>
                      )}
                      <span className="ml-auto text-xs text-slate-500">
                        {liste.length} district{liste.length > 1 ? 's' : ''}
                      </span>
                    </div>
                    {liste.length === 0 ? (
                      <p className="mt-2 pl-6 text-sm text-slate-500">
                        Aucun district rattaché à cette antenne.
                      </p>
                    ) : (
                      <ul className="mt-2 space-y-1 pl-6">
                        {liste.map((d) => (
                          <li
                            key={d.id}
                            className="flex flex-wrap items-center gap-2 text-sm text-slate-600"
                          >
                            <Badge className="border-slate-200 bg-slate-50 text-slate-600">
                              {d.code}
                            </Badge>
                            <span>{d.libelle}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        {/* ── Rattachement d'un dossier ────────────────────────────── */}
        <Card
          title="Rattacher un dossier à un district"
          subtitle="Le district désigne l'antenne compétente et le lieu de conservation des pièces"
        >
          <div className="space-y-4">
            {!peutRattacher && (
              <Alert type="info" title="Consultation seule">
                Le rattachement d'un dossier est un acte d'administration : il est
                réservé aux profils qui orientent ou modifient les dossiers. La
                consultation du territoire reste ouverte.
              </Alert>
            )}

            {erreurRattachement && (
              <Alert type="error" title="Rattachement impossible">
                {erreurRattachement}
              </Alert>
            )}

            <div className="grid gap-3 sm:grid-cols-3 lg:items-end">
              <div className="sm:col-span-2">
                <TextInput
                  id="territoire-numero-dossier"
                  label="Numéro de dossier"
                  value={numeroDossier}
                  onChange={setNumeroDossier}
                  placeholder="D-2026-000123"
                  hint="Numéro porté par le dossier, tel qu'il figure au registre."
                  aria-label="Numéro du dossier à rattacher"
                  clearable
                />
              </div>
              <Button
                variant="outline"
                onClick={rechercherDossier}
                loading={rechercheEnCours}
                className="sm:mb-1.5"
              >
                <Search className="h-4 w-4" /> Rechercher
              </Button>
            </div>

            {/* Plusieurs dossiers approchent : l'agent choisit, il ne devine pas. */}
            {dossiersTrouves.length > 0 && !dossierChoisi && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="text-sm font-medium text-amber-900">
                  {dossiersTrouves.length} dossier{dossiersTrouves.length > 1 ? 's' : ''}{' '}
                  correspond{dossiersTrouves.length > 1 ? 'ent' : ''} — choisissez le dossier :
                </p>
                <ul className="mt-2 space-y-1">
                  {dossiersTrouves.map((d) => (
                    <li key={d.id}>
                      <button
                        type="button"
                        onClick={() => choisirDossier(d)}
                        className="text-left text-sm text-amber-900 underline decoration-amber-400 underline-offset-2 hover:text-amber-950"
                      >
                        {d.numero} — {d.type_libelle || 'Dossier'} · {d.statut_libelle || 'statut inconnu'}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {dossierChoisi && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-sm text-slate-700">
                  <span className="font-semibold text-slate-800">{dossierChoisi.numero}</span>
                  {' — '}
                  {dossierChoisi.type_libelle || 'Dossier'}
                  {' · '}
                  {dossierChoisi.statut_libelle || 'statut inconnu'}
                  {dossierChoisi.demandeur ? ` · ${dossierChoisi.demandeur}` : ''}
                </p>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-3 lg:items-end">
              <div className="sm:col-span-2">
                <Select
                  id="territoire-district"
                  label="District"
                  value={districtChoisi}
                  onChange={(e) => setDistrictChoisi(e.target.value)}
                  placeholder={dossierChoisi ? 'Choisir un district' : 'Recherchez d’abord un dossier'}
                  disabled={!dossierChoisi || !peutRattacher}
                  required
                >
                  {antennes.map((a) => (
                    <optgroup key={a.id} label={a.libelle}>
                      {(districtsParAntenne.get(a.id) || []).map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.code} — {d.libelle}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </Select>
              </div>
              <Button
                onClick={rattacher}
                loading={rattachementEnCours}
                disabled={!dossierChoisi || !districtChoisi || !peutRattacher}
                className="sm:mb-1.5"
              >
                <Link2 className="h-4 w-4" /> Rattacher
              </Button>
            </div>
          </div>
        </Card>

        {/* ── District courant et historique du dossier retenu ─────── */}
        {dossierChoisi && (
          <Card
            title={`Rattachement du dossier ${dossierChoisi.numero}`}
            subtitle="District applicable et historique des rattachements successifs"
          >
            <div className="space-y-4">
              {districtCourant ? (
                <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <dt className="text-xs font-medium text-slate-500">District</dt>
                    <dd className="text-sm text-slate-700">
                      {districtCourant.district_libelle || '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-slate-500">Antenne</dt>
                    <dd className="text-sm text-slate-700">
                      {districtCourant.antenne_libelle || '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-slate-500">Date de rattachement</dt>
                    <dd className="text-sm text-slate-700">
                      {formatDateString(districtCourant.date_rattachement)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-slate-500">Origine</dt>
                    <dd className="text-sm text-slate-700">
                      {ORIGINES[districtCourant.origine] || districtCourant.origine || '—'}
                    </dd>
                  </div>
                </dl>
              ) : (
                <p className="flex items-center gap-2 rounded-md bg-amber-50 px-3 py-3 text-sm text-amber-800">
                  <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
                  Ce dossier n’est rattaché à aucun district.
                </p>
              )}

              <div>
                <h4 className="mb-2 text-sm font-semibold text-slate-700">
                  Historique de rattachement
                </h4>
                <Table
                  columns={colonnesHistorique}
                  data={historique}
                  emptyLabel="Aucun rattachement enregistré pour ce dossier."
                />
              </div>
            </div>
          </Card>
        )}
      </div>
    </AnimatedCard>
  );
}

export default TerritoirePage;
