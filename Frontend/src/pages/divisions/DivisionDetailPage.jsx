import { useParams } from 'react-router-dom';
import { DivisionDashboard } from '../../components/division/DivisionDashboard.jsx';

export function DivisionDetailPage() {
  const { id } = useParams();
  return <DivisionDashboard divisionId={id} />;
}

export default DivisionDetailPage;