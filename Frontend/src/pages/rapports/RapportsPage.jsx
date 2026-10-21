import { useState } from 'react';
import {
  FileDown, FileSpreadsheet, Loader2, Calendar, TrendingUp, Mail,
  RotateCcw, AlertTriangle, Archive, Send, BarChart3, Filter, Stamp,
  UserCheck, ClipboardList, ShieldCheck,
} from 'lucide-react';
import { rapportService } from '../../services/rapportService.js';
import { downloadBlob } from '../../utils/fileHandler.js';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Select } from '../../components/ui/Select.jsx';
import { useNotification } from '../../hooks/useNotification.js';
import { AnimatedCard } from '../../components/ui/AnimatedCard.jsx';

/**
 * Rapports du service.
 *
 * Les dix rapports du cahier des charges §9, complétés par les rapports VISA
 * (période mensuelle, trimestrielle ou annuelle, et comptage par vérificateur).
 * Chaque bouton appelle réellement son endpoint : un bouton qui ne produit rien
 * est pire qu'une fonction absente, parce qu'il laisse croire que le rapport
 * existe.
 */
const RAPPORTS_CONFIG = [
  {
    id: 'journalierRecus',
    titre: 'Rapport journalier des dossiers reçus',
    description: 'Liste des dossiers reçus à la date choisie.',
    icone: Calendar,
    categorie: 'Secrétariat',
    filtres: ['date'],
  },
  {
    id: 'dossiersPeriode',
    titre: 'Dossiers enregistrés par période',
    description: 'Dossiers filtrés par plage de dates de réception.',
    icone: Calendar,
    categorie: 'Secrétariat',
    filtres: ['date_debut', 'date_fin'],
  },
  {
    id: 'attenteTransmission',
    titre: 'Dossiers en attente de transmission',
    description: 'Dossiers orientés en attente de bordereau de transmission.',
    icone: Send,
    categorie: 'Secrétariat',
    filtres: [],
  },
  {
    id: 'incomplets',
    titre: 'Dossiers incomplets',
    description: 'Dossiers ayant des pièces obligatoires non satisfaites.',
    icone: AlertTriangle,
    categorie: 'Suivi',
    filtres: [],
  },
  {
    id: 'retournes',
    titre: 'Dossiers retournés',
    description: 'Dossiers en correction demandée par une division.',
    icone: RotateCcw,
    categorie: 'Suivi',
    filtres: [],
  },
  {
    id: 'transmissionsDivision',
    titre: 'Transmissions par division',
    description: 'Bordereaux émis, groupés par division destinataire.',
    icone: TrendingUp,
    categorie: 'Suivi',
    filtres: ['date_debut', 'date_fin'],
  },
  {
    id: 'registreCourriers',
    titre: 'Registre des courriers',
    description: 'Courriers entrants et sortants, avec période et sens.',
    icone: Mail,
    categorie: 'Courriers',
    filtres: ['date_debut', 'date_fin', 'sens'],
  },
  {
    id: 'clotures',
    titre: 'Dossiers clôturés',
    description: 'Dossiers clôturés, avec période optionnelle.',
    icone: Archive,
    categorie: 'Suivi',
    filtres: ['date_debut', 'date_fin'],
  },
  {
    id: 'archives',
    titre: 'Dossiers archivés',
    description: 'Référence, emplacement et localisation numérique.',
    icone: Archive,
    categorie: 'Suivi',
    filtres: ['date_debut', 'date_fin'],
  },
  {
    id: 'statsTypePeriodeDivision',
    titre: 'Statistiques par type, période et division',
    description: 'Répartition des dossiers par type, par mois et par division.',
    icone: BarChart3,
    categorie: 'Statistiques',
    filtres: ['date_debut', 'date_fin'],
  },
  {
    id: 'visa',
    titre: 'Dossiers VISA — mensuel, trimestriel, annuel',
    description: 'Liste des dossiers VISA avec vérificateur, type d’acte, statut et signature.',
    icone: Stamp,
    categorie: 'VISA',
    filtres: ['periode_visa'],
  },
  {
    id: 'visaParVerificateur',
    titre: 'Dossiers VISA par vérificateur',
    description: 'Nombre de dossiers, signatures, archivages et délai moyen par vérificateur.',
    icone: UserCheck,
    categorie: 'VISA',
    filtres: ['periode_visa'],
  },
  {
    id: 'operationDivision',
    titre: 'Opérations d’une division',
    description: 'Dossier par dossier : opération, référence, montant saisi, validation et contrôle.',
    icone: ClipboardList,
    categorie: 'Divisions',
    filtres: ['periode_visa', 'division'],
  },
  {
    id: 'operationParType',
    titre: 'Opérations par type',
    description: 'Par opération : nombre de dossiers, montants saisis et validés, contrôles en attente.',
    icone: BarChart3,
    categorie: 'Divisions',
    filtres: ['periode_visa', 'division'],
  },
  {
    id: 'secours',
    titre: 'Suivi des dossiers Secours de décès',
    description: 'Visa du contrôle financier, mandatement, émargement, signature, cachet, archivage.',
    icone: ShieldCheck,
    categorie: 'Divisions',
    filtres: ['periode_visa'],
  },
];

