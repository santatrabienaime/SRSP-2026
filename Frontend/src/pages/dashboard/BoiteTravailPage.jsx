import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Inbox, ShieldCheck, AlertTriangle, CheckCircle2, Layers, ArrowRight, RefreshCw,
} from 'lucide-react';
import { dashboardService } from '../../services/dashboardService.js';
import { useTempsReel } from '../../hooks/useTempsReel.js';
import { Card } from '../../components/ui/Card.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Select } from '../../components/ui/Select.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { formatStatus, statusBadgeClass } from '../../utils/formatStatus.js';
import { STATUT_LABELS } from '../../config/constants.js';
import { TRIS_BOITE } from '../../config/triage.js';
import { STATUTS } from '../../config/constants.js';

/**
 * Boîte de travail : l'écran qui répond à la question « qu'est-ce qui m'attend,
 * et qu'est-ce qui attend quelqu'un ? ».
 *
 * Le cahier des charges demande cinq informations : à traiter par moi, en
 * attente de validation, incomplets, clôturés récemment, et le total par
 * catégorie et par statut. Le serveur les calcule déjà, restreints au
 * périmètre de l'utilisateur ; l'écran ne fait que les présenter.
 *
 * L'ordre des files est celui de l'urgence, pas celui du code : ce qui dépend
 * de moi d'abord, ce qui bloque quelqu'un ensuite.
 */

/** Couleurs des compteurs, écrites en clair (Tailwind les analyse statiquement). */
const CARTES = [
  { cle: 'a_traiter_par_moi', label: 'À traiter par moi', Icon: Inbox, tone: 'amber', vide: 'Aucun dossier en attente de votre action.' },
  { cle: 'en_attente_validation', label: 'En attente de validation', Icon: ShieldCheck, tone: 'violet', vide: 'Aucun dossier en attente de validation.' },
  { cle: 'incomplets', label: 'Incomplets', Icon: AlertTriangle, tone: 'red', vide: 'Aucun dossier incomplet.' },
  { cle: 'clotures_recents', label: 'Clôturés récemment', Icon: CheckCircle2, tone: 'emerald', vide: 'Aucun dossier clôturé ces 30 derniers jours.' },
];

const TONS = {
  amber: 'text-amber-600',
  violet: 'text-violet-600',
  red: 'text-red-600',
  emerald: 'text-emerald-600',
};

/** Ancienneté d'un dossier, exprimée en jours. */
function anciennete(dossier) {
  const j = dossier.age_jours;
  if (j === undefined || j === null) return '';
  return j === 0 ? 'reçu aujourd’hui' : `${j} j`;
}

