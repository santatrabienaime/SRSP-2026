import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

/**
 * Triage de la liste des dossiers — tri et regroupement par statut.
 *
 * Ce qui est éprouvé ici :
 *
 *   - le regroupement découpe la liste en sections, une par statut du
 *     circuit, avec l'effectif de chacune ;
 *   - un statut absent ne crée pas de section vide ;
 *   - une section trop longue est repliée, et se déploie à la demande ;
 *   - le tri choisi est bien transmis au serveur.
 */

const mocks = vi.hoisted(() => ({
  list: vi.fn(),
  permissions: [],
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

vi.mock('../../services/referentielService.js', () => ({
  referentielService: {
    get: vi.fn().mockResolvedValue({
      priorites: [
        { id: 1, libelle: 'URGENTE', niveau: 4 },
        { id: 2, libelle: 'HAUTE', niveau: 3 },
        { id: 3, libelle: 'NORMALE', niveau: 2 },
        { id: 4, libelle: 'BASSE', niveau: 1 },
      ],
    }),
  },
  default: {},
}));

vi.mock('../../hooks/useAuth.js', () => ({
  useAuth: () => ({
    hasPermission: (permission) => mocks.permissions.includes(permission),
  }),
}));

vi.mock('../../hooks/useTempsReel.js', () => ({
  useTempsReel: () => ({ abonner: () => () => {} }),
}));

import { DossierList } from './DossierList.jsx';

/** Un dossier minimal, suffisant pour la liste. */
const dossier = (
  id,
  statut_code,
  numero,
  priorite = { libelle: 'NORMALE', niveau: 2 }
) => ({
  id,
  numero,
  statut_code,
  objet: `Dossier ${id}`,
  demandeur: 'Demandeur',
  date_reception: '2026-10-01',
  type_libelle: 'Visa',
  division_nom: 'Division Visas',
  priorite_libelle: priorite.libelle,
  priorite_niveau: priorite.niveau,
});

const rendre = () =>
  render(
    <MemoryRouter>
      <DossierList baseFilters={{}} />
    </MemoryRouter>
  );

beforeEach(() => {
  mocks.permissions = [];
  mocks.list.mockReset();
  mocks.list.mockResolvedValue([]);
});

describe('Liste des dossiers — regroupement par statut', () => {
  it('affiche une section par statut, avec son effectif', async () => {
    mocks.list.mockResolvedValue([
      dossier(1, 'RECU', 'VISA-2026-000001'),
      dossier(2, 'RECU', 'VISA-2026-000002'),
      dossier(3, 'VALIDE', 'VISA-2026-000003'),
    ]);

    rendre();

    await waitFor(() => expect(screen.getByText('VISA-2026-000001')).toBeTruthy());

    fireEvent.click(screen.getByRole('button', { name: /Grouper par statut/i }));

    expect(screen.getByLabelText('Dossiers Reçu')).toBeTruthy();
    expect(screen.getByLabelText('Dossiers Validé')).toBeTruthy();
    expect(screen.getByText('2 dossiers')).toBeTruthy();
    expect(screen.getByText('1 dossier')).toBeTruthy();
  });

  it('n’ouvre aucune section pour un statut absent', async () => {
    mocks.list.mockResolvedValue([dossier(1, 'RECU', 'VISA-2026-000001')]);

    rendre();
    await waitFor(() => expect(screen.getByText('VISA-2026-000001')).toBeTruthy());

    fireEvent.click(screen.getByRole('button', { name: /Grouper par statut/i }));

    expect(screen.getByLabelText('Dossiers Reçu')).toBeTruthy();
    expect(screen.queryByLabelText('Dossiers Archivé')).toBeNull();
  });

  it('replie une section trop longue et la déploie à la demande', async () => {
    const nombreux = Array.from({ length: 12 }, (_, i) =>
      dossier(i + 1, 'RECU', `VISA-2026-${String(i + 1).padStart(6, '0')}`)
    );
    mocks.list.mockResolvedValue([...nombreux, dossier(99, 'VALIDE', 'VISA-2026-000099')]);

    rendre();
    await waitFor(() => expect(screen.getByText('VISA-2026-000001')).toBeTruthy());

    fireEvent.click(screen.getByRole('button', { name: /Grouper par statut/i }));

    // Dix dossiers sont montrés, le onzième attend.
    expect(screen.getByText('VISA-2026-000010')).toBeTruthy();
    expect(screen.queryByText('VISA-2026-000011')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /Afficher les 2 autres dossiers/i }));

    expect(screen.getByText('VISA-2026-000011')).toBeTruthy();
    expect(screen.getByText('VISA-2026-000012')).toBeTruthy();
  });

  it('repartit la liste plate quand le regroupement est désactivé', async () => {
    mocks.list.mockResolvedValue([
      dossier(1, 'RECU', 'VISA-2026-000001'),
      dossier(2, 'VALIDE', 'VISA-2026-000002'),
    ]);

    rendre();
    await waitFor(() => expect(screen.getByText('VISA-2026-000001')).toBeTruthy());

    fireEvent.click(screen.getByRole('button', { name: /Grouper par statut/i }));
    expect(screen.getByLabelText('Dossiers Reçu')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /Grouper par statut/i }));
    expect(screen.queryByLabelText('Dossiers Reçu')).toBeNull();
  });
});

