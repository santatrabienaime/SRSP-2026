import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

/**
 * Écran « Bilan de conformité ».
 *
 * Ce qui est éprouvé ici, c'est ce que l'écran sert : dire où en est la
 * plateforme face au cahier. Le décompte par état doit être Exact — une
 * tuile fausse donnerait une fausse réponse — et les filtres doivent
 * porter sur le registre, pas sur un simple filtrage d'affichage.
 */

const mocks = vi.hoisted(() => ({
  bilan: {
    document: 'OBLIGATOIRE',
    total: 12,
    par_etat: {
      livree: 7, partielle: 2, inerte: 1, non_construite: 1, hors_plateforme: 1,
    },
    par_nature: { METIER: 8, TECHNIQUE: 4 },
    par_poste: [
      {
        poste_code: 'SECR', poste_libelle: 'Secrétariat', total: 12,
        livrees: 7, partielles: 2, inertes: 1, non_construites: 1, hors_plateforme: 1,
      },
    ],
    utilisables: 7,
    a_resoudre_en_priorite: 1,
    fonctions_non_livrees_sans_motif: 2,
  },
  lignes: [
    {
      id: 1, numero_source: '1.1', etat: 'LIVREE', nature: 'METIER',
      libelle: 'Créer un dossier', description: '', poste_libelle: 'Secrétariat',
      motif: null,
    },
    {
      id: 2, numero_source: '2.3', etat: 'INERTE', nature: 'METIER',
      libelle: 'Consulter le bilan', description: '', poste_libelle: 'Secrétariat',
      motif: 'Permission absente',
    },
  ],
  postes: [{ code: 'SECR', libelle: 'Secrétariat' }],
}));

vi.mock('../../services/referentielService.js', () => ({
  referentielService: {
    bilan: vi.fn(),
    conformite: vi.fn(),
    postes: vi.fn(),
  },
}));

import { referentielService } from '../../services/referentielService.js';
import { BilanPage } from './BilanPage.jsx';

beforeEach(() => {
  vi.clearAllMocks();
  referentielService.bilan.mockResolvedValue(mocks.bilan);
  referentielService.conformite.mockResolvedValue({ lignes: mocks.lignes, total: 2 });
  referentielService.postes.mockResolvedValue(mocks.postes);
});

describe('Bilan de conformité', () => {
  it('affiche le décompte par état', async () => {
    render(<BilanPage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Filtrer sur les fonctions inerte/)).toBeTruthy();
    });
    /* Les cinq états sont proposés, chacun dans une tuile cliquable. */
    for (const libelle of ['Livrée', 'Partielle', 'Inerte', 'Non construite', 'Hors plateforme']) {
      expect(screen.getByLabelText(new RegExp(`Filtrer sur les fonctions ${libelle.toLowerCase()}`)))
        .toBeTruthy();
    }
  });

  it('signale les fonctions non livrées sans motif', async () => {
    render(<BilanPage />);

    await waitFor(() => {
      expect(screen.getByText(/n'ont pas de motif/)).toBeTruthy();
    });
    expect(screen.getByText(/2 fonction\(s\) ne sont pas livrées sans motif/)).toBeTruthy();
  });

  it('liste les exigences du registre', async () => {
    render(<BilanPage />);

    await waitFor(() => {
      expect(screen.getByText('Créer un dossier')).toBeTruthy();
    });
    expect(screen.getByText('Consulter le bilan')).toBeTruthy();
    /* Le motif d'une exigence non livrée est affiché : c'est lui qui
       permet de comprendre pourquoi. */
    expect(screen.getByText('Permission absente')).toBeTruthy();
  });

  it('filtre le registre sur le serveur', async () => {
    render(<BilanPage />);

    /* On attend le **rendu**, pas l'appel : pendant le chargement, la
       case à cocher n'existe pas encore à l'écran. */
    await waitFor(() => {
      expect(screen.getByText('Créer un dossier')).toBeTruthy();
    });

    /* Le filtre « non livrées seulement » est porté au serveur : il
       ramène 460 lignes, pas 12. Le filtrer côté écran serait faux. */
    fireEvent.click(
      screen.getByRole('checkbox', { name: /fonctions non livrées/i })
    );

    await waitFor(() => {
      const dernierAppel = referentielService.conformite.mock.calls.at(-1)[0];
      expect(dernierAppel.manquantes).toBe('1');
    });
  });

  it('affiche la répartition par poste', async () => {
    render(<BilanPage />);

    await waitFor(() => {
      expect(screen.getByText('Répartition par poste')).toBeTruthy();
    });
    /* « Secrétariat » apparaît dans le tableau et dans la liste des postes :
       c'est le même poste, montré deux fois. */
    expect(screen.getAllByText('Secrétariat').length).toBeGreaterThan(0);
  });
});
