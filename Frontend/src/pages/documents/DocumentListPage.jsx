import { DocumentList } from '../../components/document/DocumentList.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { AnimatedCard } from '../../components/ui/AnimatedCard.jsx';

/** Liste globale des documents (tous dossiers, tous courriers). */
export function DocumentListPage() {
  return (
    <AnimatedCard title="Documents" subtitle="Pièces jointes uploadées sur les dossiers et les courriers." delay={0}>
      <Card>
        <DocumentList />
      </Card>
    </AnimatedCard>
  );
}

export default DocumentListPage;