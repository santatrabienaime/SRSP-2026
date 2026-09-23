import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { agentService } from '../../services/agentService.js';
import { Card } from '../../components/ui/Card.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { AgentCard } from '../../components/agent/AgentCard.jsx';

export function AgentDetailPage() {
  const { id } = useParams();
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    agentService
      .list()
      .then((rows) => {
        const found = (Array.isArray(rows) ? rows : []).find((a) => a.id === Number(id));
        setAgent(found || null);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner label="Chargement…" />;
  if (error) return <Alert type="error">{error.message}</Alert>;
  if (!agent) return <Alert type="warning">Agent introuvable.</Alert>;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="text-xl font-bold text-slate-800">Fiche agent</h1>
      <AgentCard agent={agent} />
      <Card title="Liens">
        <p className="text-sm text-slate-600">
          Dossiers affectés à cet agent : voir la liste des dossiers en filtrant par agent
          depuis le module « Dossiers ».
        </p>
      </Card>
    </div>
  );
}

export default AgentDetailPage;