const CATEGORIES = ['Secrétariat', 'Suivi', 'Courriers', 'Statistiques', 'VISA', 'Divisions'];

function BoutonExport({ format, onClick, loading }) {
  const Icône = format === 'pdf' ? FileDown : FileSpreadsheet;
  const label = format === 'pdf' ? 'PDF' : 'Excel';
  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      onClick={onClick}
      disabled={Boolean(loading)}
      className="flex-1"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icône className="h-4 w-4" />}
      {label}
    </Button>
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
    periode: 'annuel',
    annee: new Date().getFullYear(),
    mois: new Date().getMonth() + 1,
    trimestre: Math.ceil((new Date().getMonth() + 1) / 3),
    /* La division des rapports par division : vide = les trois divisions. */
    division: '',
  });

  const changer = (cle, valeur) => setFiltres((prev) => ({ ...prev, [cle]: valeur }));

  const handleGenerate = async (rapport, format) => {
    setLoading(`${rapport.id}-${format}`);
    setError(null);
    try {
      const service = rapportService[rapport.id];
      if (!service?.[format]) throw new Error('Type de rapport indisponible.');
      const blob = await service[format](filtres);
      downloadBlob(
        blob,
        `${rapport.titre.toLowerCase().replace(/\s+/g, '-')}-${new Date()
          .toISOString()
          .slice(0, 10)}.${format === 'pdf' ? 'pdf' : 'xlsx'}`
      );
      toastSuccess(`Rapport ${format.toUpperCase()} généré.`);
    } catch (e) {
      setError(e);
      toastError(e.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <AnimatedCard
      title="Rapports"
      subtitle="Exports PDF et Excel — le périmètre de l’utilisateur s’applique automatiquement."
      delay={0}
    >
      <div className="space-y-5">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Filter className="h-4 w-4" /> Filtres
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Input
              label="Date (journalier)"
              type="date"
              value={filtres.date}
              onChange={(e) => changer('date', e.target.value)}
            />
            <Input
              label="Du"
              type="date"
              value={filtres.date_debut}
              onChange={(e) => changer('date_debut', e.target.value)}
            />
            <Input
              label="Au"
              type="date"
              value={filtres.date_fin}
              onChange={(e) => changer('date_fin', e.target.value)}
            />
            <Select
              label="Sens des courriers"
              value={filtres.sens}
              onChange={(e) => changer('sens', e.target.value)}
              placeholder="Entrants et sortants"
            >
              <option value="ENTRANT">Entrants</option>
              <option value="SORTANT">Sortants</option>
            </Select>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Select
              label="Division"
              value={filtres.division}
              onChange={(e) => changer('division', e.target.value)}
            >
              <option value="">Solde, Pensions et Secours</option>
              <option value="SOLDE">Solde</option>
              <option value="PENSION">Pensions</option>
              <option value="SECOURS">Secours de décès</option>
            </Select>
            <Select
              label="Période"
              value={filtres.periode}
              onChange={(e) => changer('periode', e.target.value)}
            >
              <option value="mensuel">Mensuelle</option>
              <option value="trimestriel">Trimestrielle</option>
              <option value="annuel">Annuelle</option>
            </Select>
            <Input
              label="Année"
              type="number"
              min="2000"
              max="2100"
              value={filtres.annee}
              onChange={(e) => changer('annee', e.target.value)}
            />
            <Select
              label="Mois"
              value={filtres.mois}
              onChange={(e) => changer('mois', e.target.value)}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {new Date(2000, m - 1, 1).toLocaleDateString('fr-FR', { month: 'long' })}
                </option>
              ))}
            </Select>
            <Select
              label="Trimestre"
              value={filtres.trimestre}
              onChange={(e) => changer('trimestre', e.target.value)}
            >
              {[1, 2, 3, 4].map((t) => (
                <option key={t} value={t}>
                  T{t}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="flex items-center gap-2 text-sm text-red-700">
              <AlertTriangle className="h-4 w-4" /> {error.message}
            </p>
          </div>
        )}

        {CATEGORIES.map((categorie) => {
          const rapports = RAPPORTS_CONFIG.filter((r) => r.categorie === categorie);
          if (!rapports.length) return null;
          return (
            <section key={categorie} className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                {categorie}
              </h2>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {rapports.map((rapport) => {
                  const Icône = rapport.icone;
                  return (
                    <div
                      key={rapport.id}
                      className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                          <Icône className="h-5 w-5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base font-semibold text-slate-800">{rapport.titre}</h3>
                          <p className="mt-0.5 text-sm text-slate-500">{rapport.description}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        <BoutonExport
                          format="pdf"
                          loading={loading === `${rapport.id}-pdf`}
                          onClick={() => handleGenerate(rapport, 'pdf')}
                        />
                        <BoutonExport
                          format="xlsx"
                          loading={loading === `${rapport.id}-xlsx`}
                          onClick={() => handleGenerate(rapport, 'xlsx')}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </AnimatedCard>
  );
}

export default RapportsPage;
