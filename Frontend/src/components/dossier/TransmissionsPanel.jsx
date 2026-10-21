import { useState, useEffect, useCallback } from 'react';
import { ArrowRightLeft, Send, Inbox, CalendarClock, FileText } from 'lucide-react';
import { dossierService } from '../../services/dossierService.js';
import { Card } from '../ui/Card.jsx';
import { Badge } from '../ui/Badge.jsx';
import { Spinner } from '../ui/Spinner.jsx';
import { Alert } from '../ui/Alert.jsx';
import { formatDateTime } from '../../utils/formatDate.js';

/**
 * Transmissions d'un dossier.
 *
 * Le cahier des fonctionnalités demande de « retrouver toutes les
 * transmissions sans fouiller dans plusieurs registres ». Chaque passage d'un
 * dossier d'un service à l'autre passe par un bordereau ; c'est ce bordereau
 * qui est listé ici, avec son expéditeur, son destinataire, sa date et sa
 * référence.
 *
 * Un dossier jamais transmis n'a pas de transmission : c'est un état normal,
 * pas une absence — la carte le dit.
 */

/** États d'un bordereau et leur traduction. */
const ETATS_BORDEREAU = {
  BROUILLON: { label: 'En préparation', classe: 'border-slate-200 bg-slate-50 text-slate-600' },
  EMIS: { label: 'Émis', classe: 'border-sky-200 bg-sky-50 text-sky-700' },
  RECU_PAR_DIVISION: { label: 'Reçu par la division', classe: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  ARCHIVE: { label: 'Archivé', classe: 'border-gray-300 bg-gray-100 text-gray-600' },
};

export function TransmissionsPanel({ dossierId }) {
  const [transmissions, setTransmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const charger = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setTransmissions(await dossierService.getTransmissions(dossierId));
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [dossierId]);

  useEffect(() => { Promise.resolve().then(charger); }, [charger]);

  if (loading) return <Spinner className="py-6" />;

  if (error) {
    return (
      <Alert type="warning" title="Transmissions indisponibles">
        {error.message}
      </Alert>
    );
  }

  if (!transmissions.length) {
    return (
      <p className="rounded-md bg-slate-50 px-3 py-4 text-sm text-slate-500">
        Ce dossier n’a pas encore été transmis à une autre division. Les
        transmissions apparaîtront ici, avec le bordereau qui les porte.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {transmissions.map((t) => {
        const etat = ETATS_BORDEREAU[t.statut] || {
          label: t.statut,
          classe: 'border-slate-200 bg-slate-50 text-slate-600',
        };
        const expediteur = t.division_expediteur_nom
          || (t.agent_nom ? `${t.agent_prenom || ''} ${t.agent_nom}`.trim() : null);
        return (
          <li
            key={t.id}
            className="rounded-lg border border-slate-200 p-3 transition-colors hover:border-slate-300"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-sm font-medium text-slate-800">
                  <FileText className="h-3.5 w-3.5 text-slate-400" />
                  Bordereau {t.reference}
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-600">
                  {expediteur && (
                    <>
                      <Send className="h-3 w-3 text-slate-400" />
                      <span>Émis par {expediteur}</span>
                      <ArrowRightLeft className="h-3 w-3 text-slate-300" />
                    </>
                  )}
                  <Inbox className="h-3 w-3 text-slate-400" />
                  <span>Reçu par {t.division_nom}</span>
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                  <CalendarClock className="h-3 w-3" />
                  {t.date_transmission ? formatDateTime(t.date_transmission) : 'Date non renseignée'}
                  {t.date_reception_division
                    && ` — accusé de réception le ${formatDateTime(t.date_reception_division)}`}
                </p>
                {t.observation && (
                  <p className="mt-1 rounded bg-slate-50 px-2 py-1 text-xs text-slate-600">
                    {t.observation}
                  </p>
                )}
              </div>
              <Badge className={etat.classe}>{etat.label}</Badge>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default TransmissionsPanel;
