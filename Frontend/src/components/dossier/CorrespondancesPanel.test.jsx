import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

/**
 * Panneau « Correspondances ».
 *
 * Ce qui est éprouvé ici : la correspondance se lit (type, destinataire,
 * objet, envoi) et se suit (réponse, réception au central) ; et l'agent qui
 * n'a pas la permission de gérer les correspondances ne trouve aucun bouton
 * — un bouton qui aboutirait toujours à un 403 est pire que pas de bouton.
 */

const mocks = vi.hoisted(() => ({
  permissions: [],
  list: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock('../../services/correspondanceService.js', () => ({
  correspondanceService: {
    list: mocks.list,
    create: mocks.create,
    update: mocks.update,
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

import { CorrespondancesPanel } from './CorrespondancesPanel.jsx';

const CORRESPONDANCE = {
  id: 7,
  dossier_id: 42,
  type: 'OPPOSITION_PENSION_ALIMENTAIRE',
  reference: 'OPP-2026-0001',
  destinataire: 'Level central',
  objet: 'Opposition sur pension alimentaire',
  contenu: 'Opposition à signifier.',
  etat: 'ENVOYEE',
  date_envoi: '2026-01-08 10:00:00',
  etat_reponse: 'ACCUSEE',
  date_reponse: '2026-01-09 08:30:00',
  reponse: 'Accusé de réception reçu.',
  date_transmission_central: '2026-01-08 11:00:00',
  destinataire_central: 'Direction centrale',
  reference_bordereau: 'BORD-CENTRAL-0001',
  etat_reception_central: 'RECU',
  auteur: 'liquidateur',
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.permissions = [];
  mocks.list.mockResolvedValue([CORRESPONDANCE]);
});

describe('Correspondances', () => {
  it('liste la correspondance et son suivi', async () => {
    render(<CorrespondancesPanel dossierId={42} />);

    await waitFor(() => {
      expect(screen.getByText('Opposition (pension alimentaire)')).toBeTruthy();
    });
    expect(screen.getByText('Opposition sur pension alimentaire')).toBeTruthy();
    expect(screen.getByText(/Level central/)).toBeTruthy();
    expect(screen.getByText('Envoyée')).toBeTruthy();
    expect(screen.getByText('Accusée de réception')).toBeTruthy();
    expect(screen.getByText('Accusé de réception reçu.')).toBeTruthy();
    expect(screen.getByText('BORD-CENTRAL-0001')).toBeTruthy();
    expect(screen.getByText('Reçue au central')).toBeTruthy();
  });

  it('n’affiche aucun bouton à qui n’a pas la permission', async () => {
    render(<CorrespondancesPanel dossierId={42} />);

    await waitFor(() => {
      expect(screen.getByText(/n’est pas ouverte à votre profil/)).toBeTruthy();
    });
    expect(screen.queryByRole('button', { name: /Nouvelle correspondance/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /Suivi/ })).toBeNull();
  });

  it('propose la création et le suivi à qui a la permission', async () => {
    mocks.permissions = ['gerer_correspondances'];
    render(<CorrespondancesPanel dossierId={42} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Nouvelle correspondance/ })).toBeTruthy();
    });
    expect(screen.getByRole('button', { name: /Suivi/ })).toBeTruthy();
  });

  it('envoie une correspondance nouvelle rattachée au dossier', async () => {
    mocks.permissions = ['gerer_correspondances'];
    mocks.create.mockResolvedValue(CORRESPONDANCE);
    render(<CorrespondancesPanel dossierId={42} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Nouvelle correspondance/ })).toBeTruthy();
    });
    fireEvent.click(screen.getByRole('button', { name: /Nouvelle correspondance/ }));

    const destinataire = await screen.findByLabelText(/^Destinataire\s*\*?$/);
    fireEvent.change(destinataire, { target: { value: 'Direction centrale' } });
    const objet = screen.getByLabelText(/^Objet\s*\*?$/);
    fireEvent.change(objet, { target: { value: 'Opposition sur pension alimentaire' } });
    fireEvent.click(screen.getByRole('button', { name: /Enregistrer/ }));

    await waitFor(() => {
      expect(mocks.create).toHaveBeenCalledWith(
        expect.objectContaining({
          dossier_id: 42,
          destinataire: 'Direction centrale',
          objet: 'Opposition sur pension alimentaire',
        })
      );
    });
  });

  it('met à jour le suivi de la correspondance', async () => {
    mocks.permissions = ['gerer_correspondances'];
    mocks.update.mockResolvedValue(CORRESPONDANCE);
    render(<CorrespondancesPanel dossierId={42} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Suivi/ })).toBeTruthy();
    });
    fireEvent.click(screen.getByRole('button', { name: /Suivi/ }));

    const reponse = await screen.findByLabelText(/^Réponse$/);
    fireEvent.change(reponse, { target: { value: 'Accusé de réception reçu.' } });
    fireEvent.click(screen.getByRole('button', { name: /Enregistrer le suivi/ }));

    await waitFor(() => {
      expect(mocks.update).toHaveBeenCalledWith(
        7,
        expect.objectContaining({ reponse: 'Accusé de réception reçu.' })
      );
    });
  });
});
