import { useState } from 'react';
import { FileDown, FileSpreadsheet, Loader2 } from 'lucide-react';
import { rapportService } from '../../services/rapportService.js';
import { downloadBlob } from '../../utils/fileHandler.js';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { useNotification } from '../../hooks/useNotification.js';

export function RapportsPage() {
  const { toastSuccess, toastError } = useNotification();
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

  const handlePDF = async () => {
    setLoading('pdf');
    setError(null);
    try {
      const blob = await rapportService.pdf({});
      downloadBlob(blob, `rapport-dossiers-${new Date().toISOString().slice(0, 10)}.pdf`);
      toastSuccess('Rapport PDF généré.');
    } catch (e) {
      setError(e);
      toastError(e.message);
    } finally {
      setLoading(null);
    }
  };

  const handleExcel = async () => {
    setLoading('excel');
    setError(null);
    try {
      const blob = await rapportService.excel();
      downloadBlob(blob, `rapport-dossiers-${new Date().toISOString().slice(0, 10)}.xlsx`);
      toastSuccess('Rapport Excel généré.');
    } catch (e) {
      setError(e);
      toastError(e.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Rapports</h1>
        <p className="text-sm text-slate-500">
          Génération de rapports d'activité sur l'ensemble des dossiers.
        </p>
      </div>

      {error && <Alert type="error">{error.message}</Alert>}

      <div className="grid gap-5 md:grid-cols-2">
        <Card title="Rapport PDF" subtitle="Récapitulatif des dossiers (100 derniers)">
          <p className="mb-4 text-sm text-slate-600">
            Génère un rapport PDF avec la liste des dossiers, leur statut et leur division.
          </p>
          <Button onClick={handlePDF} loading={loading === 'pdf'}>
            {loading === 'pdf' ? <Loader2 className="h-4 w-4" /> : <FileDown className="h-4 w-4" />}
            Télécharger le PDF
          </Button>
        </Card>

        <Card title="Rapport Excel" subtitle="Export complet des dossiers">
          <p className="mb-4 text-sm text-slate-600">
            Export de l'ensemble des dossiers au format Excel pour analyse et archivage.
          </p>
          <Button variant="success" onClick={handleExcel} loading={loading === 'excel'}>
            {loading === 'excel' ? <Loader2 className="h-4 w-4" /> : <FileSpreadsheet className="h-4 w-4" />}
            Télécharger l'Excel
          </Button>
        </Card>
      </div>
    </div>
  );
}

export default RapportsPage;