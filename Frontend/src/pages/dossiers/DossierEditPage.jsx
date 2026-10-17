import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { dossierService } from '../../services/dossierService.js';
import { DossierForm } from '../../components/dossier/DossierForm.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { AnimatedCard } from '../../components/ui/AnimatedCard.jsx';

export function DossierEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dossier, setDossier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    dossierService
      .get(id)
      .then(setDossier)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner label="Chargement du dossier…" />;
  if (error) return <Alert type="error">{error.message}</Alert>;
  if (!dossier) return <Alert type="warning">Dossier introuvable.</Alert>;

  return (
    <AnimatedCard title={`Modifier ${dossier.numero}`} subtitle="Mise à jour des informations du dossier (sauf si clôturé ou archivé)." delay={0}>
      <Card title="Informations">
        <DossierForm
          initial={dossier}
          onSaved={() => navigate(`/dossiers/${id}`)}
        />
      </Card>
    </AnimatedCard>
  );
}

export default DossierEditPage;