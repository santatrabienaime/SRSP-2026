import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react';

const STYLES = {
  info: { cls: 'border-sky-300 bg-sky-50 text-sky-800', Icon: Info, title: 'Information' },
  success: { cls: 'border-emerald-300 bg-emerald-50 text-emerald-800', Icon: CheckCircle2, title: 'Succès' },
  warning: { cls: 'border-amber-300 bg-amber-50 text-amber-800', Icon: AlertCircle, title: 'Attention' },
  error: { cls: 'border-red-300 bg-red-50 text-red-800', Icon: XCircle, title: 'Erreur' },
};

export function Alert({ type = 'info', title, children }) {
  const { cls, Icon, title: defaultTitle } = STYLES[type] || STYLES.info;
  return (
    <div className={`flex gap-3 rounded-md border p-4 ${cls}`} role="alert">
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        <p className="text-sm font-semibold">{title || defaultTitle}</p>
        {children && <div className="mt-1 text-sm">{children}</div>}
      </div>
    </div>
  );
}

export default Alert;