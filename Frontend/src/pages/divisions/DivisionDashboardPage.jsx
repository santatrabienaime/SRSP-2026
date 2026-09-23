import { useParams } from 'react-router-dom';
import { DivisionDashboard } from '../../components/division/DivisionDashboard.jsx';

export function DivisionDashboardPage() {
  const { id } = useParams();
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-slate-800">Espace division</h1>
      <DivisionDashboard divisionId={id} />
    </div>
  );
}

export default DivisionDashboardPage;