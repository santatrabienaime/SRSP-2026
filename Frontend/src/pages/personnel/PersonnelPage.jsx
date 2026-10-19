import { PersonnelList } from '../../components/personnel/PersonnelList.jsx';
import { AnimatedCard } from '../../components/ui/AnimatedCard.jsx';

/**
 * Personnel : la fiche d'une personne et son compte de connexion, sur un seul
 * écran.
 *
 * Remplace les écrans « Agents » et « Utilisateurs », qui décrivaient les mêmes
 * personnes séparément et laissaient créer un compte sans fiche, ou deux fiches
 * pour un même compte.
 */
export function PersonnelPage() {
  return (
    <AnimatedCard
      title="Personnel"
      subtitle="Fiches du personnel et comptes de connexion, réunis."
      delay={0}
    >
      <PersonnelList />
    </AnimatedCard>
  );
}

export default PersonnelPage;
