import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

/**
 * Bloc « À faire ensuite ».
 *
 * Le cahier des fonctionnalités demande à l'agent de « connaître la prochaine
 * action ». Ce qui est éprouvé ici, c'est la distinction qui porte l'écran :
 *
 *   - l'étape suivante, qui dépend du statut du dossier ;
 *   - l'acteur, qui dépend du rôle de la personne connectée.
 *
 * La confusion des deux est l'erreur la plus coûteuse : un agent qui croit
 * que c'est à lui de vérifier un dossier alors que c'est le Chef de Division
 * perd du temps, et un dossier attend.
 */

const mocks = vi.hoisted(() => ({
  getProchaineAction: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock('../../services/dossierService.js', () => ({
  dossierService: mocks,
  default: mocks,
}));

import { ProchaineAction } from './ProchaineAction.jsx';

const ACTION = {
  code: 'VERIFIER',
  titre: 'Vérifier et décider',
  description: 'Le dossier attend la vérification du Chef de Division.',
  acteur: 'Le Chef de la division Visa',
  pour_moi: false,
  permissions: ['verifier_dossier'],
  statut: 'SOUMIS_A_VERIFICATION',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('« À faire ensuite »', () => {
  it('annonce l’étape et le poste qui doit agir', async () => {
    mocks.getProchaineAction.mockResolvedValue(ACTION);
    render(<ProchaineAction dossierId={42} />);

    await waitFor(() => {
      expect(screen.getByText('Vérifier et décider')).toBeTruthy();
    });
    expect(screen.getByText(/attend la vérification du Chef de Division/)).toBeTruthy();
    expect(screen.getByText(/En attente de : Le Chef de la division Visa/)).toBeTruthy();
  });

  it('dit clairement que l’action n’est pas à l’agent connecté', async () => {
    mocks.getProchaineAction.mockResolvedValue(ACTION);
    render(<ProchaineAction dossierId={42} />);

    await waitFor(() => {
      expect(screen.getByText(/Ce n’est pas à vous d’agir/)).toBeTruthy();
    });
  });

  it('n’affiche pas de bouton d’action quand l’action n’est pas à l’agent', async () => {
    mocks.getProchaineAction.mockResolvedValue(ACTION);
    render(<ProchaineAction dossierId={42} />);

    await waitFor(() => {
      expect(screen.getByText('Vérifier et décider')).toBeTruthy();
    });
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('propose le bouton quand l’action revient à l’agent', async () => {
    mocks.getProchaineAction.mockResolvedValue({
      ...ACTION,
      pour_moi: true,
      acteur: 'Vous',
    });
    const surClic = vi.fn();
    render(<ProchaineAction dossierId={42} onAction={surClic} />);

    await waitFor(() => {
      expect(screen.getByText(/C’est à vous/)).toBeTruthy();
    });
    const bouton = screen.getByRole('button', { name: /Vérifier et décider/ });
    expect(bouton).toBeTruthy();

    // Le bouton ouvre l'action annoncée : c'est le but du bloc.
    bouton.click();
    expect(surClic).toHaveBeenCalledWith('VERIFIER');
  });

  it('annonce la fin du parcours pour un dossier archivé', async () => {
    mocks.getProchaineAction.mockResolvedValue({
      code: null,
      titre: 'Dossier archivé',
      description: 'Le dossier a été archivé. Il n’y a plus rien à faire.',
      acteur: null,
      pour_moi: false,
      permissions: [],
    });
    render(<ProchaineAction dossierId={42} />);

    await waitFor(() => {
      expect(screen.getByText('Dossier archivé')).toBeTruthy();
    });
    expect(screen.getByText(/Il n’y a plus rien à faire/)).toBeTruthy();
  });

  it('affiche un message d’erreur sans masquer le dossier', async () => {
    mocks.getProchaineAction.mockRejectedValue(new Error('Service indisponible'));
    render(<ProchaineAction dossierId={42} />);

    await waitFor(() => {
      expect(screen.getByText('Prochaine action indisponible')).toBeTruthy();
    });
    expect(screen.getByText('Service indisponible')).toBeTruthy();
  });
});
