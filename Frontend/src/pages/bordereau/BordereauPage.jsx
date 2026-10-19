import { BordereauList } from '../../components/bordereau/BordereauList.jsx';
import { AnimatedCard } from '../../components/ui/AnimatedCard.jsx';

export function BordereauPage() {
  return (
    <AnimatedCard
      title="Bordereaux de transmission"
      subtitle="Gestion des bordereaux d'envoi des dossiers aux divisions"
      delay={0}
    >
      <BordereauList />
    </AnimatedCard>
  );
}

export default BordereauPage;