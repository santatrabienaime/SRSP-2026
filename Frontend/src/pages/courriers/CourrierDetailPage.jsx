import { useParams } from 'react-router-dom';
import { CourrierDetail } from '../../components/courrier/CourrierDetail.jsx';

export function CourrierDetailPage() {
  const { id } = useParams();
  return <CourrierDetail id={id} />;
}

export default CourrierDetailPage;