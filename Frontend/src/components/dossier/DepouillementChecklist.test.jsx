import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

/**
 * Dépouillement — boutons de contrôle.
 *
 * Les trois gestes attendus au guichet sont Présente, Absente et Rejetée.
 * Absente et Rejetée exigent un motif ; Présente et Non applicable
 * s'enregistrent directement. Le chef de division qui vérifie le dossier doit
 * voir ces boutons même s'il ne porte pas les permissions métier de l'agent.
 */

const mocks = vi.hoisted(() => ({
  permissions: [],
  getDepouillement: vi.fn(),
  getDepouillementHistorique: vi.fn(),
  saveDepouillement: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock('../../services/dossierService.js', () => ({
  dossierService: {
    getDepouillement: mocks.getDepouillement,
    getDepouillementHistorique: mocks.getDepouillementHistorique,
    saveDepouillement: mocks.saveDepouillement,
  },
  default: {},
}));

vi.mock('../../hooks/useAuth.js', () => ({
  useAuth: () => ({
    hasAnyPermission: (perms) => perms.some((p) => mocks.permissions.includes(p)),
  }),
}));

vi.mock('../../hooks/useNotification.js', () => ({
  useNotification: () => ({ toastSuccess: mocks.toastSuccess }),
}));

import { DepouillementChecklist } from './DepouillementChecklist.jsx';

const CHECKLIST = {
  dossier_id: 56,
  resume: {
    total: 2,
    presentes: 1,
    manquantes: 1,
    complet: false,
    pieces_manquantes: ['Décompte de solde'],
    pieces_a_traiter: [
      { code: 'SOLDE_DECOMPTE', libelle: 'Décompte de solde', etat: 'MANQUANTE' },
    ],
    par_phase: {
      DEPOUILLEMENT: {
        total: 2,
        presentes: 1,
        manquantes: 1,
        complet: false,
        pieces_manquantes: ['Décompte de solde'],
      },
      ARCHIVAGE: { total: 0, presentes: 0, manquantes: 0, complet: false, pieces_manquantes: [] },
    },
  },
  depouillement: [
    {
      code: 'SOLDE_FICHE_LIQUIDATION',
      libelle: 'Fiche de liquidation',
      phase: 'DEPOUILLEMENT',
      obligatoire: true,
      presente: true,
      etat: 'PRESENTE',
      observation: null,
      motif: null,
      date_controle: null,
      agent: null,
    },
    {
      code: 'SOLDE_DECOMPTE',
      libelle: 'Décompte de solde',
      phase: 'DEPOUILLEMENT',
      obligatoire: true,
      presente: false,
      etat: 'MANQUANTE',
      observation: null,
      motif: 'Copie non fournie',
      date_controle: null,
      agent: null,
    },
  ],
  archivage: [],
  pieces: [
    {
      code: 'SOLDE_FICHE_LIQUIDATION',
      libelle: 'Fiche de liquidation',
      phase: 'DEPOUILLEMENT',
      obligatoire: true,
      presente: true,
      etat: 'PRESENTE',
    },
    {
      code: 'SOLDE_DECOMPTE',
      libelle: 'Décompte de solde',
      phase: 'DEPOUILLEMENT',
      obligatoire: true,
      presente: false,
      etat: 'MANQUANTE',
      observation: null,
      motif: 'Copie non fournie',
    },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.permissions = ['verifier_dossier'];
  mocks.getDepouillement.mockResolvedValue(CHECKLIST);
  mocks.getDepouillementHistorique.mockResolvedValue([]);
  mocks.saveDepouillement.mockResolvedValue({});
});

describe('Dépouillement — marquage des pièces', () => {
  it('affiche Présente, Absente, Rejetée et Non applicable au chef de division', async () => {
    render(<DepouillementChecklist dossierId={56} />);

    await screen.findAllByRole('button', { name: 'Présente' });

    expect(screen.getAllByRole('button', { name: 'Présente' }).length).toBe(2);
    expect(screen.getAllByRole('button', { name: 'Absente' }).length).toBe(2);
    expect(screen.getAllByRole('button', { name: 'Rejetée' }).length).toBe(2);
    expect(screen.getAllByRole('button', { name: 'Non applicable' }).length).toBe(2);
    // Le libellé affiché est « Absente », pas l'ancien « Manquante ».
    expect(screen.getAllByText('Absente').length).toBeGreaterThan(0);
  });

  it('enregistre une pièce présente sans demander de motif', async () => {
    render(<DepouillementChecklist dossierId={56} />);

    await screen.findAllByRole('button', { name: 'Présente' });
    fireEvent.click(screen.getAllByRole('button', { name: 'Présente' })[1]);

    await waitFor(() => {
      expect(mocks.saveDepouillement).toHaveBeenCalledWith(56, {
        piece: 'SOLDE_DECOMPTE',
        presente: true,
        etat: 'PRESENTE',
        motif: undefined,
      });
    });
  });

  it('exige un motif pour une pièce absente', async () => {
    render(<DepouillementChecklist dossierId={56} />);

    await screen.findAllByRole('button', { name: 'Absente' });
    fireEvent.click(screen.getAllByRole('button', { name: 'Absente' })[0]);

    const enregistrer = screen.getByRole('button', { name: 'Enregistrer' });
    expect(enregistrer.disabled).toBe(true);

    fireEvent.change(screen.getByLabelText(/Motif/), {
      target: { value: 'Copie de la fiche non fournie par le demandeur.' },
    });
    expect(enregistrer.disabled).toBe(false);
    fireEvent.click(enregistrer);

    await waitFor(() => {
      expect(mocks.saveDepouillement).toHaveBeenCalledWith(56, {
        piece: 'SOLDE_FICHE_LIQUIDATION',
        presente: false,
        etat: 'MANQUANTE',
        motif: 'Copie de la fiche non fournie par le demandeur.',
      });
    });
  });

  it('exige un motif pour une pièce rejetée', async () => {
    render(<DepouillementChecklist dossierId={56} />);

    await screen.findAllByRole('button', { name: 'Rejetée' });
    fireEvent.click(screen.getAllByRole('button', { name: 'Rejetée' })[0]);

    fireEvent.change(screen.getByLabelText(/Motif/), {
      target: { value: 'Acte non conforme : signature absente.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

    await waitFor(() => {
      expect(mocks.saveDepouillement).toHaveBeenCalledWith(56, {
        piece: 'SOLDE_FICHE_LIQUIDATION',
        presente: false,
        etat: 'REJETEE',
        motif: 'Acte non conforme : signature absente.',
      });
    });
  });
});
