import { useState } from 'react';
import { FolderKanban, FileText, Building2 } from 'lucide-react';
import { AnimatedCard } from '../../components/ui/AnimatedCard.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';

export function ReferentielPage() {
  const [onglet, setOnglet] = useState('types-dossiers');

  const onglets = [
    { cle: 'types-dossiers', label: 'Types de dossiers', icon: 'FolderKanban' },
    { cle: 'types-pieces', label: 'Types de pièces', icon: 'FileText' },
    { cle: 'divisions', label: 'Divisions', icon: 'Building2' },
  ];

  return (
    <AnimatedCard title="Référentiel" subtitle="Gestion des référentiels du SRSP." delay={0}>
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          {onglets.map((o) => (
            <Button
              key={o.cle}
              onClick={() => setOnglet(o.cle)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                onglet === o.cle
                  ? 'border-primary-600 bg-primary-50 text-primary-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {o.icon === 'FolderKanban' && <FolderKanban className="h-4 w-4" />}
              {o.icon === 'FileText' && <FileText className="h-4 w-4" />}
              {o.icon === 'Building2' && <Building2 className="h-4 w-4" />}
              {o.label}
            </Button>
          ))}
        </div>

        {onglet === 'types-dossiers' && (
          <div>
            <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-3">Types de dossiers</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Gérez les types de dossiers du référentiel (Visa, Solde, Pension, Secours, etc.).
            </p>
          </div>
        )}

        {onglet === 'types-pieces' && (
          <div>
            <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-3">Types de pièces</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Gérez les types de pièces justificatives (CIN, acte de naissance, etc.).
            </p>
          </div>
        )}

        {onglet === 'divisions' && (
          <div>
            <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-3">Divisions</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Gérez les divisions du SRSP (Solde, Pension, Visa, Secours).
            </p>
          </div>
        )}
      </div>
    </AnimatedCard>
  );
}

export default ReferentielPage;