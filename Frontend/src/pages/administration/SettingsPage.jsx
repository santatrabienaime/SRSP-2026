import { useAuth } from '../../hooks/useAuth.js';
import { Card } from '../../components/ui/Card.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { AgentList } from '../../components/agent/AgentList.jsx';
import { DivisionList } from '../../components/division/DivisionList.jsx';
import { BackupPage } from './BackupPage.jsx';
import { AnimatedCard } from '../../components/ui/AnimatedCard.jsx';

/** Paramètres : référentiel (agents, divisions) accessible aux administrateurs. */
export function SettingsPage() {
  const { user } = useAuth();
  return (
    <AnimatedCard title="Paramètres" subtitle="Référentiel du SRSP : divisions, agents et sauvegardes." delay={0}>
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

      <Card title="Sauvegarde et restauration">
        <BackupPage />
      </Card>
    </AnimatedCard>
  );
}

export default SettingsPage;