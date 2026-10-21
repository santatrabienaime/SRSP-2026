import { useState, useEffect, useCallback } from 'react';
import { ArrowRight, UserCheck, Clock, CheckCircle2, CircleAlert } from 'lucide-react';
import { dossierService } from '../../services/dossierService.js';
import { Card } from '../ui/Card.jsx';
import { Badge } from '../ui/Badge.jsx';
import { Spinner } from '../ui/Spinner.jsx';
import { Alert } from '../ui/Alert.jsx';

/**
 * « À faire ensuite ».
 *
 * Le cahier des fonctionnalités demande à l'agent de « connaître la prochaine
 * action ». Une barre de boutons ne le dit pas : il faut déjà connaître le
 * circuit pour deviner lequel presser. Ce bloc répond à deux questions
 * distinctes, et les tient séparées :
 *
 *   - **quelle** est l'étape suivante du dossier ;
 *   - **à qui** elle incombe — à vous, ou à un autre poste.
 *
 * C'est le second point qui manque le plus : savoir que le dossier attend le
 * Chef de Division, plutôt que de supposer qu'il incombe à soi de faire
 * quelque chose.
 *
 * La règle est calculée **par le serveur** : le même calcul sert à l'écran,
 * à la liste et aux notifications, et il ne peut pas diverger entre les
 * trois.
 */
export function ProchaineAction({ dossierId, onAction }) {
  const [action, setAction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState(null);

  const charger = useCallback(async () => {
    try {
      setLoading(true);
      setErreur(null);
      setAction(await dossierService.getProchaineAction(dossierId));
    } catch (e) {
      setErreur(e);
    } finally {
      setLoading(false);
    }
  }, [dossierId]);

  useEffect(() => { Promise.resolve().then(charger); }, [charger]);

  if (loading) {
    return (
      <Card className="border-slate-200 bg-slate-50/60">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Spinner className="py-0" /> Recherche de la prochaine action…
        </div>
      </Card>
    );
  }

  if (erreur) {
    return (
      <Alert type="warning" title="Prochaine action indisponible">
        {erreur.message}
      </Alert>
    );
  }

  if (!action) return null;

  /* Dossier archivé : il n'y a plus rien à faire. Le bloc le dit, et le
     dit clairement — c'est une information, pas une absence. */
  if (!action.code) {
    return (
      <Card className="border-emerald-200 bg-emerald-50/50">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-emerald-900">{action.titre}</p>
            <p className="mt-0.5 text-sm text-emerald-800">{action.description}</p>
          </div>
        </div>
      </Card>
    );
  }

  /* L'action revient-elle à l'agent connecté ? */
  const pourMoi = action.pour_moi;

  return (
    <Card
      className={pourMoi
        ? 'border-primary-200 bg-primary-50/60'
        : 'border-amber-200 bg-amber-50/50'}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
              pourMoi ? 'bg-primary-100 text-primary-700' : 'bg-amber-100 text-amber-700'
            }`}
          >
            {pourMoi ? <UserCheck className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              À faire ensuite
            </p>
            <p className="mt-0.5 text-sm font-semibold text-slate-800">{action.titre}</p>
            <p className="mt-1 text-sm text-slate-600">{action.description}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge
                className={
                  pourMoi
                    ? 'border-primary-200 bg-primary-100 text-primary-800'
                    : 'border-amber-200 bg-amber-100 text-amber-800'
                }
              >
                {pourMoi ? 'C’est à vous' : `En attente de : ${action.acteur || 'autre poste'}`}
              </Badge>
              {!pourMoi && action.acteur && (
                <span className="flex items-center gap-1 text-xs text-amber-800">
                  <CircleAlert className="h-3.5 w-3.5" />
                  Ce n’est pas à vous d’agir sur ce dossier pour l’instant.
                </span>
              )}
            </div>
          </div>
        </div>

        {pourMoi && onAction && (
          <button
            type="button"
            onClick={() => onAction(action.code)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
          >
            {action.titre} <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </Card>
  );
}

export default ProchaineAction;
