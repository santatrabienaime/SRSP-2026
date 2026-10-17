import { useNavigate } from 'react-router-dom';
import { AgentForm } from '../../components/agent/AgentForm.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { AnimatedCard } from '../../components/ui/AnimatedCard.jsx';

export function AgentCreatePage() {
  const navigate = useNavigate();
  return (
    <AnimatedCard title="Nouvel agent" subtitle="Ajouter un agent au personnel du SRSP." delay={0}>
      <Card title="Informations de l'agent">
        <AgentForm onSaved={() => navigate('/agents')} />
      </Card>
    </AnimatedCard>
  );
}

export default AgentCreatePage;