import apiClient from './apiClient.js';

export const divisionService = {
  list: () => apiClient.get('/divisions').then((r) => r.data),
  /** Fiche d'une division : évite de charger les quatre pour en afficher une. */
  get: (id) => apiClient.get(`/divisions/${id}`).then((r) => r.data),
  create: (data) => apiClient.post('/divisions', data).then((r) => r.data),
  update: (id, data) => apiClient.put(`/divisions/${id}`, data).then((r) => r.data),
};

export default divisionService;