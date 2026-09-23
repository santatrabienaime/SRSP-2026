import { NotificationList } from '../../components/notification/NotificationList.jsx';
import { Card } from '../../components/ui/Card.jsx';

export function NotificationsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Notifications</h1>
        <p className="text-sm text-slate-500">
          Alertes concernant vos dossiers : affectations, vérifications, validations…
        </p>
      </div>
      <Card>
        <NotificationList />
      </Card>
    </div>
  );
}

export default NotificationsPage;