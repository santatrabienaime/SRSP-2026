import {
  UserCheck, Wrench, ShieldCheck, CheckCircle2, ArrowRightLeft, Clock,
} from 'lucide-react';
import { formatDateTime } from '../../utils/formatDate.js';

/** Libellés et couleurs par type d'acte métier. */
const TYPES = {
  AFFECTATION: { label: 'Affectation', icon: UserCheck, tone: 'text-primary-600 bg-primary-50' },
  TRANSFERT: { label: 'Transfert', icon: ArrowRightLeft, tone: 'text-amber-600 bg-amber-50' },
  TRAITEMENT: { label: 'Traitement', icon: Wrench, tone: 'text-sky-600 bg-sky-50' },
  VERIFICATION: { label: 'Vérification', icon: ShieldCheck, tone: 'text-violet-600 bg-violet-50' },
  VALIDATION: { label: 'Validation', icon: CheckCircle2, tone: 'text-emerald-600 bg-emerald-50' },
};

/**
 * Traçabilité fine d'un dossier : qui a fait quoi, quand.
 * Alimenté par les tables métier (affectations, traitements, verifications,
 * validations, transferts) via GET /dossiers/:id/tracabilite.
 */
export function TracabiliteTimeline({ actes = [] }) {
  if (!actes.length) {
    return (
      <p className="py-6 text-center text-sm text-slate-400">
        Aucun acte métier enregistré pour ce dossier.
      </p>
    );
  }

  return (
    <ol className="relative space-y-3">
      <div className="absolute bottom-2 left-[15px] top-2 w-px bg-slate-200" />
      {actes.map((acte, i) => {
        const conf = TYPES[acte.type] || {
          label: acte.type, icon: Clock, tone: 'text-slate-600 bg-slate-50',
        };
        const Icon = conf.icon;
        return (
          <li key={`${acte.type}-${i}`} className="relative flex gap-3">
            <span
              className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ring-white ${conf.tone}`}
            >
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-sm font-semibold text-slate-700">{conf.label}</p>
              {acte.acteur && (
                <p className="text-xs font-medium text-slate-500">{acte.acteur}</p>
              )}
              {acte.detail && (
                <p className="mt-0.5 text-sm text-slate-600">{acte.detail}</p>
              )}
              <p className="mt-0.5 text-xs text-slate-400">
                {formatDateTime(acte.date)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export default TracabiliteTimeline;
