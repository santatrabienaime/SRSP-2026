import { useAuth } from '../../hooks/useAuth.js';
import { Card } from '../../components/ui/Card.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { DivisionList } from '../../components/division/DivisionList.jsx';
import { BackupPage } from './BackupPage.jsx';
import { SystemInfoCard } from './SystemInfoCard.jsx';
import { AnimatedCard } from '../../components/ui/AnimatedCard.jsx';

/**
 * Paramètres : divisions et sauvegardes.
 *
 * Le personnel n'est plus listé ici : il a son propre écran (« Personnel »),
 * qui réunit la fiche et le compte de connexion. Le même tableau apparaissait
 * à deux endroits, et l'on ne savait plus lequel faisait foi.
 */
export function SettingsPage() {
  const { user, hasAnyPermission } = useAuth();
  return (
    <AnimatedCard title="Paramètres" subtitle="Référentiel du SRSP : divisions et sauvegardes." delay={0}>
      <Card title="Compte connecté" subtitle="Contexte de session">
        <div className="flex flex-wrap items-center gap-3">
          <Badge className="border-primary-200 bg-primary-50 text-primary-700">{user?.role_nom}</Badge>
          <Badge className="border-slate-200 bg-slate-50 text-slate-600">{user?.email}</Badge>
        </div>
      </Card>

      <Card title="Divisions">
        <DivisionList />
      </Card>

      <Card title="Sauvegarde et restauration">
        <BackupPage />
      </Card>

      {/* Les informations système ne concernent que l'administrateur : elles
          décrivent la machine, pas le service. */}
      {hasAnyPermission(['system_config']) && <SystemInfoCard />}
    </AnimatedCard>
  );
}

export default SettingsPage;
