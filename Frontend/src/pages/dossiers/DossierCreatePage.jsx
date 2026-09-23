import { useNavigate } from 'react-router-dom';
import { DossierForm } from '../../components/dossier/DossierForm.jsx';
import { Card } from '../../components/ui/Card.jsx';

export function DossierCreatePage() {
  const navigate = useNavigate();
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Nouveau dossier</h1>
        <p className="text-sm text-slate-500">
          Réception et enregistrement d'un nouveau dossier.
        </p>
      </div>
      <Card title="Informations du dossier">
        <DossierForm onSaved={(id) => navigate(`/dossiers/${id}`)} />
      </Card>
    </div>
  );
}

export default DossierCreatePage;