describe('Liste des dossiers — regroupement par niveau', () => {
  it('affiche une section par niveau, du plus urgent au moins urgent', async () => {
    mocks.list.mockResolvedValue([
      dossier(1, 'RECU', 'VISA-2026-000001', { libelle: 'NORMALE', niveau: 2 }),
      dossier(2, 'RECU', 'VISA-2026-000002', { libelle: 'URGENTE', niveau: 4 }),
      dossier(3, 'RECU', 'VISA-2026-000003', { libelle: 'URGENTE', niveau: 4 }),
    ]);

    rendre();
    await waitFor(() => expect(screen.getByText('VISA-2026-000001')).toBeTruthy());

    fireEvent.click(screen.getByRole('button', { name: /Grouper par niveau/i }));

    const urgente = screen.getByLabelText('Dossiers URGENTE');
    const normale = screen.getByLabelText('Dossiers NORMALE');
    expect(urgente).toBeTruthy();
    expect(normale).toBeTruthy();

    /* L'urgence d'abord : le niveau 4 précède le niveau 2 dans le DOM. */
    expect(
      urgente.compareDocumentPosition(normale) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it('ne crée aucune section pour un niveau absent', async () => {
    mocks.list.mockResolvedValue([
      dossier(1, 'RECU', 'VISA-2026-000001', { libelle: 'BASSE', niveau: 1 }),
    ]);

    rendre();
    await waitFor(() => expect(screen.getByText('VISA-2026-000001')).toBeTruthy());

    fireEvent.click(screen.getByRole('button', { name: /Grouper par niveau/i }));

    expect(screen.getByLabelText('Dossiers BASSE')).toBeTruthy();
    expect(screen.queryByLabelText('Dossiers URGENTE')).toBeNull();
  });

  it('bascule d’un regroupement à l’autre sans superposer les sections', async () => {
    mocks.list.mockResolvedValue([
      dossier(1, 'RECU', 'VISA-2026-000001', { libelle: 'URGENTE', niveau: 4 }),
    ]);

    rendre();
    await waitFor(() => expect(screen.getByText('VISA-2026-000001')).toBeTruthy());

    fireEvent.click(screen.getByRole('button', { name: /Grouper par niveau/i }));
    expect(screen.getByLabelText('Dossiers URGENTE')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /Grouper par statut/i }));
    expect(screen.getByLabelText('Dossiers Reçu')).toBeTruthy();
    expect(screen.queryByLabelText('Dossiers URGENTE')).toBeNull();
  });

  it('filtre la liste sur le niveau de priorité choisi', async () => {
    rendre();
    await waitFor(() => expect(mocks.list).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: /Filtres avancés/i }));
    fireEvent.change(screen.getByLabelText('Niveau de priorité'), {
      target: { value: '4' },
    });

    await waitFor(() => {
      const dernier = mocks.list.mock.calls[mocks.list.mock.calls.length - 1][0];
      expect(dernier.niveau).toBe('4');
    });
  });
});

describe('Liste des dossiers — tri', () => {
  it('propose un tri par statut du circuit', async () => {
    rendre();
    await waitFor(() => expect(mocks.list).toHaveBeenCalled());

    const select = screen.getByLabelText('Trier par');
    const valeurs = Array.from(select.options).map((o) => o.value);
    expect(valeurs).toContain('niveau');
    expect(valeurs).toContain('statut');
    expect(valeurs).toContain('priorite');
    expect(valeurs).toContain('demandeur');
  });

  it('transmet le tri choisi au serveur', async () => {
    rendre();
    await waitFor(() => expect(mocks.list).toHaveBeenCalled());

    fireEvent.change(screen.getByLabelText('Trier par'), { target: { value: 'statut' } });

    await waitFor(() => {
      const dernier = mocks.list.mock.calls[mocks.list.mock.calls.length - 1][0];
      expect(dernier.tri).toBe('statut');
    });
  });
});
