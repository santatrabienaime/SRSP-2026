import apiClient from './apiClient.js';

/**
 * Module d'immatriculation de la Coordination.
 *
 * Trois objets, dans l'ordre où ils se produisent : l'immatriculation et sa
 * référence attribuée, l'insertion en paie du nouvel arrivant, et les
 * changements de mode de paiement.
 */
export const immatriculationService = {
  list: (params) =>
    apiClient.get('/immatriculations', { params }).then((r) => r.data || []),

  get: (id) =>
    apiClient.get(`/immatriculations/${id}`).then((r) => r.data),

  create: (data) =>
    apiClient.post('/immatriculations', data).then((r) => r.data),

  update: (id, data) =>
    apiClient.put(`/immatriculations/${id}`, data).then((r) => r.data),

  /** Éléments requis pour insérer un nouvel arrivant dans les systèmes de paie. */
  createInsertion: (id, data) =>
    apiClient.post(`/immatriculations/${id}/insertion`, data).then((r) => r.data),

  updateInsertion: (id, insertionId, data) =>
    apiClient.put(`/immatriculations/${id}/insertion/${insertionId}`, data).then((r) => r.data),

  /** Demande de changement de mode de paiement — le motif est obligatoire. */
  createChangement: (id, data) =>
    apiClient.post(`/immatriculations/${id}/paiement`, data).then((r) => r.data),

  updateChangement: (id, paiementId, data) =>
    apiClient.put(`/immatriculations/${id}/paiement/${paiementId}`, data).then((r) => r.data),

  /** Volumes par type de demande, période et division. */
  volumes: (params) =>
    apiClient.get('/immatriculations/volumes', { params }).then((r) => r.data || {}),
};

export default immatriculationService;
