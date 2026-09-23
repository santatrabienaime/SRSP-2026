import { useParams } from 'react-router-dom';
import { DossierDetail } from '../../components/dossier/DossierDetail.jsx';

/**
 * Vue dédiée au workflow d'un dossier (statut, actions, historique).
 * Réutilise le détail complet avec sa timeline et ses actions.
 */
export function DossierWorkflowPage() {
  const { id } = useParams();
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Workflow du dossier</h1>
        <p className="text-sm text-slate-500">
          Suivi pas à pas : orientation, affectation, traitement, vérification, validation, signature.
        </p>
      </div>
      <DossierDetail id={id} />
    </div>
  );
}

export default DossierWorkflowPage;