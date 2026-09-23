import { AgentList } from '../../components/agent/AgentList.jsx';

export function AgentListPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Agents</h1>
        <p className="text-sm text-slate-500">Personnel rattaché aux divisions et aux dossiers.</p>
      </div>
      <AgentList />
    </div>
  );
}

export default AgentListPage;