import apiClient from './apiClient.js';

export const courrierService = {
  list: (params) => apiClient.get('/courriers', { params }).then((r) => r.data),
  get: (id) => apiClient.get(`/courriers/${id}`).then((r) => r.data),
  create: (data) => apiClient.post('/courriers', data).then((r) => r.data),
  updateStatut: (id, statut) => apiClient.put(`/courriers/${id}/statut`, { statut }).then((r) => r.data),
};

export default courrierService;