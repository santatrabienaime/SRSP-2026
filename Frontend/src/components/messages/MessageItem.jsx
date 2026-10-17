import { useState } from 'react';
import { Bell, Mail, Clock, AlertTriangle, Inbox } from 'lucide-react';
import { messageService } from '../../services/messageService.js';
import { useNotification } from '../../hooks/useNotification.js';

const ICONES_ACTION = {
  CREATION: 'FilePlus',
  AFFECTATION: 'UserCheck',
  TRAITEMENT: 'Clock',
  VERIFICATION: 'ShieldCheck',
  VALIDATION: 'Check',
  SIGNATURE: 'Stamp',
  COMMENTAIRE: 'MessageSquare',
  CLOTURE: 'Archive',
  ARCHIVAGE: 'FolderArchive',
  TRANSITION: 'RefreshCw',
};

const COULEURS_TYPE = {
  INFO: 'text-blue-600 bg-blue-50 border-blue-200',
  ALERTE: 'text-amber-600 bg-amber-50 border-amber-200',
  URGENT: 'text-red-600 bg-red-50 border-red-200',
};

const LIBELLE_ACTION = {
  CREATION: 'Nouveau dossier créé',
  AFFECTATION: 'Dossier affecté',
  TRAITEMENT: 'Dossier en traitement',
  VERIFICATION: 'Dossier vérifié',
  VALIDATION: 'Dossier validé',
  SIGNATURE: 'Dossier signé',
  COMMENTAIRE: 'Nouveau commentaire',
  CLOTURE: 'Dossier clôturé',
  ARCHIVAGE: 'Dossier archivé',
  TRANSITION: 'Statut modifié',
};

export function MessageItem({ message, onUpdate }) {
  const { toastSuccess, toastError } = useNotification();
  const [marquant, setMarquant] = useState(false);

  const marquerLu = async () => {
    if (marquant) return;
    setMarquant(true);
    try {
      await messageService.markAsRead(message.id);
      setMarquant(false);
      toastSuccess('Message marqué comme lu');
      onUpdate?.();
    } catch (err) {
      setMarquant(false);
      toastError(err.message);
    }
  };

  const icone = ICONES_ACTION[message.action] || 'Mail';
  const couleur = COULEURS_TYPE[message.type] || COULEURS_TYPE.INFO;
  const libelle = LIBELLE_ACTION[message.action] || message.action;

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg border ${message.lu ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700' : 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/20 dark:border-blue-500/30 dark:text-blue-100'} transition-colors cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/10`}
      onClick={!message.lu ? marquerLu : undefined}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && marquerLu()}
    >
      <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${COULEURS_TYPE[message.type] || COULEURS_TYPE.INFO}`}>
        {icon === 'Mail' ? (
          <Mail className="w-4 h-4" />
        ) : (
          <span className="text-xs">{icon.charAt(0)}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`font-semibold text-sm ${COULEURS_TYPE[message.type]?.split(' ')[0] || 'text-blue-600'}`}>
            {libelle}
          </span>
          {!message.lu && (
            <span className="flex h-4 w-4 rounded-full bg-red-600 text-white text-[10px] font-bold items-center justify-center">
              !
            </span>
          )}
          <span className="text-[10px] text-slate-500">{new Date(message.date_creation || message.created_at).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{message.message}</p>
        {message.dossier_numero && (
          <p className="mt-1 text-[10px] text-slate-400">
            Dossier <strong>{message.dossier_numero}</strong>
          </p>
        )}
      </div>
    </div>
  );
}

export default MessageItem;