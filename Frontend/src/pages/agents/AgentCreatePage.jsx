import { useNavigate } from 'react-router-dom';
import { AgentForm } from '../../components/agent/AgentForm.jsx';
import { Card } from '../../components/ui/Card.jsx';

export function AgentCreatePage() {
  const navigate = useNavigate();
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Nouvel agent</h1>
        <p className="text-sm text-slate-500">Ajouter un agent au personnel du SRSP.</p>
      </div>
      <Card title="Informations de l'agent">
        <AgentForm onSaved={() => navigate('/administration/parametres')} />
      </Card>
    </div>
  );
}

export default AgentCreatePage;