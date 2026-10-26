import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

/**
 * Pièces jointes — versionnage et suppression.
 *
 * Un dépôt ne remplace jamais un fichier : il en devient la version
 * suivante. Ce qui est éprouvé ici : les versions sont regroupées par pièce,
 * la version remplacée est nommée, et toute version peut être supprimée par
 * le déposant ou par un chef de division qui contrôle le dossier — un doublon
 * ou un scan erroné ne doit pas rester attaché.
 */

const mocks = vi.hoisted(() => ({
  permissions: [],
  user: { id: 5 },
  getDocuments: vi.fn(),
  uploadDocument: vi.fn(),
  downloadDocument: vi.fn(),
  deleteDocument: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock('../../services/dossierService.js', () => ({
  dossierService: {
    getDocuments: mocks.getDocuments,
    uploadDocument: mocks.uploadDocument,
    downloadDocument: mocks.downloadDocument,
    deleteDocument: mocks.deleteDocument,
  },
  default: {},
}));

vi.mock('../../hooks/useAuth.js', () => ({
  useAuth: () => ({
    user: mocks.user,
    hasAnyPermission: (perms) => perms.some((p) => mocks.permissions.includes(p)),
  }),
}));

vi.mock('../../hooks/useNotification.js', () => ({
  useNotification: () => ({
    toastSuccess: mocks.toastSuccess,
    toastError: mocks.toastError,
  }),
}));

import { DocumentsPanel } from './DocumentsPanel.jsx';

const PIECES = [{ code: 'ETAT', libelle: 'État de situation' }];

const DOCUMENTS = [
  {
    id: 2,
    dossier_id: 42,
    piece_code: 'ETAT',
    piece_libelle: 'État de situation',
    nom_fichier: 'etat-v2.pdf',
    taille: 1024,
    version: 2,
    remplace: 1,
    remplace_nom_fichier: 'etat-v1.pdf',
    remplace_version: 1,
    motif_remplacement: 'scan illisible',
    upload_par: 5,
    upload_par_username: 'agent',
    created_at: '2026-01-10 10:00:00',
  },
  {
    id: 1,
    dossier_id: 42,
    piece_code: 'ETAT',
    piece_libelle: 'État de situation',
    nom_fichier: 'etat-v1.pdf',
    taille: 2048,
    version: 1,
    remplace: null,
    upload_par: 5,
    upload_par_username: 'agent',
    created_at: '2026-01-05 09:00:00',
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  mocks.user = { id: 5 };
  mocks.permissions = ['upload_document', 'manage_documents'];
  mocks.getDocuments.mockResolvedValue(DOCUMENTS);
});

describe('Pièces jointes — versions', () => {
  it('affiche la version et la pièce qu’elle remplace', async () => {
    render(<DocumentsPanel dossierId={42} dossierStatut="EN_TRAITEMENT" pieces={PIECES} />);

    await waitFor(() => {
      expect(screen.getByText('etat-v2.pdf')).toBeTruthy();
    });
    expect(screen.getByText('Version 2')).toBeTruthy();
    expect(screen.getByText('Version 1')).toBeTruthy();
    expect(screen.getByText(/remplace : etat-v1.pdf \(v1\)/)).toBeTruthy();
  });

  it('propose la suppression sur toutes les versions, y compris les doublons', async () => {
    render(<DocumentsPanel dossierId={42} dossierStatut="EN_TRAITEMENT" pieces={PIECES} />);

    await waitFor(() => {
      expect(screen.getByText('etat-v2.pdf')).toBeTruthy();
    });
    // Les deux versions peuvent être retirées : un doublon n'est pas
    // prisonnier parce qu'une version plus récente existe.
    const boutons = screen.getAllByTitle('Supprimer la pièce');
    expect(boutons.length).toBe(2);
  });

  it('permet au chef de division de supprimer une pièce déposée par un autre', async () => {
    mocks.user = { id: 99 };
    mocks.permissions = ['verifier_dossier'];

    render(<DocumentsPanel dossierId={42} dossierStatut="SOUMIS_A_VERIFICATION" pieces={PIECES} />);

    await waitFor(() => {
      expect(screen.getByText('etat-v2.pdf')).toBeTruthy();
    });
    expect(screen.getAllByTitle('Supprimer la pièce').length).toBe(2);
  });

  it('supprime une version antérieure après confirmation', async () => {
    mocks.permissions = ['verifier_dossier'];

    render(<DocumentsPanel dossierId={42} dossierStatut="SOUMIS_A_VERIFICATION" pieces={PIECES} />);

    await waitFor(() => {
      expect(screen.getByText('etat-v1.pdf')).toBeTruthy();
    });
    // La version 1 est la plus ancienne : elle doit néanmoins être supprimable.
    fireEvent.click(screen.getAllByTitle('Supprimer la pièce')[1]);

    await waitFor(() => {
      expect(screen.getByText('Supprimer la pièce jointe')).toBeTruthy();
    });
    fireEvent.click(screen.getByRole('button', { name: 'Supprimer' }));

    await waitFor(() => {
      expect(mocks.deleteDocument).toHaveBeenCalledWith(42, 1);
    });
  });

  it('demande le motif du remplacement quand la pièce a déjà été déposée', async () => {
    render(<DocumentsPanel dossierId={42} dossierStatut="EN_TRAITEMENT" pieces={PIECES} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Pièce concernée/)).toBeTruthy();
    });
    // La pièce n'est pas encore choisie : le motif n'a pas lieu d'être.
    expect(screen.queryByLabelText(/Motif du remplacement/)).toBeNull();

    fireEvent.change(screen.getByLabelText(/Pièce concernée/), {
      target: { value: 'ETAT' },
    });
    expect(screen.getByLabelText(/Motif du remplacement/)).toBeTruthy();
  });
});
