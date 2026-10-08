import { useParams } from 'react-router-dom';
import { DossierList } from '../dossier/DossierList.jsx';
import { Card } from '../ui/Card.jsx';
import { Spinner } from '../ui/Spinner.jsx';
import { useState, useEffect } from 'react';
import { divisionService } from '../../services/divisionService.js';

/** Tableau de bord d'une division : progression de ses dossiers. */
export function DivisionDashboard({ divisionId }) {
  const { id } = useParams();
  const effectiveId = divisionId || id;
  const [division, setDivision] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!effectiveId) {
      Promise.resolve().then(() => setLoading(false));
      return;
    }
    /* Fiche ciblée plutôt que liste complète filtrée : moins de données
       transportees, et pas de dépendance à la taille de la liste. */
    divisionService
      .get(effectiveId)
      .then((row) => setDivision(row || null))
      .finally(() => setLoading(false));
  }, [effectiveId]);

  if (loading) return <Spinner label="Chargement de la division…" />;
  if (!division) return <p className="text-sm text-slate-500">Division introuvable.</p>;

  return (
    <div className="space-y-5">
      <Card title={division.nom} subtitle={`Code : ${division.code}`} />
      <Card title="Dossiers de la division">
        <DossierList baseFilters={{ division_id: effectiveId }} showCreate={false} />
      </Card>
    </div>
  );
}

export default DivisionDashboard;