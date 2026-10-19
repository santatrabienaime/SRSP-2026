import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

/**
 * Écran « Personnel ».
 *
 * Il remplace deux écrans — « Agents » et « Utilisateurs » — qui décrivaient les
 * mêmes personnes, l'un la fiche, l'autre le compte de connexion. On y créait un
 * compte sans personne, on rattachait deux fiches au même compte, et les deux
 * listes finissaient par afficher des emails différents. Les tests ci-dessous
 * tiennent les deux règles qui fondent la fusion : la liste montre la fiche ET
 * son compte sur une seule ligne, et l'identifiant de connexion ne se modifie
 * pas (il est la clé du journal d'audit).
 */

const mocks = vi.hoisted(() => ({
  list: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  toggle: vi.fn(),
  remove: vi.fn(),
  resetPassword: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock('../../services/personnelService.js', () => ({
  personnelService: mocks,
  default: mocks,
}));

vi.mock('../../services/roleService.js', () => ({
  roleService: { list: () => Promise.resolve([{ id: 5, nom: 'SECRETAIRE' }]) },
  default: { list: () => Promise.resolve([]) },
}));

vi.mock('../../services/referentielService.js', () => ({
  referentielService: {
    get: () => Promise.resolve({ fonctions: [{ id: 4, libelle: 'Secrétaire' }] }),
  },
  default: {},
}));

vi.mock('../../services/divisionService.js', () => ({
  divisionService: { list: () => Promise.resolve([{ id: 2, nom: 'Division Solde' }]) },
  default: {},
}));

vi.mock('../../hooks/useNotification.js', () => ({
  useNotification: () => ({ toastSuccess: mocks.toastSuccess, toastError: mocks.toastError }),
}));

import { PersonnelList } from './PersonnelList.jsx';

const AVEC_COMPTE = {
  id: 5,
  nom: 'RAKOTO',
  prenom: 'Jean',
  matricule: 'SRSP-005',
  fonction_libelle: 'Secrétaire',
  fonction_id: 4,
  division_id: 2,
  division_nom: 'Division Solde',
  email: 'jean@srsp.mg',
  telephone: null,
  actif: 1,
  compte_id: 12,
  username: 'jean.rakoto',
  compte_email: 'jean@srsp.mg',
  role_id: 5,
  role_nom: 'SECRETAIRE',
  compte_actif: 1,
  derniere_connexion: '2026-10-01 08:30:00',
};

const SANS_COMPTE = {
  id: 9,
  nom: 'RASOA',
  prenom: 'Marie',
  matricule: null,
  fonction_libelle: null,
  fonction_id: null,
  division_id: null,
  division_nom: null,
  email: null,
  telephone: null,
  actif: 0,
  compte_id: null,
  username: null,
  compte_email: null,
  role_id: null,
  role_nom: null,
  compte_actif: null,
  derniere_connexion: null,
};

const afficher = async () => {
  render(<PersonnelList />);
  await screen.findByText('RAKOTO Jean');
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.list.mockResolvedValue([AVEC_COMPTE, SANS_COMPTE]);
});

describe('Personnel — la liste', () => {
  it('réunit la fiche et le compte de connexion sur une même ligne', async () => {
    await afficher();

    expect(screen.getByText('Division Solde')).toBeTruthy();
    expect(screen.getByText('Secrétaire')).toBeTruthy();
    expect(screen.getByText('SRSP-005')).toBeTruthy();
    expect(screen.getByText('jean.rakoto')).toBeTruthy();
    expect(screen.getByText('SECRETAIRE')).toBeTruthy();
  });

  it('signale une personne sans compte et ne propose que ses actions', async () => {
    await afficher();

    expect(screen.getByText('Sans compte')).toBeTruthy();
    // Une seule personne a un compte : le mot de passe ne se réinitialise que
    // pour elle.
    expect(screen.getAllByTitle('Réinitialiser le mot de passe')).toHaveLength(1);
    expect(screen.getByLabelText('Réinitialiser le mot de passe de jean.rakoto')).toBeTruthy();
  });

  it('filtre la liste sur la recherche', async () => {
    await afficher();

    fireEvent.change(screen.getByLabelText(/Rechercher une personne/), {
      target: { value: 'rasoa' },
    });

    await waitFor(() => expect(screen.queryByText('RAKOTO Jean')).toBeNull());
    expect(screen.getByText('RASOA Marie')).toBeTruthy();
  });
});

describe('Personnel — le formulaire', () => {
  it('crée par défaut la personne et son compte', async () => {
    await afficher();
    fireEvent.click(screen.getByRole('button', { name: /Nouvelle personne/ }));

    expect(screen.getByLabelText(/^Identifiant/)).toBeTruthy();
    expect(screen.getByLabelText(/^Mot de passe/)).toBeTruthy();
    expect(screen.getByRole('button', { name: /Créer la personne et le compte/ })).toBeTruthy();
  });

  it('retire les champs de connexion quand la case est décochée', async () => {
    await afficher();
    fireEvent.click(screen.getByRole('button', { name: /Nouvelle personne/ }));

    fireEvent.click(screen.getByLabelText(/Créer un compte de connexion/));

    expect(screen.queryByLabelText(/^Identifiant/)).toBeNull();
    expect(screen.queryByLabelText(/^Mot de passe/)).toBeNull();
    expect(screen.getByRole('button', { name: /Créer la personne$/ })).toBeTruthy();
  });

  it('nomme ce qui manque au lieu d’enregistrer une fiche vide', async () => {
    await afficher();
    fireEvent.click(screen.getByRole('button', { name: /Nouvelle personne/ }));
    // Sans compte : seuls le nom et le prénom restent à compléter.
    fireEvent.click(screen.getByLabelText(/Créer un compte de connexion/));

    fireEvent.click(screen.getByRole('button', { name: /Créer la personne$/ }));

    expect(screen.getByText('À compléter : le nom, le prénom.')).toBeTruthy();
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it('ne laisse pas modifier l’identifiant d’un compte existant', async () => {
    await afficher();
    fireEvent.click(screen.getByLabelText('Modifier RAKOTO Jean'));

    // L'identifiant reste affiché (il sert à se connecter et à relire le
    // journal) mais aucun champ ne le rend modifiable.
    expect(screen.queryByLabelText(/^Identifiant/)).toBeNull();
    expect(screen.getAllByText('jean.rakoto').length).toBeGreaterThanOrEqual(1);
    // Le mot de passe ne se change pas ici : il se réinitialise par son action.
    expect(screen.queryByLabelText(/^Mot de passe/)).toBeNull();
    expect(screen.getByLabelText(/^Rôle/)).toBeTruthy();
  });

  it('enregistre une personne avec son compte', async () => {
    mocks.create.mockResolvedValue(AVEC_COMPTE);
    await afficher();
    fireEvent.click(screen.getByRole('button', { name: /Nouvelle personne/ }));
    // Les rôles arrivent du serveur : le choix n'est possible qu'une fois
    // l'option rendue.
    await screen.findByRole('option', { name: 'SECRETAIRE' });

    fireEvent.change(screen.getByLabelText(/^Nom/), { target: { value: 'ANDRIAN' } });
    fireEvent.change(screen.getByLabelText(/^Prénom/), { target: { value: 'Paul' } });
    fireEvent.change(screen.getByLabelText(/^Identifiant/), { target: { value: 'paul.andrian' } });
    fireEvent.change(screen.getByLabelText(/^Email de connexion/), {
      target: { value: 'paul@srsp.mg' },
    });
    fireEvent.change(screen.getByLabelText(/^Rôle/), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText(/^Mot de passe/), { target: { value: 'Admin123!' } });
    fireEvent.click(screen.getByRole('button', { name: /Créer la personne et le compte/ }));

    await waitFor(() => expect(mocks.create).toHaveBeenCalledTimes(1));
    expect(mocks.create).toHaveBeenCalledWith(
      expect.objectContaining({
        nom: 'ANDRIAN',
        prenom: 'Paul',
        username: 'paul.andrian',
        compte_email: 'paul@srsp.mg',
        role_id: 5,
        password: 'Admin123!',
        creer_compte: true,
      })
    );
  });
});
