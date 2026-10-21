import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

/**
 * Panneau « Données de l'opération ».
 *
 * Ce qui est éprouvé ici, c'est trois choses :
 *
 *   - le formulaire est **construit sur le schéma** de l'opération : il ne
 *     montre que les champs que l'opération exige ;
 *   - la séparation des deux gestes — celui qui saisit et celui qui contrôle ;
 *   - le fait qu'un montant n'est **jamais calculé** : il est saisi, sa
 *     source est conservée, et c'est le contrôle qui atteste qu'il a été vu.
 */

const mocks = vi.hoisted(() => ({
  permissions: [],
  getOperation: vi.fn(),
  saveOperation: vi.fn(),
  controlerOperation: vi.fn(),
  validerMontantOperation: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock('../../services/dossierService.js', () => ({
  dossierService: {
    getOperation: mocks.getOperation,
    saveOperation: mocks.saveOperation,
    controlerOperation: mocks.controlerOperation,
    validerMontantOperation: mocks.validerMontantOperation,
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

import { OperationPanel } from './OperationPanel.jsx';

const DOSSIER = {
  id: 42,
  type_code: 'SOLDE',
  sous_type_libelle: 'Avance de solde',
};

/** Le schéma de l'opération : c'est lui qui dessine le formulaire. */
const SCHEMA = [
  { cle: 'reference_externe', libelle: 'Référence externe', type_champ: 'texte', requis: false, ordre: 10 },
  { cle: 'montant', libelle: 'Montant (Ar)', type_champ: 'nombre', requis: false, ordre: 50 },
  { cle: 'source_montant', libelle: 'Source du montant', type_champ: 'texte', requis: false, ordre: 60 },
  { cle: 'duree_mois', libelle: 'Durée (mois)', type_champ: 'nombre', requis: true, ordre: 110 },
  { cle: 'resultat', libelle: 'Résultat', type_champ: 'choix', options: 'A|B|C', requis: false, ordre: 120 },
  { cle: 'observation', libelle: 'Observation', type_champ: 'textarea', requis: false, ordre: 100 },
];

const VALEURS = {
  reference_externe: 'REF-2026-0001',
  montant: '1500000.00',
  source_montant: 'Décision n° 12 du 05/01/2026',
  duree_mois: '6',
  resultat: 'A',
  observation: 'Rien de particulier.',
};

const OPERATION = {
  id: 1,
  dossier_id: 42,
  reference_externe: 'REF-2026-0001',
  montant: '1500000.00',
  source_montant: 'Décision n° 12 du 05/01/2026',
  date_reference: '2026-01-05',
  observation: 'Rien de particulier.',
  controleur_username: 'chef.solde',
  date_controle: '2026-01-10 09:30:00',
  observations_controle: 'Montant vérifié.',
  decision_controle: 'APPROUVE',
  valide_par_username: 'chef.pension',
  date_validation: '2026-01-12 14:00:00',
  donnees: { duree_mois: 6, resultat: 'A' },
};

/** La réponse du serveur, dans son nouveau contrat. */
const reponse = (donnees = null, valeurs = {}) => ({
  dossier_id: 42,
  operation: { id: 3, code: 'SOLDE_AVANCE', libelle: 'Avance de solde' },
  schema: SCHEMA,
  valeurs: { ...VALEURS, ...valeurs },
  donnees,
});

beforeEach(() => {
  vi.clearAllMocks();
  mocks.permissions = [];
  mocks.getOperation.mockResolvedValue(reponse());
  mocks.saveOperation.mockResolvedValue(OPERATION);
});

describe('Données de l’opération', () => {
  it('construit le formulaire sur le schéma de l’opération', async () => {
    mocks.permissions = ['saisir_donnees_operation'];
    render(<OperationPanel dossier={DOSSIER} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Référence externe/)).toBeTruthy();
    });
    /* Les champs propres de l'opération sont là… */
    expect(screen.getByLabelText(/Durée \(mois\)/)).toBeTruthy();
    expect(screen.getByLabelText(/Résultat/)).toBeTruthy();
    /* … et rien d'autre : un champ absent du schéma n'est pas proposé. */
    expect(screen.queryByLabelText(/Version produite/)).toBeNull();
  });

  it('rend les champs propres de l’opération', async () => {
    mocks.permissions = ['saisir_donnees_operation'];
    render(<OperationPanel dossier={DOSSIER} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Durée \(mois\)/)).toBeTruthy();
    });
    expect(screen.getByLabelText(/Durée \(mois\)/).value).toBe('6');
  });

  it('explique l’absence de formulaire plutôt que de le cacher', async () => {
    render(<OperationPanel dossier={DOSSIER} />);

    await waitFor(() => {
      expect(
        screen.getByText(/La saisie des données d’opération n’est pas ouverte/)
      ).toBeTruthy();
    });
    expect(screen.queryByLabelText(/Référence externe/)).toBeNull();
  });

  it('signale une opération sans schéma propre', async () => {
    mocks.permissions = ['saisir_donnees_operation'];
    mocks.getOperation.mockResolvedValue({
      dossier_id: 42,
      operation: { id: 3, code: 'SOLDE_AUTRE', libelle: 'Autre opération' },
      schema: [],
      valeurs: {},
      donnees: null,
    });
    render(<OperationPanel dossier={DOSSIER} />);

    await waitFor(() => {
      expect(screen.getByText(/Aucun champ propre à cette opération/)).toBeTruthy();
    });
  });

  it('n’active « Enregistrer » que si quelque chose a changé', async () => {
    mocks.permissions = ['saisir_donnees_operation'];
    mocks.getOperation.mockResolvedValue(reponse(OPERATION));
    render(<OperationPanel dossier={DOSSIER} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Référence externe/)).toBeTruthy();
    });
    const bouton = screen.getByRole('button', { name: /Enregistrer/ });
    expect(bouton.disabled).toBe(true);

    fireEvent.change(screen.getByLabelText(/Référence externe/), {
      target: { value: 'REF-2026-0002' },
    });
    expect(bouton.disabled).toBe(false);
  });

  it('envoie la saisie au serveur, montant compris', async () => {
    mocks.permissions = ['saisir_donnees_operation'];
    render(<OperationPanel dossier={DOSSIER} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Montant/)).toBeTruthy();
    });
    fireEvent.change(screen.getByLabelText(/Montant/), { target: { value: '25000.50' } });
    fireEvent.change(screen.getByLabelText(/Source du montant/), {
      target: { value: 'Arrêté de la commission' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Enregistrer/ }));

    await waitFor(() => {
      expect(mocks.saveOperation).toHaveBeenCalledWith(
        42,
        expect.objectContaining({
          valeurs: expect.objectContaining({
            montant: 25000.5,
            source_montant: 'Arrêté de la commission',
          }),
        })
      );
    });
  });

  it('montre le montant, sa source, le contrôle et la validation', async () => {
    mocks.permissions = ['saisir_donnees_operation', 'controler_donnees_operation'];
    mocks.getOperation.mockResolvedValue(reponse(OPERATION));
    render(<OperationPanel dossier={DOSSIER} />);

    await waitFor(() => {
      expect(screen.getByText(/1 500 000,00 Ar/)).toBeTruthy();
    });
    expect(screen.getByText('Décision n° 12 du 05/01/2026')).toBeTruthy();
    expect(screen.getByText(/Contrôlé le/)).toBeTruthy();
    expect(screen.getByText(/Montant validé le/)).toBeTruthy();
  });

  it('ne propose les actes de contrôle qu’à qui contrôle', async () => {
    mocks.permissions = ['saisir_donnees_operation'];
    mocks.getOperation.mockResolvedValue(reponse(OPERATION));
    render(<OperationPanel dossier={DOSSIER} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Référence externe/)).toBeTruthy();
    });
    expect(screen.queryByRole('button', { name: /Contrôler l’opération/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /Valider le montant/ })).toBeNull();
  });

  it('ouvre la modale de contrôle et enregistre la décision', async () => {
    mocks.permissions = ['controler_donnees_operation'];
    mocks.getOperation.mockResolvedValue(reponse(OPERATION));
    mocks.controlerOperation.mockResolvedValue(OPERATION);
    render(<OperationPanel dossier={DOSSIER} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Contrôler l’opération/ })).toBeTruthy();
    });
    fireEvent.click(screen.getByRole('button', { name: /Contrôler l’opération/ }));

    const select = await screen.findByLabelText(/Décision/);
    fireEvent.change(select, { target: { value: 'RETOURNE' } });
    fireEvent.click(screen.getByRole('button', { name: /Enregistrer la décision/ }));

    await waitFor(() => {
      expect(mocks.controlerOperation).toHaveBeenCalledWith(
        42,
        expect.objectContaining({ decision: 'RETOURNE' })
      );
    });
  });

  it('refuse de valider un montant qui n’est pas saisi', async () => {
    mocks.permissions = ['controler_donnees_operation'];
    mocks.getOperation.mockResolvedValue(reponse(null, { montant: '' }));
    render(<OperationPanel dossier={DOSSIER} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Valider le montant/ })).toBeTruthy();
    });
    expect(screen.getByRole('button', { name: /Valider le montant/ }).disabled).toBe(true);
  });
});
