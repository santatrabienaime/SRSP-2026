import { CourrierList } from '../../components/courrier/CourrierList.jsx';
import { AnimatedCard } from '../../components/ui/AnimatedCard.jsx';

export function CourrierListPage() {
  return (
    <AnimatedCard title="Courriers" subtitle="Registre des courriers entrants et sortants, liés aux dossiers." delay={0}>
      <CourrierList />
    </AnimatedCard>
  );
}

export default CourrierListPage;