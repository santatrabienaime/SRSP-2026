import { CheckCircle2, Circle } from 'lucide-react';
import { WORKFLOW_ORDER, STATUT_LABELS } from '../../config/constants.js';

/**
 * Timeline verticale du workflow (11 statuts v2.0).
 * - statut : code actuel ou null
 */
export function WorkflowTimeline({ statut }) {
  const currentIndex = WORKFLOW_ORDER.indexOf(statut);

  return (
    <div>
      <div className="relative">
        {/* ligne verticale */}
        <div className="absolute bottom-2 left-4 top-2 w-px bg-slate-200" />
        <ol className="space-y-1">
          {WORKFLOW_ORDER.map((code, i) => {
            const done = currentIndex >= 0 && i <= currentIndex;
            const active = code === statut;
            const StepIcon = done ? CheckCircle2 : Circle;
            return (
              <li key={code} className="relative flex items-center gap-3 py-1.5 pl-0">
                <StepIcon
                  className={`relative z-10 h-7 w-7 shrink-0 rounded-full bg-white p-1 ${
                    active
                      ? 'text-primary-600'
                      : done
                        ? 'text-emerald-500'
                        : 'text-slate-300'
                  }`}
                />
                <span
                  className={`text-sm ${
                    active
                      ? 'font-semibold text-primary-700'
                      : done
                        ? 'font-medium text-slate-600'
                        : 'text-slate-400'
                  }`}
                >
                  {STATUT_LABELS[code]}
                  {active && <span className="ml-2 rounded bg-primary-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-primary-600">Actuel</span>}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

export default WorkflowTimeline;