import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

/**
 * Formulaire de création d'un dossier — le parcours VISA.
 *
 * Ce qui est éprouvé ici : le parcours de création d'un dossier VISA ne doit
 * être bloqué par aucun écran. Le bouton « Continuer » de la première étape
 * exige le type d'acte : ce champ doit donc être là, et alimenté.
 */

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  update: vi.fn(),
  rechercher: vi.fn(),
  referentiel: {
    types_dossiers: [
      { id: 1, code: 'VISA', libelle: 'Division Visa', description: 'Dossiers soumis pour visa' },
      { id: 2, code: 'SOLDE', libelle: 'Division Solde', description: 'Mandatements' },
    ],
    sous_types: [
      { id: 1, type_dossier_id: 1, code: 'VISA_MARIAGE', libelle: 'Visa de mariage', actif: 1, ordre: 10 },
      { id: 2, type_dossier_id: 1, code: 'VISA_NAISSANCE', libelle: 'Visa de naissance', actif: 1, ordre: 20 },
      { id: 16, type_dossier_id: 2, code: 'SOLDE_MANDATEMENT', libelle: 'Mandatement', actif: 1, ordre: 10 },
    ],
    priorites: [{ id: 2, libelle: 'Normale', niveau: 2 }],
    statuts: [],
    types_courriers: [],
    types_documents: [],
    types_pieces: [],
    fonctions: [],
  },
}));

vi.mock('../../services/dossierService.js', () => ({
  dossierService: {
    create: mocks.create,
    update: mocks.update,
    rechercherParMatricule: mocks.rechercher,
  },
  default: {},
}));

vi.mock('../../services/referentielService.js', () => ({
  referentielService: {
    get: vi.fn().mockResolvedValue(mocks.referentiel),
    typesPieces: vi.fn().mockResolvedValue([]),
  },
  default: {},
}));

vi.mock('../../services/divisionService.js', () => ({
  divisionService: {
    list: vi.fn().mockResolvedValue([
      { id: 1, nom: 'Division Visas', code: 'VISA', type_dossier_id: 1 },
      { id: 2, nom: 'Division Solde', code: 'SOLDE', type_dossier_id: 2 },
    ]),
  },
  default: {},
}));

vi.mock('../../services/agentService.js', () => ({
  agentService: {
    list: vi.fn().mockResolvedValue([
      {
        id: 7, nom: 'Visas', prenom: 'Verif Visa', division_id: 1,
        compte_id: 7, compte_actif: 1, peut_traiter: 1, actif: 1,
      },
    ]),
  },
  default: {},
}));

vi.mock('../../hooks/useNotification.js', () => ({
  useNotification: () => ({ toastSuccess: vi.fn(), toastError: vi.fn() }),
}));

vi.mock('../../hooks/useAuth.js', () => ({
  useAuth: () => ({
    user: { username: 'secretaire', agent_nom: 'Secretaire', agent_prenom: 'SRSP' },
  }),
}));

import { DossierForm } from './DossierForm.jsx';

const rendre = () => render(<DossierForm />);

/** Le bouton « Continuer » de la première étape. */
const continuer = () => screen.getByRole('button', { name: /Continuer/ });

beforeEach(() => {
  mocks.create.mockReset();
  mocks.update.mockReset();
  mocks.rechercher.mockReset();
  mocks.rechercher.mockResolvedValue({ trouve: false });
});

describe("Création d'un dossier VISA — première étape", () => {
  it("propose le type d'acte", async () => {
    rendre();
    await waitFor(() => expect(screen.getByText('Division Visa')).toBeTruthy());

    // Le type VISA est choisi.
    fireEvent.click(screen.getByRole('radio', { name: /Division Visa/ }));

    // Le champ « Type d'acte » est là, et il propose les actes du VISA.
    const select = await screen.findByLabelText(/Type d'acte/);
    const options = Array.from(select.options).map((o) => o.textContent);
    expect(options).toContain('Visa de mariage');
    expect(options).toContain('Visa de naissance');
  });

  it('ne bloque jamais le passage : il explique ce qui manque', async () => {
    rendre();
    await waitFor(() => expect(screen.getByText('Division Visa')).toBeTruthy());

    fireEvent.click(screen.getByRole('radio', { name: /Division Visa/ }));

    // Sans type d'acte, le bouton n'est pas gris : il dit pourquoi.
    expect(continuer().disabled).toBe(false);
    fireEvent.click(continuer());
    expect(screen.getByRole('alert').textContent).toMatch(/type d’acte/i);

    // Une fois l'acte choisi, le passage se fait.
    fireEvent.change(await screen.findByLabelText(/Type d'acte/), { target: { value: '1' } });
    fireEvent.click(continuer());
    await waitFor(() => expect(screen.getByLabelText(/N° matricule/)).toBeTruthy());
  });

  it('demande aussi le type d’opération aux autres divisions', async () => {
    rendre();
    await waitFor(() => expect(screen.getByText('Division Solde')).toBeTruthy());

    fireEvent.click(screen.getByRole('radio', { name: /Division Solde/ }));

    expect(continuer().disabled).toBe(false);
    fireEvent.click(continuer());
    expect(screen.getByRole('alert').textContent).toMatch(/type d’opération/i);
  });

  it('liste ce qui manque à la fiche VISA au lieu de bloquer le bouton', async () => {
    rendre();
    await waitFor(() => expect(screen.getByText('Division Visa')).toBeTruthy());

    // Étape 1 : le type et l'acte.
    fireEvent.click(screen.getByRole('radio', { name: /Division Visa/ }));
    fireEvent.change(await screen.findByLabelText(/Type d'acte/), { target: { value: '1' } });
    fireEvent.click(continuer());

    // Étape 2 : le nom du demandeur.
    await waitFor(() => expect(screen.getByLabelText(/^Nom/)).toBeTruthy());
    fireEvent.change(screen.getByLabelText(/^Nom/), { target: { value: 'RAKOTO' } });
    fireEvent.click(continuer());

    // Étape 3 : la fiche de réception VISA est incomplète.
    await waitFor(() => expect(screen.getByLabelText(/^Objet/)).toBeTruthy());

    // Le récapitulatif de ce qui manque est visible…
    expect(screen.getByText(/Fiche de réception VISA — à compléter/)).toBeTruthy();

    // …et le bouton de création n'est jamais gris : il explique.
    const creer = screen.getByRole('button', { name: /Créer le dossier/ });
    expect(creer.disabled).toBe(false);
    fireEvent.click(creer);
    expect(screen.getByRole('alert').textContent).toMatch(/le vérificateur/i);
  });
});
