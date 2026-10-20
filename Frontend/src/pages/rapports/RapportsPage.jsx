import { useState, useMemo } from 'react';
import {
  FileDown, FileSpreadsheet, Loader2, Calendar, FileText, TrendingUp,
  Mail, RotateCcw, AlertTriangle, Archive, Send, BarChart3,
} from 'lucide-react';
import { rapportService } from '../../services/rapportService.js';
import { downloadBlob } from '../../utils/fileHandler.js';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Select } from '../../components/ui/Select.jsx';
import { useNotification } from '../../hooks/useNotification.js';
import { AnimatedCard } from '../../components/ui/AnimatedCard.jsx';
import { formatDateString } from '../../utils/formatDate.js';

/**
 * Configuration des 10 rapports Secrétaire selon le cahier des charges §9.
 */
const RAPPORTS_CONFIG = [
  {
    id: 'journalierRecus',
    titre: 'Rapport journalier des dossiers reçus',
    description: 'Liste des dossiers reçus à la date du jour (statut REÇU).',
    icone: Calendar,
    filtres: ['date'],
    pdfKey: 'journalierRecus',
    excelKey: 'journalierRecus',
  },
  {
    id: 'dossiersPeriode',
    titre: 'Liste des dossiers enregistrés par période',
    description: 'Filtrer les dossiers par plage de dates de réception.',
    icone: Calendar,
    filtres: ['date_debut', 'date_fin'],
    pdfKey: 'dossiersPeriode',
    excelKey: 'dossiersPeriode',
  },
  {
    id: 'attenteTransmission',
    titre: 'Liste des dossiers en attente de transmission',
    description: 'Dossiers orientés (statut ORIENTÉ) en attente de bordereau de transmission.',
    icone: Send,
    filtres: [],
    pdfKey: 'attenteTransmission',
    excelKey: 'attenteTransmission',
  },
  {
    id: 'incomplets',
    titre: 'Liste des dossiers incomplets',
    description: 'Dossiers ayant des pièces obligatoires manquantes au dépouillement.',
    icone: AlertTriangle,
    filtres: [],
    pdfKey: 'incomplets',
    excelKey: 'incomplets',
  },
  {
    id: 'retournes',
    titre: 'Liste des dossiers retournés',
    description: 'Dossiers en statut CORRECTION_DEMANDEE (retournés par les divisions).',
    icone: RotateCcw,
    filtres: [],
    pdfKey: 'retournes',
    excelKey: 'retournes',
  },
  {
    id: 'transmissionsDivision',
    titre: 'Rapport des transmissions par division',
    description: 'Bordereaux émis, groupés par division destinataire.',
    icone: TrendingUp,
    filtres: ['date_debut', 'date_fin'],
    pdfKey: 'transmissionsDivision',
    excelKey: 'transmissionsDivision',
  },
  {
    id: 'registreCourriers',
    titre: 'Registre des courriers entrants et sortants',
    description: 'Tous les courriers avec filtres par période et sens.',
    icone: Mail,
    filtres: ['date_debut', 'date_fin', 'sens'],
    pdfKey: 'registreCourriers',
    excelKey: 'registreCourriers',
  },
  {
    id: 'clotures',
    titre: 'Liste des dossiers clôturés',
    description: 'Dossiers en statut CLÔTURÉ, avec filtre optionnel par période.',
    icone: Archive,
    filtres: ['date_debut', 'date_fin'],
    pdfKey: 'clotures',
    excelKey: 'clotures',
  },
  {
    id: 'archives',
    titre: 'Liste des dossiers archivés',
    description: 'Dossiers archivés avec référence, emplacement et localisation numérique.',
    icone: Archive,
    filtres: ['date_debut', 'date_fin'],
    pdfKey: 'archives',
    excelKey: 'archives',
  },
  {
    id: 'statsTypePeriodeDivision',
    titre: 'Statistiques par type, période et division',
    description: 'Répartition des dossiers par type, par mois et par division.',
    icone: BarChart3,
    filtres: ['date_debut', 'date_fin'],
    pdfKey: 'statsTypePeriodeDivision',
    excelKey: 'statsTypePeriodeDivision',
  },
];

/**
 * Carte de rapport individuelle.
 */
function RapportCard({ rapport, onGenerate, loading }) {
  const isLoading = loading === rapport.id;

  return (
    <div className="p-5 space-y-4 border border-slate-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
          <rapport.icone className="h-5 w-5" />
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-slate-800">{rapport.titre}</h3>
          <p className="text-sm text-slate-500 mt-0.5">{rapport.description}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        <button
          onClick={() => {/* PDF */}}
          disabled={false}
          className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors"
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span>PDF</span>
          </span>
        </button>
        <button
          className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors"
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>Excel</span>
          </span>
        </button>
      </div>
    </div>
  );
}

export function RapportsPage() {
  const { toastSuccess, toastError } = useNotification();
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);
  const [filtres, setFiltres] = useState({
    date: new Date().toISOString().slice(0, 10),
    date_debut: '',
    date_fin: '',
    sens: '',
  });

  const handleGenerate = async (type, rapportId) => {
    const rapport = RAPPORTS_CONFIG.find((r) => r.id === rapportId);
    if (!rapport) return;

    const isPdf = type === 'pdf';
    setLoading(rapport.id);
    setError(null);

    try {
      const method = type === 'pdf' ? 'pdf' : 'excel';
      const serviceMethod = rapportService[rapport.id][method];
      if (!serviceMethod) throw new Error('Méthode non trouvée');

      const filtres = { ...filtres };
      const blob = await serviceMethod(filtres);

      downloadBlob(
        blob,
        `${rapport.titre.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.${type === 'pdf' ? 'pdf' : 'xlsx'}`
      );
      toastSuccess(`Rapport ${type.toUpperCase()} généré.`);
    } catch (e) {
      setError(e);
      toastError(e.message);
    } finally {
      setLoading(null);
    }
  };

  const handleFiltreChange = (key, value) => {
    setFiltres((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <AnimatedCard title="Rapports Secrétaire" subtitle="Les 10 rapports du cahier des charges §9 — PDF et Excel." delay={0}>
      <div className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {RAPPORTS_CONFIG.map((rapport) => (
            <div
              key={rapport.id}
              className="p-5 space-y-4 border border-slate-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                  <rapport.icone className="h-5 w-5" />
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-slate-800">{rapport.titre}</h3>
                  <p className="text-sm text-slate-500 mt-0.5">{rapport.description}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  onClick={() => generer('pdf', rapport.id)}
                  disabled={false}
                  className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span>PDF</span>
                  </span>
                </button>
                <button
                  className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Excel</span>
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="flex items-center gap-2 text-sm text-red-700">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error.message}
            </p>
          </div>
        )}
      </div>
    </AnimatedCard>
  );
}

export default RapportsPage;