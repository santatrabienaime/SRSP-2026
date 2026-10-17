import { useNavigate } from 'react-router-dom';
import { CourrierForm } from '../../components/courrier/CourrierForm.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { AnimatedCard } from '../../components/ui/AnimatedCard.jsx';

export function CourrierCreatePage() {
  const navigate = useNavigate();
  return (
    <AnimatedCard title="Nouveau courrier" subtitle="Enregistrement d'un courrier entrant ou sortant." delay={0}>
      <Card title="Courrier">
        <CourrierForm onSaved={(id) => navigate(`/courriers/${id}`)} />
      </Card>
    </AnimatedCard>
  );
}

export default CourrierCreatePage;