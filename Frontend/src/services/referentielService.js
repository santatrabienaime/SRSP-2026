import apiClient from './apiClient.js';

/**
 * Service de référentiel : types de dossiers, types de pièces, divisions, etc.
 */

export const referentielService = {
  /** Récupère une ressource par endpoint. */
  get: (endpoint) => apiClient.get(`/referentiel/${endpoint}`).then((r) => r.data || []),

  /** Liste des types de dossiers. */
  typesDossiers: () => apiClient.get('/referentiel/types-dossiers').then((r) => r.data || []),

  /** Crée un type de dossier. */
  ajouterTypeDossier: (data) => apiClient.post('/referentiel/types-dossiers', data).then((r) => r.data),

  /** Supprime un type de dossier. */
  supprimerTypeDossier: (id) => apiClient.delete(`/referentiel/types-dossiers/${id}`).then((r) => r.data),

  /** Liste des types de pièces. */
  typesPieces: () => apiClient.get('/referentiel/types-pieces').then((r) => r.data || []),

  /** Crée un type de pièce. */
  ajouterTypePiece: (data) => apiClient.post('/referentiel/types-pieces', data).then((r) => r.data),

  /** Supprime un type de pièce. */
  supprimerTypePiece: (id) => apiClient.delete(`/referentiel/types-pieces/${id}`).then((r) => r.data),

  /** Liste des divisions. */
  divisions: () => apiClient.get('/referentiel/divisions').then((r) => r.data || []),

  /** Crée une division. */
  ajouterDivision: (data) => apiClient.post('/referentiel/divisions', data).then((r) => r.data),

  /** Supprime une division. */
  supprimerDivision: (id) => apiClient.delete(`/referentiel/divisions/${id}`).then((r) => r.data),
};

export default referentielService;