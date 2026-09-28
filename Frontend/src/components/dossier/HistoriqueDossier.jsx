import { useState } from 'react';
import { User, FileText, FileSpreadsheet, FileDown } from 'lucide-react';
import { historiqueService } from '../../services/historiqueService.js';
import { Button } from '../ui/Button.jsx';
import { useNotification } from '../../hooks/useNotification.js';

/**
 * Journal des actions d'un dossier, au format du document de traçabilité :
 *
 *   [DATE] à [HEURE:MIN:SEC]
 *   Action : …
 *   Agent  : NOM Prénom
 *   Rôle   : …
 *   Détail : …
 *
 * La règle d'or est « aucune action sans agent, sans date, sans heure ». Un
 * événement réellement dépourvu d'auteur (un échec de connexion, où personne ne
 * s'est identifié) est affiché comme « Système » avec sa raison, jamais comme un
 * champ vide : une trace incomplète doit se voir, une trace maquillée non.
 */

/** Types d'actions et leur pastille, dans l'ordre du cycle de vie. */
const TYPES = {
  CREATION_DOSSIER: { label: 'Création du dossier', tone: 'bg-emerald-500' },
  ENREGISTREMENT: { label: 'Enregistrement', tone: 'bg-sky-500' },
  ORIENTATION: { label: 'Orientation', tone: 'bg-cyan-500' },
  AFFECTATION: { label: 'Affectation', tone: 'bg-indigo-500' },
  TRANSFERT: { label: 'Transfert', tone: 'bg-amber-500' },
  TRAITEMENT: { label: 'Traitement', tone: 'bg-sky-600' },
  SOUMISSION_VERIFICATION: { label: 'Soumission à vérification', tone: 'bg-violet-500' },
  VERIFICATION: { label: 'Vérification', tone: 'bg-violet-600' },
  CONTROL_APPROUVE: { label: 'Contrôle approuvé', tone: 'bg-violet-600' },
  CORRECTION_DEMANDEE: { label: 'Correction demandée', tone: 'bg-red-500' },
  CORRECTION_EFFECTUEE: { label: 'Correction effectuée', tone: 'bg-emerald-500' },
  VALIDATION: { label: 'Validation', tone: 'bg-emerald-600' },
  SIGNATURE: { label: 'Signature', tone: 'bg-teal-600' },
  CLOTURE: { label: 'Clôture', tone: 'bg-slate-700' },
  ARCHIVAGE: { label: 'Archivage', tone: 'bg-slate-800' },
  RESTAURATION_ARCHIVE: { label: 'Restauration depuis les archives', tone: 'bg-amber-600' },
  LIQUIDATION_PENSION: { label: 'Liquidation de pension', tone: 'bg-teal-600' },
  DECOMPTE_AVANCE: { label: 'Décompte d\'avance', tone: 'bg-teal-600' },
  UPLOAD_DOCUMENT: { label: 'Dépôt d\'un document', tone: 'bg-violet-500' },
  MODIFICATION_DOSSIER: { label: 'Modification', tone: 'bg-amber-500' },
  CHANGEMENT_STATUT: { label: 'Changement de statut', tone: 'bg-slate-500' },
  CREATION_COURRIER: { label: 'Création d\'un courrier', tone: 'bg-rose-500' },
  CORRESPONDANCE: { label: 'Correspondance', tone: 'bg-rose-500' },
  CONNEXION: { label: 'Connexion', tone: 'bg-slate-400' },
  CONNEXION_ECHOUEE: { label: 'Tentative de connexion refusée', tone: 'bg-red-600' },
  SAUVEGARDE_DB: { label: 'Sauvegarde de la base', tone: 'bg-slate-600' },
};

const LIBELLES = {
  CREATION_DOSSIER: 'Création du dossier',
  ENREGISTREMENT: 'Enregistrement',
  ORIENTATION: 'Orientation',
  AFFECTATION: 'Affectation',
  TRANSFERT: 'Transfert',
  TRAITEMENT: 'Traitement',
  SOUMISSION_VERIFICATION: 'Soumission à vérification',
  VERIFICATION: 'Vérification',
  CONTROL_APPROUVE: 'Contrôle approuvé',
  CORRECTION_DEMANDEE: 'Correction demandée',
  CORRECTION_EFFECTUEE: 'Correction effectuée',
  VALIDATION: 'Validation',
  SIGNATURE: 'Signature',
  CLOTURE: 'Clôture',
  ARCHIVAGE: 'Archivage',
  RESTAURATION_ARCHIVE: 'Restauration depuis les archives',
  LIQUIDATION_PENSION: 'Liquidation de pension',
  DECOMPTE_AVANCE: "Décompte d'avance",
  UPLOAD_DOCUMENT: "Dépôt d'un document",
  MODIFICATION_DOSSIER: 'Modification du dossier',
  CHANGEMENT_STATUT: 'Changement de statut',
  CREATION_COURRIER: "Création d'un courrier",
  CORRESPONDANCE: 'Correspondance',
  CONNEXION: 'Connexion',
  CONNEXION_ECHOUEE: 'Tentative de connexion refusée',
  SAUVEGARDE_DB: 'Sauvegarde de la base',
};

