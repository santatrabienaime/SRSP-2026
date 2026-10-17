import { useParams } from 'react-router-dom';
import { CourrierDetail } from '../../components/courrier/CourrierDetail.jsx';
import { AnimatedCard } from '../../components/ui/AnimatedCard.jsx';

export function CourrierDetailPage() {
  const { id } = useParams();
  return (
    <AnimatedCard title="Détail du courrier" delay={0}>
      <CourrierDetail id={id} />
    </AnimatedCard>
  );
}

export default CourrierDetailPage;