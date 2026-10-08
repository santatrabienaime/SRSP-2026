import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

/* Reproduction du signalement : division Solde → fiche dossier → clic sur
   l'onglet « Calculs » → écran blanc (= exception React au rendu, l'app n'a
   pas d'ErrorBoundary).

   Cause racine : decomptes_avance.stocke en bigint → mysql2 renvoie des
   NOMBRES, et AmountInput appelait control.value.replace(...) dessus au
   moment où la donnée chargée synchronisait l'état du hook. Le socle
   useInputControl normalise désormais en chaîne — le cas « données bigint »
   ci-dessous est la non-régression. */

vi.mock('../../services/dossierService.js', () => ({
  dossierService: {
    get: vi.fn(),
    getTracabilite: vi.fn().mockResolvedValue([]),
    getDecompteAvance: vi.fn().mockResolvedValue(null),
    saveDecompteAvance: vi.fn().mockResolvedValue({}),
    getControleDecompte: vi.fn().mockResolvedValue([]),
    saveControleDecompte: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock('../../services/historiqueService.js', () => ({
  historiqueService: {
    list: vi.fn().mockResolvedValue({ actions: [] }),
  },
}));

vi.mock('../../services/divisionService.js', () => ({
  divisionService: { list: vi.fn().mockResolvedValue([]) },
}));

vi.mock('../../services/agentService.js', () => ({
  agentService: { list: vi.fn().mockResolvedValue([]) },
}));

vi.mock('../../hooks/useAuth.js', () => ({
  useAuth: () => ({
    user: { id: 1, nom: 'TEST', role_nom: 'CHEF_DIVISION_SOLDE' },
    hasPermission: () => true,
    hasAnyPermission: () => true,
  }),
}));

vi.mock('../../hooks/useNotification.js', () => ({
  useNotification: () => ({
    toast: { toastSuccess: vi.fn(), toastError: vi.fn() },
    toastSuccess: vi.fn(),
    toastError: vi.fn(),
    push: vi.fn(),
  }),
}));

import { dossierService } from '../../services/dossierService.js';
import { DossierDetail } from './DossierDetail.jsx';

const SOLDE = {
  id: 1,
  numero: 'SOL-2025-TEST',
  objet: 'Avance sur solde',
  type_code: 'SOLDE',
  type_libelle: 'Solde',
  statut_code: 'EN_TRAITEMENT',
  priorite_libelle: 'Moyenne',
  demandeur: 'Rakoto Jean',
  matricule: 'M001',
  division_nom: 'Division Solde',
  date_reception: '2025-09-01',
  observation: null,
  agent_nom: null,
  agent_prenom: null,
  date_cloture: null,
  date_archivage: null,
};

/* Forme exacte de la base : bigint → nombres. */
const DECOMPTE_EXISTANT = {
  id: 9,
  dossier_id: 1,
  salaire_mensuel: 1500000,
  indice: 450,
  echelon: 12,
  avance_demandee: 300000,
  retenue_mensuelle: 50000,
  duree_mois: 6,
  mois_rembourses: 2,
  observation: 'Avance sur solde',
  net_a_payer: 1450000,
  reste_a_rembourser: 200000,
  date_calcul: '2025-09-15T10:00:00',
};

async function ouvrirOngletCalculs() {
  const tab = await screen.findByRole('tab', { name: /Calculs/i });
  fireEvent.click(tab);
}

describe('Onglet Calculs — dossier SOLDE (division Solde)', () => {
  it("ouvre l'onglet Calculs sans exception au rendu (aucun décompte)", async () => {
    dossierService.get.mockResolvedValue(SOLDE);
    dossierService.getDecompteAvance.mockResolvedValue(null);
    dossierService.getControleDecompte.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <DossierDetail id={1} />
      </MemoryRouter>
    );

    await ouvrirOngletCalculs();

    await waitFor(() => {
      expect(screen.getByText(/Décompte d'avance/i)).toBeTruthy();
    });
    expect(screen.getByText(/Contrôle du décompte/i)).toBeTruthy();
  });

  it('NON-RÉGRESSION : charge un décompte bigint sans crash (écran blanc)', async () => {
    dossierService.get.mockResolvedValue(SOLDE);
    dossierService.getDecompteAvance.mockResolvedValue(DECOMPTE_EXISTANT);
    dossierService.getControleDecompte.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <DossierDetail id={1} />
      </MemoryRouter>
    );

    await ouvrirOngletCalculs();

    // Avant correctif : TypeError « control.value.replace is not a function »
    // une fois la réponse API synchronisée — le rendu entier tombait.
    await waitFor(() => {
      expect(screen.getByDisplayValue('1500000')).toBeTruthy();
    });
    expect(screen.getByDisplayValue('450')).toBeTruthy();
    // Le total calculé reste affichable : 1 500 000 − 50 000
    expect(screen.getByText('1 450 000 Ar')).toBeTruthy();
  });

  it('affiche une erreur gérée quand l\u2019API contrôle échoue (403)', async () => {
    dossierService.get.mockResolvedValue(SOLDE);
    dossierService.getDecompteAvance.mockResolvedValue(null);
    dossierService.getControleDecompte.mockRejectedValue(
      new Error('Accès refusé')
    );

    render(
      <MemoryRouter>
        <DossierDetail id={1} />
      </MemoryRouter>
    );

    await ouvrirOngletCalculs();

    await waitFor(() => {
      expect(screen.getByText(/Contrôle refusé/i)).toBeTruthy();
    });
    expect(screen.getByText(/Accès refusé/i)).toBeTruthy();
  });
});
