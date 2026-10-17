import { DivisionList } from '../../components/division/DivisionList.jsx';
import { AnimatedCard } from '../../components/ui/AnimatedCard.jsx';

export function DivisionListPage() {
  return (
    <AnimatedCard title="Divisions" subtitle="Répartition géographique et organisationnelle des dossiers." delay={0}>
      <DivisionList />
    </AnimatedCard>
  );
}

export default DivisionListPage;