const p2 = (n) => String(n).padStart(2, '0');

/** « 28/09/2025 » et « 08h30:15 », séparément, comme le veut le document. */
export function horodatageFr(iso) {
  if (!iso) return { date: '—', heure: '—' };
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: '—', heure: '—' };
  return {
    date: `${p2(d.getDate())}/${p2(d.getMonth() + 1)}/${d.getFullYear()}`,
    heure: `${p2(d.getHours())}h${p2(d.getMinutes())}:${p2(d.getSeconds())}`,
  };
}

/** Nombre d'intervenants distincts, pour le récapitulatif du document. */
function compterAgents(actions) {
  const uniques = new Map();
  for (const a of actions) {
    if (!a.agent || a.agent.systeme) continue;
    const cle = a.agent.identite;
    if (!uniques.has(cle)) uniques.set(cle, { identite: cle, role: a.role?.libelle || '—', actions: 0 });
    uniques.get(cle).actions += 1;
  }
  return [...uniques.values()].sort((x, y) => y.actions - x.actions);
}

/**
 * Onglet « Historique » de la fiche dossier.
 *
 * L'historique est chargé par le parent et transmis en `actions` : le composant
 * ne fait pas d'appel, pour qu'un rafraîchissement de la fiche ne déclenche pas
 * une seconde requête identique.
 */
export function HistoriqueDossier({ actions = [], dossierId, loading, dureeTraitement }) {
  const { toastSuccess, toastError } = useNotification();
  const [enCours, setEnCours] = useState(null);
  const [recapitulatif, setRecapitulatif] = useState(false);

  const exporter = async (format) => {
    setEnCours(format);
    try {
      const nom = await historiqueService.exporter(format, { dossier_id: dossierId });
      toastSuccess(`Export « ${nom} » téléchargé.`);
    } catch (e) {
      toastError(e.message);
    } finally {
      setEnCours(null);
    }
  };

  if (loading) {
    return <p className="py-6 text-center text-sm text-slate-400">Chargement de l'historique…</p>;
  }

  if (!actions.length) {
    return (
      <p className="py-6 text-center text-sm text-slate-400">
        Aucune action enregistrée pour ce dossier.
      </p>
    );
  }

  const agents = compterAgents(actions);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-slate-500">
          {actions.length} action{actions.length > 1 ? 's' : ''} enregistrée
          {actions.length > 1 ? 's' : ''} — chaque action porte son auteur, sa date et son heure.
          {dureeTraitement && (
            <>
              {' '}Durée totale de traitement : <span className="font-medium text-slate-600">{dureeTraitement}</span>.
            </>
          )}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => setRecapitulatif((v) => !v)}>
            <User className="h-3.5 w-3.5" />
            {recapitulatif ? 'Masquer' : 'Voir'} le récapitulatif
          </Button>
          <Button size="sm" variant="secondary" onClick={() => exporter('csv')} loading={enCours === 'csv'}>
            <FileText className="h-3.5 w-3.5" /> CSV
          </Button>
          <Button size="sm" variant="secondary" onClick={() => exporter('excel')} loading={enCours === 'excel'}>
            <FileSpreadsheet className="h-3.5 w-3.5" /> Excel
          </Button>
          <Button size="sm" variant="secondary" onClick={() => exporter('pdf')} loading={enCours === 'pdf'}>
            <FileDown className="h-3.5 w-3.5" /> PDF
          </Button>
        </div>
      </div>

      {recapitulatif && (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2">Agent</th>
                <th className="px-3 py-2">Rôle</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {agents.map((a) => (
                <tr key={a.identite}>
                  <td className="px-3 py-2 font-medium text-slate-700">{a.identite}</td>
                  <td className="px-3 py-2 text-slate-600">{a.role}</td>
                  <td className="px-3 py-2 text-right text-slate-600">{a.actions}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-500">
            {agents.length} intervenant{agents.length > 1 ? 's' : ''} sur ce dossier.
          </p>
        </div>
      )}

      <ol className="space-y-2">
        {actions.map((a) => {
          const { date, heure } = horodatageFr(a.date_action);
          const conf = TYPES[a.action] || { label: LIBELLES[a.action] || a.action, tone: 'bg-slate-400' };
          return (
            <li
              key={a.id}
              className={`rounded-lg border p-3 ${
                a.agent?.systeme ? 'border-amber-200 bg-amber-50/60' : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${conf.tone}`} aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-700">
                    {conf.label}
                    <span className="ml-2 font-normal text-slate-400">
                      {date} à {heure}
                    </span>
                  </p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-600">
                    <span>
                      <span className="text-slate-400">Agent :</span>{' '}
                      <span className="font-medium">{a.agent?.identite || '—'}</span>
                    </span>
                    {a.role && (
                      <span>
                        <span className="text-slate-400">Rôle :</span> {a.role.libelle}
                      </span>
                    )}
                  </p>
                  {a.details && <p className="mt-0.5 text-sm text-slate-600">{a.details}</p>}
                  {a.agent?.raison && (
                    <p className="mt-1 text-xs italic text-amber-700">{a.agent.raison}</p>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default HistoriqueDossier;
