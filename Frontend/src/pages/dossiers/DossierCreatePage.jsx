import { useNavigate } from 'react-router-dom';
import { DossierForm } from '../../components/dossier/DossierForm.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { AnimatedCard } from '../../components/ui/AnimatedCard.jsx';

export function DossierCreatePage() {
  const navigate = useNavigate();
  return (
    <AnimatedCard title="Nouveau dossier" subtitle="Réception et enregistrement d'un nouveau dossier" delay={0}>
      <Card title="Informations du dossier">
        <DossierForm onSaved={(id) => navigate(`/dossiers/${id}`)} />
      </Card>
    </AnimatedCard>
  );
}

export default DossierCreatePage;