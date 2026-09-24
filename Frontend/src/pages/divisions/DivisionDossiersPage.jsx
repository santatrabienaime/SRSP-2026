import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FolderKanban, Loader2 } from 'lucide-react';
import { divisionService } from '../../services/divisionService.js';
import { DossierList } from '../../components/dossier/DossierList.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { useAuth } from '../../hooks/useAuth.js';

/**
 * Dossiers d'une division (écran du chef de division, ex. /divisions/VISAS).
 *
 * La liste ne contient QUE les dossiers du type de la division : on évite
 * d'exposer à un chef de division les dossiers des autres services.
 * Un agent reste restreint à ses propres dossiers côté serveur.
 */
export function DivisionDossiersPage() {
  const { code } = useParams();
  const { user } = useAuth();
  const [division, setDivision] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await divisionService.list();
      const trouve = (list || []).find(
        (d) => String(d.code).toUpperCase() === String(code).toUpperCase()
      );
      if (!trouve) throw new Error(`Division inconnue : ${code}`);
      setDivision(trouve);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [code]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner label="Chargement de la division…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Link to="/dossiers" className="inline-flex items-center gap-1 text-sm text-primary-600 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Retour aux dossiers
        </Link>
        <Alert type="error" title="Division indisponible">{error.message}</Alert>
      </div>
    );
  }

  // Le type de dossier est celui rattaché à la division (donnée, pas une
  // correspondance écrite en dur dans le code).
  const typeCode = division.type_dossier_code || division.type_code;
  const titre = division.nom || division.code;

  return (
    <div className="space-y-5">
      <div>
        <Link
          to="/dossiers"
          className="mb-2 inline-flex items-center gap-1 text-sm text-primary-600 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Tous les dossiers
        </Link>
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
            <FolderKanban className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-slate-800">{titre}</h1>
            <p className="text-sm text-slate-500">
              {user?.division_code === division.code
                ? 'Dossiers de votre division'
                : 'Dossiers du type traité par cette division'}
              {typeCode ? ` (${typeCode})` : ''}
            </p>
          </div>
        </div>
      </div>

      {/* La liste est verrouillée sur le type de la division. */}
      <DossierList
        key={division.id}
        baseFilters={{ type: typeCode }}
        showCreate={false}
      />
    </div>
  );
}

export default DivisionDossiersPage;
