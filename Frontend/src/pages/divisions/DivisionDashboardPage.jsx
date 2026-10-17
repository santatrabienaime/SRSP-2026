import { useParams } from 'react-router-dom';
import { DivisionDashboard } from '../../components/division/DivisionDashboard.jsx';
import { AnimatedCard } from '../../components/ui/AnimatedCard.jsx';

export function DivisionDashboardPage() {
  const { id } = useParams();
  return (
    <AnimatedCard title="Tableau de bord de division" subtitle="Vue d'ensemble des dossiers de votre périmètre." delay={0}>
      <DivisionDashboard divisionId={id} />
    </AnimatedCard>
  );
}

export default DivisionDashboardPage;