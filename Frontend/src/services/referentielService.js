import apiClient from './apiClient.js';

/**
 * Service de référentiel : types de dossiers, types de pièces, divisions, etc.
 */

export const referentielService = {
  /** Récupère une ressource par endpoint. */
  get: (endpoint) => {
    if (!endpoint) return apiClient.get('/referentiel').then((r) => r.data || {});
    return apiClient.get(`/referentiel/${endpoint}`).then((r) => r.data || []);
  },

  /** Liste des types de dossiers. */
  typesDossiers: () => apiClient.get('/referentiel/types-dossiers').then((r) => r.data || []),

  /** Crée un type de dossier. */
  ajouterTypeDossier: (data) => apiClient.post('/referentiel/types-dossiers', data).then((r) => r.data),

  /** Supprime un type de dossier. */
  supprimerTypeDossier: (id) => apiClient.delete(`/referentiel/types-dossiers/${id}`).then((r) => r.data),

  /** Liste des types de pièces. Le périmètre (type de dossier, sous-type,
      division) est optionnel : sans filtre, la liste est complète. */
  typesPieces: (params) =>
    apiClient.get('/referentiel/types-pieces', { params }).then((r) => r.data || []),

  /** Crée un type de pièce. */
  ajouterTypePiece: (data) => apiClient.post('/referentiel/types-pieces', data).then((r) => r.data),

  /** Met à jour un type de pièce (libellé, obligation, périmètre, actif). */
  modifierTypePiece: (id, data) =>
    apiClient.put(`/referentiel/types-pieces/${id}`, data).then((r) => r.data),

  /** Désactive un type de pièce : il n'est plus proposé, son historique reste. */
  desactiverTypePiece: (id) =>
    apiClient.delete(`/referentiel/types-pieces/${id}`).then((r) => r.data),

  /* ── Sous-types de dossiers (types d'acte) ────────────────────────────── */

  /** Liste des sous-types, filtrable par type de dossier. */
  sousTypes: (params) =>
    apiClient.get('/referentiel/sous-types', { params }).then((r) => r.data || []),

  /** Crée un sous-type. */
  ajouterSousType: (data) => apiClient.post('/referentiel/sous-types', data).then((r) => r.data),

  /** Met à jour un sous-type (libellé, ordre, activation). */
  modifierSousType: (id, data) =>
    apiClient.put(`/referentiel/sous-types/${id}`, data).then((r) => r.data),

  /** Supprime un sous-type. Le serveur refuse si des dossiers le référencent. */
  supprimerSousType: (id) =>
    apiClient.delete(`/referentiel/sous-types/${id}`).then((r) => r.data),

  /* ── Schémas de données par type d'opération ────────────────────────
     Les champs que l'agent saisit pour une opération donnée. C'est ce qui
     permet au SRSP de faire évoluer ses formulaires sans développement. */
  schemasOperations: () =>
    apiClient.get('/referentiel/schemas-operations').then((r) => r.data || {}),
  remplacerSchemaOperation: (sousTypeId, corps) =>
    apiClient.put(`/referentiel/schemas-operations/${sousTypeId}`, corps).then((r) => r.data),

  /* ── Bilan de conformité ────────────────────────────────────────────
     Le registre des exigences du cahier : une par une, avec son état. Il
     est distinct des « fonctions » du personnel — ce sont les fonctions
     d'emploi, celles-ci sont les exigences de conformité. */
  bilan: (params) =>
    apiClient.get('/referentiel/bilan', { params }).then((r) => r.data || {}),
  conformite: (params) =>
    apiClient.get('/referentiel/conformite', { params }).then((r) => r.data || {}),
  postes: () =>
    apiClient.get('/referentiel/postes').then((r) => r.data || []),
  infosService: () =>
    apiClient.get('/referentiel/service').then((r) => r.data || {}),

  /** Liste des types de courriers. */
  typesCourriers: () => apiClient.get('/referentiel/types-courriers').then((r) => r.data || []),

  /** Crée un type de courrier. */
  ajouterTypeCourrier: (data) => apiClient.post('/referentiel/types-courriers', data).then((r) => r.data),

  /** Supprime un type de courrier. */
  supprimerTypeCourrier: (id) => apiClient.delete(`/referentiel/types-courriers/${id}`).then((r) => r.data),

  /** Liste des divisions. */
  divisions: () => apiClient.get('/divisions').then((r) => r.data || []),

  /** Crée une division. */
  ajouterDivision: (data) => apiClient.post('/divisions', data).then((r) => r.data),

  /** Supprime une division. */
  supprimerDivision: (id) => apiClient.delete(`/divisions/${id}`).then((r) => r.data),
};

export default referentielService;