/** Liste d'une file : les dossiers qui la composent, avec le motif d'entrée. */
function FileDossiers({ titre, dossiers, vide }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{titre}</p>
      {(dossiers || []).length === 0 ? (
        <p className="rounded-md bg-slate-50 px-3 py-4 text-sm text-slate-500">{vide}</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {(dossiers || []).map((d) => (
            <li key={d.id}>
              <Link
                to={`/dossiers/${d.id}`}
                className="flex items-center justify-between gap-3 py-2.5 hover:bg-slate-50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {d.reference_visa || d.numero} — {d.objet}
                  </p>
                  <p className="truncate text-xs text-slate-400">
                    {[d.demandeur, d.division_nom, anciennete(d)].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <Badge className={statusBadgeClass(d.statut_code)}>
                  {formatStatus(d.statut_code)}
                </Badge>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function BoiteTravailPage() {
  const { abonner } = useTempsReel();
  const [boite, setBoite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  /* Tri des files. C'est un ordre d'affichage, comme dans la liste des
     dossiers : il ne change ni le contenu des files, ni les droits. Il est
     calculé par le serveur, pour que les dossiers montrés soient ceux qu'on
     veut voir — et non ceux qui se trouvent en tête d'un autre ordre. */
  const [tri, setTri] = useState('prioritaire');

  const charger = useCallback(async (options = {}) => {
    /* Rechargement à chaud : la boîte reste affichée pendant la recharge,
       sans clignotement. */
    const silencieux = Boolean(options.silencieux);
    if (!silencieux) {
      setLoading(true);
      setError(null);
    }
    try {
      const data = await dashboardService.boiteTravail(tri);
      setBoite(data || {});
    } catch (e) {
      if (!silencieux) setError(e);
    } finally {
      if (!silencieux) setLoading(false);
    }
  }, [tri]);

  useEffect(() => { Promise.resolve().then(charger); }, [charger]);

  /* Temps réel : la boîte de travail est l'écran qui dit « qu'est-ce qui
     m'attend ». Elle doit refléter l'instant, pas la dernière visite : un
     dossier soumis à vérification doit y apparaître sans rechargement. */
  useEffect(() => {
    return abonner('dossier', () => {
      Promise.resolve().then(() => charger({ silencieux: true }));
    });
  }, [abonner, charger]);

  if (loading) return <Spinner label="Chargement de votre boîte de travail…" />;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Boîte de travail</h1>
          <p className="text-sm text-slate-500">
            {boite?.perimetre?.libelle
              ? `Périmètre : ${boite.perimetre.libelle}.`
              : 'Ce qui attend une action, et ce qui en attend une autre.'}
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <div className="w-full sm:w-56">
            <Select label="Trier par" value={tri} onChange={(e) => setTri(e.target.value)}>
              {TRIS_BOITE.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          </div>
          <Button variant="secondary" size="sm" onClick={() => charger()}>
            <RefreshCw className="h-4 w-4" /> Actualiser
          </Button>
        </div>
      </div>

      {error && (
        <Alert type="error" title="Boîte de travail indisponible">
          {error.message}
        </Alert>
      )}

      {/* Les cinq compteurs : quatre files et le total. */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {CARTES.map((c) => {
          const file = boite?.[c.cle];
          return (
            <div key={c.cle} className="rounded-lg border border-slate-200 bg-white px-4 py-3">
              <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <c.Icon className="h-3.5 w-3.5" />
                {c.label}
              </p>
              <p className={`mt-1 text-2xl font-bold ${TONS[c.tone]}`}>
                {file?.total ?? 0}
              </p>
            </div>
          );
        })}
      </div>

      {/* Total par catégorie et par statut : la carte du service. */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Total par catégorie" subtitle="Nombre de dossiers par type de dossier">
          {(boite?.par_categorie || []).length === 0 ? (
            <p className="rounded-md bg-slate-50 px-3 py-4 text-sm text-slate-500">
              Aucune donnée.
            </p>
          ) : (
            <ul className="space-y-2">
              {boite.par_categorie.map((c) => (
                <li key={c.type_code} className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-slate-700">{c.type_libelle}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                    {c.total}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Total par statut" subtitle="Répartition des dossiers dans le workflow">
          {(boite?.par_statut || []).length === 0 ? (
            <p className="rounded-md bg-slate-50 px-3 py-4 text-sm text-slate-500">
              Aucune donnée.
            </p>
          ) : (
            <ul className="space-y-2">
              {boite.par_statut.map((s) => (
                <li key={s.statut_code || s.code} className="flex items-center justify-between gap-3 text-sm">
                  <Badge className={statusBadgeClass(s.statut_code || s.code)}>
                    {STATUT_LABELS[s.statut_code || s.code] || s.statut || s.libelle || s.code}
                  </Badge>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                    {s.total ?? s.nb ?? 0}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Triage par statut : vue rapide pour tous les profils. Chaque statut
          est cliquable et mène à la liste des dossiers filtrée par ce statut. */}
      <Card title="Triage par statut" subtitle="Cliquez sur un statut pour voir les dossiers correspondants.">
        {(boite?.par_statut || []).length === 0 ? (
          <p className="rounded-md bg-slate-50 px-3 py-4 text-sm text-slate-500">
            Aucun dossier.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {boite.par_statut.map((s) => {
              const code = s.statut_code || s.code;
              const total = s.total ?? s.nb ?? 0;
              return (
                <Link
                  key={code}
                  to={`/dossiers?statut=${code}`}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                >
                  <Badge className={statusBadgeClass(code)}>
                    {STATUT_LABELS[code] || s.statut || s.libelle || code}
                  </Badge>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                    {total}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </Card>

      {/* Les quatre files, détaillées. */}
      <div className="grid gap-5 lg:grid-cols-2">
        {CARTES.map((c) => (
          <Card
            key={c.cle}
            title={c.label}
            subtitle={`${boite?.[c.cle]?.total ?? 0} dossier(s)`}
          >
            <FileDossiers
              titre=""
              dossiers={boite?.[c.cle]?.dossiers}
              vide={c.vide}
            />
          </Card>
        ))}
      </div>

      {!boite || Object.keys(boite).length === 0 ? (
        <EmptyState
          title="Boîte de travail vide"
          message="Aucun dossier ne vous est actuellement attribué."
          action={
            <Link to="/dossiers">
              <Button variant="secondary">
                <Layers className="h-4 w-4" /> Ouvrir la liste des dossiers
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="text-right">
          <Link to="/dossiers" className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:underline">
            Ouvrir la liste complète des dossiers <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}

export default BoiteTravailPage;
