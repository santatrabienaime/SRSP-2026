import { useParams } from 'react-router-dom';
import { DivisionDashboard } from '../../components/division/DivisionDashboard.jsx';
import { AnimatedCard } from '../../components/ui/AnimatedCard.jsx';

export function DivisionDetailPage() {
  const { id } = useParams();
  return (
    <AnimatedCard title="Division" subtitle="Tableau de bord et gestion de votre périmètre." delay={0}>
      <DivisionDashboard divisionId={id} />
    </AnimatedCard>
  );
}

export default DivisionDetailPage;