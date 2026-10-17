import { useState, useEffect } from 'react';
import { Mail, RefreshCcw, ArrowLeft } from 'lucide-react';
import { messageService } from '../../services/messageService.js';
import { MessageItem } from '../../components/messages/MessageItem.jsx';
import { useNotification } from '../../hooks/useNotification.js';
import { Card } from '../../components/ui/Card.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { AnimatedCard } from '../../components/ui/AnimatedCard.jsx';
import { Button } from '../../components/ui/Button.jsx';

export function MessagesPage() {
  const { toastSuccess, toastError } = useNotification();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [nonLus, setNonLus] = useState(0);

  const chargerMessages = async () => {
    setChargement(true);
    try {
      const [liste, nbNonLus] = await Promise.all([
        messageService.list(),
        messageService.countUnread(),
      ]);
      setMessages(liste || []);
      setNonLus(nbNonLus || 0);
    } catch (err) {
      toastError(err.message);
    } finally {
      setChargement(false);
    }
  };

  const marquerTousLus = async () => {
    try {
      await messageService.markAllAsRead();
      setMessages((msgs) => msgs.map((m) => ({ ...m, lu: true })));
      setNonLus(0);
      toastSuccess('Tous les messages marqués comme lus');
    } catch (err) {
      toastError(err.message);
    }
  };

  const onMessageLu = () => {
    chargerMessages();
  };

  useEffect(() => {
    chargerMessages();
  }, []);

  return (
    <AnimatedCard title="Messages" subtitle="Vos notifications et messages internes" delay={0}>
      <div className="space-y-4">
        {/* En-tête avec actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-800">Messages</h2>
          </div>
          <div className="flex items-center gap-3">
            {nonLus > 0 && (
              <Button
                variant="outline"
                onClick={marquerTousLus}
                disabled={nonLus === 0}
              >
                <RotateCcw className="h-4 w-4" /> Marquer tous lus ({nonLus})
              </Button>
            )}
            <Badge className={`border-blue-200 bg-blue-50 text-blue-900`}>
              {nonLus} nouveau{nonLus > 1 ? 's' : ''}
            </Badge>
          </div>
        </div>

        {chargement ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <Spinner label="Chargement des messages…" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">Aucun message</h3>
            <p className="text-sm text-slate-500 mt-1">
              Aucun message pour le moment. Les notifications apparaissent ici
              lorsque quelqu'un vous affecte un dossier ou qu'une action est
              effectuée sur vos dossiers.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((msg) => (
              <MessageItem
                key={msg.id}
                message={msg}
                onUpdate={onMessageLu}
              />
            ))}
          </div>
        )}
      </div>
    </AnimatedCard>
  );
}

export default MessagesPage;