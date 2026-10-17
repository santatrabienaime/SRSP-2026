import { NotificationList } from '../../components/notification/NotificationList.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { AnimatedCard } from '../../components/ui/AnimatedCard.jsx';

export function NotificationsPage() {
  return (
    <AnimatedCard title="Notifications" subtitle="Alertes concernant vos dossiers : affectations, vérifications, validations…" delay={0}>
      <Card>
        <NotificationList />
      </Card>
    </AnimatedCard>
  );
}

export default NotificationsPage;