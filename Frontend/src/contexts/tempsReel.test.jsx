import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import React, { useEffect, useState } from 'react';

/**
 * Canal temps réel — côté interface.
 *
 * Le socket est simulé : ce qui est éprouvé ici, c'est le **contrat** entre
 * le canal et les écrans, pas le transport.
 *
 *   - l'état de la connexion est exposé et change ;
 *   - un abonné reçoit les événements ;
 *   - le désabonnement fonctionne : un composant démonté ne continue pas de
 *     recevoir des événements.
 *
 * Ce dernier point n'est pas cosmétique : un écouteur oublié dans un
 * `useEffect` recharge une liste qui n'est plus affichée, et le compteur de
 * rechargements monte sans que rien ne se voie.
 */

const mocks = vi.hoisted(() => ({
  socket: {
    on: vi.fn(),
    onAny: vi.fn(),
    close: vi.fn(),
    connected: true,
    removeAllListeners: vi.fn(),
  },
  io: vi.fn(),
}));

vi.mock('socket.io-client', () => ({ io: mocks.io }));

vi.mock('../hooks/useAuth.js', () => ({
  useAuth: () => ({ token: 'jeton-de-test', user: { id: 1 } }),
}));

import { TempsReelProvider, ETATS_TEMPS_REEL } from './TempsReelContext.jsx';
import { useTempsReel } from '../hooks/useTempsReel.js';

/**
 * Les événements reçus sont poussés dans un tableau externe : ce qui est
 * éprouvé est la **livraison**, pas le rendu. Un composant démonté doit
 * cesser de recevoir — sinon il continue de recharger une liste disparue.
 */
const recu = [];

/** Émule un composant qui s'abonne et affiche l'état de la connexion. */
function Ecran() {
  const { statut, abonner } = useTempsReel();
  const [evenements, setEvenements] = useState([]);
  useEffect(() => {
    return abonner('dossier', (e) => {
      recu.push(e.statut);
      setEvenements((n) => [...n, e.statut]);
    });
  }, [abonner]);
  return (
    <div>
      <span data-testid="statut">{statut}</span>
      <span data-testid="recu">{evenements.join(',')}</span>
    </div>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  recu.length = 0;
  mocks.socket.connected = true;
  mocks.io.mockReturnValue(mocks.socket);
});

describe('Canal temps réel', () => {
  it('expose l’état hors ligne tant qu’aucun jeton n’est actif', () => {
    render(
      <TempsReelProvider>
        <Ecran />
      </TempsReelProvider>
    );
    expect(screen.getByTestId('statut').textContent).toBe(ETATS_TEMPS_REEL.CONNEXION);
  });

  it('passe à l’état connecté quand le socket s’établit', () => {
    render(
      <TempsReelProvider>
        <Ecran />
      </TempsReelProvider>
    );

    // On récupère le gestionnaire « connect » posé par le provider.
    const surConnect = mocks.socket.on.mock.calls.find((c) => c[0] === 'connect');
    expect(surConnect).toBeTruthy();
    act(() => { surConnect[1](); });

    expect(screen.getByTestId('statut').textContent).toBe(ETATS_TEMPS_REEL.CONNECTE);
  });

  it('livre les événements aux abonnés', () => {
    render(
      <TempsReelProvider>
        <Ecran />
      </TempsReelProvider>
    );

    // `onAny` reçoit tous les événements : on rejoue celui du serveur.
    // `calls[0]` est le tableau des arguments : larguments[0] est le gestionnaire.
    const surTout = mocks.socket.onAny.mock.calls[0];
    expect(surTout).toBeTruthy();
    act(() => { surTout[0]('dossier', { dossier_id: 7, statut: 'VALIDE' }); });

    expect(screen.getByTestId('recu').textContent).toBe('VALIDE');
  });

  it('ne livre plus rien après le désabonnement', () => {
    const { unmount } = render(
      <TempsReelProvider>
        <Ecran />
      </TempsReelProvider>
    );

    const surTout = mocks.socket.onAny.mock.calls[0];
    act(() => { surTout[0]('dossier', { dossier_id: 7, statut: 'VALIDE' }); });
    expect(recu).toEqual(['VALIDE']);

    unmount();
    recu.length = 0;
    act(() => { surTout[0]('dossier', { dossier_id: 8, statut: 'SIGNE' }); });

    // Le composant est démonté : plus rien ne doit être livré.
    expect(recu).toEqual([]);
  });

  it('ferme le socket quand le jeton disparaît', () => {
    const { unmount } = render(
      <TempsReelProvider>
        <Ecran />
      </TempsReelProvider>
    );
    unmount();
    expect(mocks.socket.close).toHaveBeenCalled();
  });
});
