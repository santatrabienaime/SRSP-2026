import { useState } from 'react';
import {
  FolderKanban, FileText, Mail, Building2, Layers, SlidersHorizontal,
} from 'lucide-react';
import { TypesDossiersPage } from './TypesDossiersPage.jsx';
import { SousTypesPage } from './SousTypesPage.jsx';
import { SchemasOperationsPage } from './SchemasOperationsPage.jsx';
import { TypesPiecesPage } from './TypesPiecesPage.jsx';
import { TypesCourriersPage } from './TypesCourriersPage.jsx';
import { DivisionListPage } from '../divisions/DivisionListPage.jsx';

/**
 * Écran « Référentiel » : regroupe sous forme d'onglets les tables de
 * référence réellement modifiables par l'administrateur. Chaque onglet rend la
 * page en charge de la table — elle porte son titre, sa liste et ses actions.
 *
 * Le **bilan de conformité** n'est pas dans cet écran : ce n'est pas une
 * table de référence, c'est la lecture du registre des exigences du cahier,
 * et elle concerne le chef BAAF autant que l'administrateur. Elle a donc son
 * propre entrée dans le menu.
 */
const ONGLETS = [
  { cle: 'types-dossiers', label: 'Types de dossiers', Icone: FolderKanban, Page: TypesDossiersPage },
  { cle: 'sous-types', label: "Types d'acte", Icone: Layers, Page: SousTypesPage },
  { cle: 'schemas-operations', label: "Schémas d'opérations", Icone: SlidersHorizontal, Page: SchemasOperationsPage },
  { cle: 'types-pieces', label: 'Types de pièces', Icone: FileText, Page: TypesPiecesPage },
  { cle: 'types-courriers', label: 'Types de courriers', Icone: Mail, Page: TypesCourriersPage },
  { cle: 'divisions', label: 'Divisions', Icone: Building2, Page: DivisionListPage },
];

export function ReferentielPage() {
  const [onglet, setOnglet] = useState(ONGLETS[0].cle);
  const actif = ONGLETS.find((o) => o.cle === onglet) ?? ONGLETS[0];
  const Page = actif.Page;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {ONGLETS.map(({ cle, label, Icone }) => (
          <button
            key={cle}
            type="button"
            onClick={() => setOnglet(cle)}
            aria-pressed={onglet === cle}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
              onglet === cle
                ? 'border-primary-600 bg-primary-50 text-primary-700'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Icone className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      <Page />
    </div>
  );
}

export default ReferentielPage;
