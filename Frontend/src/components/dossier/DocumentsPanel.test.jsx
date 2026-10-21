import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

/**
 * Pièces jointes — versionnage.
 *
 * Un dépôt ne remplace jamais un fichier : il en devient la version
 * suivante, et la version précédente est conservée. Ce qui est éprouvé ici :
 * les versions sont regroupées par pièce, la version remplacée est nommée, et
 * la suppression n'est proposée que sur la version la plus récente — le
 * serveur refusant (409) de retirer une version antérieure.
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

  it('ne propose la suppression que sur la version la plus récente', async () => {
    render(<DocumentsPanel dossierId={42} dossierStatut="EN_TRAITEMENT" pieces={PIECES} />);

    await waitFor(() => {
      expect(screen.getByText('etat-v2.pdf')).toBeTruthy();
    });
    // Un seul bouton de suppression : celui de la version 2.
    const boutons = screen.getAllByTitle('Supprimer la pièce');
    expect(boutons.length).toBe(1);
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
