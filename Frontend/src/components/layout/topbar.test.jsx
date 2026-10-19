import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

/* La barre est isolée de ses dépendances : on ne teste que le comportement du
   menu du compte, pas l'authentification ni le temps réel. */
vi.mock('../../hooks/useAuth.js', () => ({
  useAuth: () => ({
    user: { username: 'admin', email: 'admin@srsp.mg', role_nom: 'Administrateur' },
    logout: vi.fn(),
  }),
}));

vi.mock('../../contexts/UIContext.jsx', () => ({
  useUI: () => ({ estSombre: false, basculerTheme: vi.fn() }),
}));

vi.mock('../notification/NotificationBell.jsx', () => ({
  NotificationBell: () => null,
}));

import { Topbar } from './Topbar.jsx';

/**
 * Menu du compte de la barre supérieure.
 *
 * Sa fermeture au clic à l'extérieur reposait sur un voile `position: fixed`.
 * Or la barre porte `backdrop-blur`, ce qui en fait le bloc conteneur des
 * descendants `position: fixed` : le voile ne couvrait que la barre, et cliquer
 * ailleurs dans la page ne refermait rien. Elle doit donc se fermer sur
 * n'importe quel clic hors du menu.
 */
const ouvrir = () => {
  render(
    <MemoryRouter>
      <Topbar />
    </MemoryRouter>
  );
  fireEvent.click(screen.getByLabelText('Menu du compte'));
};

describe('Topbar — menu du compte', () => {
  it('s’ouvre au clic sur le bouton et l’annonce', () => {
    ouvrir();
    expect(screen.getByText('Mon profil')).toBeTruthy();
    expect(screen.getByLabelText('Menu du compte').getAttribute('aria-expanded')).toBe('true');
  });

  it('se referme quand on clique ailleurs dans la page', () => {
    ouvrir();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByText('Mon profil')).toBeNull();
  });

  it('reste ouvert quand on clique dans le menu', () => {
    ouvrir();
    fireEvent.mouseDown(screen.getByText('Mon profil'));
    expect(screen.getByText('Mon profil')).toBeTruthy();
  });
});
