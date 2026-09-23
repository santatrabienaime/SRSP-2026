import { useParams } from 'react-router-dom';
import { DossierDetail } from '../../components/dossier/DossierDetail.jsx';

export function DossierDetailPage() {
  const { id } = useParams();
  return <DossierDetail id={id} />;
}

export default DossierDetailPage;