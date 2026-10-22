import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';

/**
 * Panneau « Signalements ».
 *
 * Ce qui est éprouvé ici : la difficulté se lit (nature, priorité, auteur,
 * statut) ; le chef de division peut l'ouvrir et son texte part tel quel ; le
 * chef de service peut la prendre en charge et la refermer par une décision
 * écrite ; l'agent qui n'a aucun de ces droits ne voit aucun bouton — un
 * bouton qui aboutirait toujours à un 403 est pire que pas de bouton.
 */

const mocks = vi.hoisted(() => ({
  permissions: [],
  parDossier: vi.fn(),
  creer: vi.fn(),
  prendre: vi.fn(),
  resoudre: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock('../../services/signalementService.js', () => ({
  signalementService: {
    parDossier: mocks.parDossier,
    creer: mocks.creer,
    prendre: mocks.prendre,
    resoudre: mocks.resoudre,
  },
  default: {},
}));

vi.mock('../../hooks/useAuth.js', () => ({
  useAuth: () => ({
    hasAnyPermission: (perms) => perms.some((p) => mocks.permissions.includes(p)),
  }),
}));

vi.mock('../../hooks/useNotification.js', () => ({
  useNotification: () => ({
    toastSuccess: mocks.toastSuccess,
    toastError: mocks.toastError,
  }),
}));

import { SignalementsPanel } from './SignalementsPanel.jsx';

const SIGNALEMENT = {
  id: 5,
  dossier_id: 42,
  dossier_numero: 'VISA-2026-000042',
  type: 'BLOCAGE',
  priorite: 'HAUTE',
  statut: 'OUVERT',
  motif: 'Pièce d’état civil manquante, demandeur injoignable.',
  auteur_nom: 'Visas Chef Visa',
  auteur_prenom: '',
  auteur_username: 'chef.visa',
  created_at: '2026-01-08 09:00:00',
  division_nom: 'Division Visas',
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.permissions = [];
  mocks.parDossier.mockResolvedValue([SIGNALEMENT]);
  mocks.creer.mockResolvedValue(SIGNALEMENT);
  mocks.prendre.mockResolvedValue({ ...SIGNALEMENT, statut: 'EN_COURS' });
  mocks.resoudre.mockResolvedValue({
    ...SIGNALEMENT,
    statut: 'RESOLU',
    resolution: 'Pièce reconstituée et versée au dossier.',
  });
});

describe('Signalements', () => {
  it('lit la difficulté, son auteur et son état', async () => {
    render(<SignalementsPanel dossierId={42} />);

    await waitFor(() => {
      expect(screen.getByText('Pièce d’état civil manquante, demandeur injoignable.')).toBeTruthy();
    });
    expect(screen.getByText('Dossier bloqué')).toBeTruthy();
    expect(screen.getByText('Priorité haute')).toBeTruthy();
    expect(screen.getByText('Ouvert')).toBeTruthy();
    expect(screen.getByText(/Visas Chef Visa/)).toBeTruthy();
  });

  it('n’ouvre aucun geste à qui n’a pas les permissions', async () => {
    render(<SignalementsPanel dossierId={42} />);

    await waitFor(() => {
      expect(screen.getByText(/Pièce d’état civil manquante/)).toBeTruthy();
    });
    expect(screen.queryByRole('button', { name: /Signaler un blocage/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /Prendre en charge/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /Résoudre/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /Rejeter/ })).toBeNull();
  });

  it('le chef de division ouvre un signalement avec son motif', async () => {
    mocks.permissions = ['signaler_dossier'];
    mocks.parDossier.mockResolvedValue([]);

    render(<SignalementsPanel dossierId={42} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Signaler un blocage/ })).toBeTruthy();
    });
    fireEvent.click(screen.getByRole('button', { name: /Signaler un blocage/ }));

    fireEvent.change(screen.getByLabelText(/Motif/), {
      target: { value: 'Le service extérieur ne répond plus depuis trois semaines.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Transmettre/ }));

    await waitFor(() => {
      expect(mocks.creer).toHaveBeenCalledWith(42, {
        type: 'BLOCAGE',
        priorite: 'NORMALE',
        motif: 'Le service extérieur ne répond plus depuis trois semaines.',
      });
    });
    expect(mocks.toastSuccess).toHaveBeenCalledWith('Signalement transmis à la hiérarchie.');
  });

  it('refuse un motif trop court sans appeler le serveur', async () => {
    mocks.permissions = ['signaler_dossier'];
    mocks.parDossier.mockResolvedValue([]);

    render(<SignalementsPanel dossierId={42} />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Signaler un blocage/ })).toBeTruthy();
    });
    fireEvent.click(screen.getByRole('button', { name: /Signaler un blocage/ }));
    fireEvent.change(screen.getByLabelText(/Motif/), { target: { value: 'court' } });
    fireEvent.click(screen.getByRole('button', { name: /Transmettre/ }));

    await waitFor(() => {
      expect(mocks.toastError).toHaveBeenCalled();
    });
    expect(mocks.creer).not.toHaveBeenCalled();
  });

  it('le chef de service prend en charge puis résout avec une décision écrite', async () => {
    mocks.permissions = ['traiter_signalement'];

    render(<SignalementsPanel dossierId={42} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Prendre en charge/ })).toBeTruthy();
    });
    fireEvent.click(screen.getByRole('button', { name: /Prendre en charge/ }));
    await waitFor(() => {
      expect(mocks.prendre).toHaveBeenCalledWith(5);
    });

    fireEvent.click(screen.getByRole('button', { name: /Résoudre/ }));

    const dialogue = await screen.findByRole('dialog');
    fireEvent.change(within(dialogue).getByLabelText(/Résolution/), {
      target: { value: 'Pièce reconstituée par la mairie et versée au dossier.' },
    });
    fireEvent.click(within(dialogue).getByRole('button', { name: /^Résoudre$/ }));

    await waitFor(() => {
      expect(mocks.resoudre).toHaveBeenCalledWith(5, {
        statut: 'RESOLU',
        resolution: 'Pièce reconstituée par la mairie et versée au dossier.',
      });
    });
  });

  it('affiche la résolution d’un signalement refermé', async () => {
    mocks.permissions = ['consulter_signalements'];
    mocks.parDossier.mockResolvedValue([{
      ...SIGNALEMENT,
      statut: 'RESOLU',
      resolution: 'Pièce reconstituée et versée au dossier.',
      date_resolution: '2026-01-09 11:00:00',
      traiteur_username: 'chef.service',
    }]);

    render(<SignalementsPanel dossierId={42} />);

    await waitFor(() => {
      expect(screen.getByText('Résolution')).toBeTruthy();
    });
    expect(screen.getByText('Pièce reconstituée et versée au dossier.')).toBeTruthy();
    expect(screen.getByText('Résolu')).toBeTruthy();
  });
});
