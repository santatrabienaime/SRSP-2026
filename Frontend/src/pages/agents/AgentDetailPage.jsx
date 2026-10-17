import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { agentService } from '../../services/agentService.js';
import { Card } from '../../components/ui/Card.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { AgentCard } from '../../components/agent/AgentCard.jsx';
import { AnimatedCard } from '../../components/ui/AnimatedCard.jsx';

export function AgentDetailPage() {
  const { id } = useParams();
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    agentService
      .get(id)
      .then((row) => setAgent(row || null))
      .catch(setError)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner label="Chargement…" />;
  if (error) return <Alert type="error">{error.message}</Alert>;
  if (!agent) return <Alert type="warning">Agent introuvable.</Alert>;

  return (
    <AnimatedCard title="Fiche agent" delay={0}>
      <Card title="Liens">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Dossiers affectés à cet agent : voir la liste des dossiers en filtrant par agent
          depuis le module « Dossiers ».
        </p>
      </Card>
    </AnimatedCard>
  );
}

export default AgentDetailPage;