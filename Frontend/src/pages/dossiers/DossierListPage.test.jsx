import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

/**
 * La liste des dossiers du secrétariat — onglets par type de dossier.
 *
 * Le secrétariat instruit les quatre types : ses onglets sont les types
 * (Visa, Solde, Pension, Secours) et non l'avancement du traitement. Ce qui
 * est éprouvé ici :
 *
 *   - les quatre onglets sont là, avec le compteur du serveur ;
 *   - choisir un onglet filtre la liste sur ce type ;
 *   - les raccourcis (urgents, incomplets, brouillons) restent accessibles et
 *     se cumulent avec le type choisi ;
 *   - les autres profils gardent leurs onglets d'avancement.
 */

const mocks = vi.hoisted(() => ({
  summary: vi.fn(),
  list: vi.fn(),
  role: 'SECRETAIRE',
  permissions: [],
}));

vi.mock('../../services/dashboardService.js', () => ({
  dashboardService: { summary: mocks.summary },
  default: {},
}));

vi.mock('../../services/dossierService.js', () => ({
  dossierService: { list: mocks.list },
  default: {},
}));

vi.mock('../../services/divisionService.js', () => ({
  divisionService: { list: vi.fn().mockResolvedValue([]) },
  default: {},
}));

vi.mock('../../services/agentService.js', () => ({
  agentService: { list: vi.fn().mockResolvedValue([]) },
  default: {},
}));

vi.mock('../../hooks/useAuth.js', () => ({
  useAuth: () => ({
    user: { role_nom: mocks.role, type_code: null },
    hasPermission: (permission) => mocks.permissions.includes(permission),
  }),
}));

vi.mock('../../hooks/useTempsReel.js', () => ({
  useTempsReel: () => ({ abonner: () => () => {} }),
}));

import { DossierListPage } from './DossierListPage.jsx';

const RESUME = {
  total: 6,
  RECU: 1,
  ENREGISTRE: 0,
  ORIENTE: 0,
  AFFECTE: 4,
  EN_TRAITEMENT: 0,
  SOUMIS_A_VERIFICATION: 0,
  VALIDE: 0,
  SIGNE: 0,
  CLOTURE: 1,
  ARCHIVE: 1,
  prioritaires: 4,
  incomplets: 0,
  par_type: [
    { type_code: 'PENSION', type_libelle: 'Division Pension', total: 1 },
    { type_code: 'SECOURS', type_libelle: 'Division Secours', total: 2 },
    { type_code: 'SOLDE', type_libelle: 'Division Solde', total: 1 },
    { type_code: 'VISA', type_libelle: 'Division Visa', total: 2 },
  ],
};

const dossier = (id, numero) => ({
  id,
  numero,
  statut_code: 'AFFECTE',
  objet: `Dossier ${id}`,
  demandeur: 'Demandeur',
  date_reception: '2026-10-01',
  type_libelle: 'Division Visas',
  division_nom: 'Division Visas',
});

const rendre = () =>
  render(
    <MemoryRouter>
      <DossierListPage />
    </MemoryRouter>
  );

beforeEach(() => {
  mocks.role = 'SECRETAIRE';
  mocks.permissions = [];
  mocks.summary.mockReset();
  mocks.list.mockReset();
  mocks.summary.mockResolvedValue(RESUME);
  mocks.list.mockResolvedValue([dossier(1, 'VISA-2026-000001')]);
});

describe('Liste des dossiers — le secrétariat', () => {
  it('affiche un onglet par type de dossier, avec son compteur', async () => {
    rendre();

    await waitFor(() => expect(screen.getByRole('button', { name: 'Dossiers Visas' })).toBeTruthy());

    expect(screen.getByRole('button', { name: 'Dossiers Visas' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Dossiers Soldes' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Dossiers Pensions' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Dossiers Secours' })).toBeTruthy();

    // Les compteurs viennent du serveur.
    expect(screen.getByRole('button', { name: 'Dossiers Visas' }).textContent).toContain('2');
    expect(screen.getByRole('button', { name: 'Dossiers Secours' }).textContent).toContain('2');
  });

  it('ne propose pas les onglets d’avancement au secrétariat', async () => {
    rendre();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Dossiers Visas' })).toBeTruthy());

    expect(screen.queryByText('En cours')).toBeNull();
    expect(screen.queryByText('Terminés')).toBeNull();
  });

  it('filtre la liste sur le type choisi', async () => {
    rendre();
    await waitFor(() => expect(mocks.list).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: 'Dossiers Secours' }));

    await waitFor(() => {
      const dernier = mocks.list.mock.calls[mocks.list.mock.calls.length - 1][0];
      expect(dernier.type).toBe('SECOURS');
    });
  });

  it('cumule le raccourci « Urgents » avec l’onglet de type', async () => {
    rendre();
    await waitFor(() => expect(mocks.list).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: 'Dossiers Soldes' }));
    await waitFor(() => {
      const dernier = mocks.list.mock.calls[mocks.list.mock.calls.length - 1][0];
      expect(dernier.type).toBe('SOLDE');
    });

    fireEvent.click(screen.getByRole('button', { name: /Urgents/ }));
    await waitFor(() => {
      const dernier = mocks.list.mock.calls[mocks.list.mock.calls.length - 1][0];
      expect(dernier.type).toBe('SOLDE');
      expect(dernier.priorite_haute).toBe(1);
    });
  });

  it('laisse les autres profils avec leurs onglets d’avancement', async () => {
    mocks.role = 'CHEF_SERVICE';
    rendre();

    await waitFor(() => expect(screen.getByText('Nouveaux')).toBeTruthy());

    expect(screen.getByText('En cours')).toBeTruthy();
    expect(screen.queryByText('Visas')).toBeNull();
  });
});
