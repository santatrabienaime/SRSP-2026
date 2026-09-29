import apiClient from './apiClient.js';

export const agentService = {
  list: (params) => apiClient.get('/agents', { params }).then((r) => r.data),
  /** Fiche d'un agent : une requête ciblée plutôt que la liste complète filtrée. */
  get: (id) => apiClient.get(`/agents/${id}`).then((r) => r.data),
  create: (data) => apiClient.post('/agents', data).then((r) => r.data),
  update: (id, data) => apiClient.put(`/agents/${id}`, data).then((r) => r.data),
};

export default agentService;