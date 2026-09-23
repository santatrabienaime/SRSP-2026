import { useNavigate } from 'react-router-dom';
import { CourrierForm } from '../../components/courrier/CourrierForm.jsx';
import { Card } from '../../components/ui/Card.jsx';

export function CourrierCreatePage() {
  const navigate = useNavigate();
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Nouveau courrier</h1>
        <p className="text-sm text-slate-500">Enregistrement d'un courrier entrant ou sortant.</p>
      </div>
      <Card title="Courrier">
        <CourrierForm onSaved={(id) => navigate(`/courriers/${id}`)} />
      </Card>
    </div>
  );
}

export default CourrierCreatePage;