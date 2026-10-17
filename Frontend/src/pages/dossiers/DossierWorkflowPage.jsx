import { useParams } from 'react-router-dom';
import { DossierDetail } from '../../components/dossier/DossierDetail.jsx';
import { AnimatedCard } from '../../components/ui/AnimatedCard.jsx';

/**
 * Vue dédiée au workflow d'un dossier (statut, actions, historique).
 * Réutilise le détail complet avec sa timeline et ses actions.
 */
export function DossierWorkflowPage() {
  const { id } = useParams();
  return (
    <AnimatedCard title="Workflow du dossier" subtitle="Suivi pas à pas : orientation, affectation, traitement, vérification, validation, signature." delay={0}>
      <DossierDetail id={id} />
    </AnimatedCard>
  );
}

export default DossierWorkflowPage;