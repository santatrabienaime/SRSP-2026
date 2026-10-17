import { AgentList } from '../../components/agent/AgentList.jsx';
import { AnimatedCard } from '../../components/ui/AnimatedCard.jsx';

export function AgentListPage() {
  return (
    <AnimatedCard title="Agents" subtitle="Personnel rattaché aux divisions et aux dossiers." delay={0}>
      <AgentList />
    </AnimatedCard>
  );
}

export default AgentListPage;