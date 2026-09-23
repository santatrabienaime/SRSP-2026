import { useAuth } from '../../hooks/useAuth.js';
import { Card } from '../../components/ui/Card.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { AgentList } from '../../components/agent/AgentList.jsx';
import { DivisionList } from '../../components/division/DivisionList.jsx';

/** Paramètres : référentiel (agents, divisions) accessible aux administrateurs. */
export function SettingsPage() {
  const { user } = useAuth();
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Paramètres</h1>
        <p className="text-sm text-slate-500">
          Référentiel du SRSP : divisions et agents de la plateforme.
        </p>
      </div>

      <Card title="Compte connecté" subtitle="Contexte de session">
        <div className="flex flex-wrap items-center gap-3">
          <Badge className="border-primary-200 bg-primary-50 text-primary-700">{user?.role_nom}</Badge>
          <Badge className="border-slate-200 bg-slate-50 text-slate-600">{user?.email}</Badge>
        </div>
      </Card>

      <Card title="Divisions">
        <DivisionList />
      </Card>

      <Card title="Agents">
        <AgentList />
      </Card>
    </div>
  );
}

export default SettingsPage;