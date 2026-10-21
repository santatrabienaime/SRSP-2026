import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

/**
 * Écrans de réinitialisation du mot de passe.
 *
 * Deux règles y sont vérifiées, et elles ne sont pas évidentes :
 *
 *   - la **réponse à la demande est la même** que le compte existe ou non.
 *     L'interface ne doit rien laisser deviner qui n'existe pas ;
 *   - le **nouveau mot de passe est choisi par l'agent**, et l'écran montre
 *     les règles de la politique en clair, avant l'envoi.
 */

const mocks = vi.hoisted(() => ({
  forgotPassword: vi.fn(),
  resetPassword: vi.fn(),
}));

vi.mock('../../services/authService.js', () => ({
  authService: mocks,
  default: mocks,
}));

import { ForgotPasswordPage } from './ForgotPasswordPage.jsx';
import { ResetPasswordPage } from './ResetPasswordPage.jsx';

const REPONSE = {
  message:
    "Si un compte actif correspond à cet identifiant, la demande a été transmise à l'administrateur. " +
    'Un administrateur vous contactera pour vous remettre un code de réinitialisation.',
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.forgotPassword.mockResolvedValue(REPONSE);
  mocks.resetPassword.mockResolvedValue({ message: 'Mot de passe réinitialisé.' });
});

function rendre(Component) {
  return render(
    <MemoryRouter>
      <Component />
    </MemoryRouter>
  );
}

describe('Mot de passe oublié — dépôt de la demande', () => {
  it('affiche la confirmation quel que soit le compte', async () => {
    rendre(ForgotPasswordPage);

    fireEvent.change(screen.getByLabelText(/Identifiant ou email/i), {
      target: { value: 'secretaire' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Demander un code/i }));

    await waitFor(() => {
      expect(screen.getByText(/la demande a été transmise/i)).toBeTruthy();
    });
    expect(mocks.forgotPassword).toHaveBeenCalledWith('secretaire');
  });

  it('n’envoie rien tant que l’identifiant est vide', async () => {
    rendre(ForgotPasswordPage);

    fireEvent.click(screen.getByRole('button', { name: /Demander un code/i }));

    await waitFor(() => {
      expect(screen.getByText(/Veuillez renseigner votre identifiant/i)).toBeTruthy();
    });
    expect(mocks.forgotPassword).not.toHaveBeenCalled();
  });

  it('explique la suite de la procédure', async () => {
    rendre(ForgotPasswordPage);

    fireEvent.change(screen.getByLabelText(/Identifiant ou email/i), {
      target: { value: 'secretaire' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Demander un code/i }));

    await waitFor(() => {
      expect(screen.getByText(/code à six chiffres/i)).toBeTruthy();
    });
  });
});

describe('Nouveau mot de passe — consommation du code', () => {
  it('montre les règles de la politique au fur et à mesure', () => {
    rendre(ResetPasswordPage);

    // Les cinq règles sont annoncées avant même la saisie. On les cherche
    // toutes : la liste de règles contient les mêmes libellés que le
    // message d'erreur, et un sélecteur trop large les confondrait.
    for (const regle of [
      /Au moins 8 caractères/,
      /Une majuscule/,
      /Une minuscule/,
      /Un chiffre/,
      /Un caractère spécial/,
    ]) {
      expect(screen.getAllByText(regle).length).toBeGreaterThan(0);
    }
  });

  it('refuse un code qui n’a pas six chiffres', async () => {
    rendre(ResetPasswordPage);

    fireEvent.change(screen.getByLabelText(/Identifiant ou email/i), {
      target: { value: 'secretaire' },
    });
    fireEvent.change(screen.getByLabelText(/Code de réinitialisation/i), {
      target: { value: '12345' },
    });
    fireEvent.change(screen.getByLabelText(/Nouveau mot de passe/i), {
      target: { value: 'Nouveau9!' },
    });
    fireEvent.change(screen.getByLabelText(/Confirmer le mot de passe/i), {
      target: { value: 'Nouveau9!' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Réinitialiser le mot de passe/i }));

    await waitFor(() => {
      expect(screen.getByText(/Le code comporte six chiffres/i)).toBeTruthy();
    });
    expect(mocks.resetPassword).not.toHaveBeenCalled();
  });

  it('refuse un mot de passe trop faible', async () => {
    rendre(ResetPasswordPage);

    fireEvent.change(screen.getByLabelText(/Identifiant ou email/i), {
      target: { value: 'secretaire' },
    });
    fireEvent.change(screen.getByLabelText(/Code de réinitialisation/i), {
      target: { value: '123456' },
    });
    fireEvent.change(screen.getByLabelText(/Nouveau mot de passe/i), {
      target: { value: 'azerty' },
    });
    fireEvent.change(screen.getByLabelText(/Confirmer le mot de passe/i), {
      target: { value: 'azerty' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Réinitialiser le mot de passe/i }));

    await waitFor(() => {
      expect(screen.getByText(/doit contenir au moins 8 caractères/i)).toBeTruthy();
    });
    expect(mocks.resetPassword).not.toHaveBeenCalled();
  });

  it('refuse deux mots de passe différents', async () => {
    rendre(ResetPasswordPage);

    fireEvent.change(screen.getByLabelText(/Identifiant ou email/i), {
      target: { value: 'secretaire' },
    });
    fireEvent.change(screen.getByLabelText(/Code de réinitialisation/i), {
      target: { value: '123456' },
    });
    fireEvent.change(screen.getByLabelText(/Nouveau mot de passe/i), {
      target: { value: 'Nouveau9!' },
    });
    fireEvent.change(screen.getByLabelText(/Confirmer le mot de passe/i), {
      target: { value: 'Autre9!' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Réinitialiser le mot de passe/i }));

    await waitFor(() => {
      expect(screen.getByText(/ne correspondent pas/i)).toBeTruthy();
    });
    expect(mocks.resetPassword).not.toHaveBeenCalled();
  });

  it('envoie la demande quand tout est correct', async () => {
    rendre(ResetPasswordPage);

    fireEvent.change(screen.getByLabelText(/Identifiant ou email/i), {
      target: { value: 'secretaire' },
    });
    fireEvent.change(screen.getByLabelText(/Code de réinitialisation/i), {
      target: { value: '123456' },
    });
    fireEvent.change(screen.getByLabelText(/Nouveau mot de passe/i), {
      target: { value: 'Nouveau9!' },
    });
    fireEvent.change(screen.getByLabelText(/Confirmer le mot de passe/i), {
      target: { value: 'Nouveau9!' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Réinitialiser le mot de passe/i }));

    await waitFor(() => {
      expect(mocks.resetPassword).toHaveBeenCalledWith('secretaire', '123456', 'Nouveau9!');
    });
    await waitFor(() => {
      expect(screen.getByText(/Mot de passe réinitialisé/i)).toBeTruthy();
    });
  });
});
