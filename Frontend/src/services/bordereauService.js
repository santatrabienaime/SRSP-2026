import apiClient from './apiClient.js';

export const bordereauService = {
  list: (params = {}) => apiClient.get('/bordereaux', { params }).then((r) => r.data),
  get: (id) => apiClient.get(`/bordereaux/${id}`).then((r) => r.data),
  create: (data) => apiClient.post('/bordereaux', data).then((r) => r.data),
  update: (id, data) => apiClient.put(`/bordereaux/${id}`, data).then((r) => r.data),
  addDossiers: (id, dossiers) => apiClient.post(`/bordereaux/${id}/dossiers`, { dossiers }).then((r) => r.data),
  removeDossier: (id, dossierId) => apiClient.delete(`/bordereaux/${id}/dossiers/${dossierId}`).then((r) => r.data),
  emit: (id) => apiClient.post(`/bordereaux/${id}/emit`).then((r) => r.data),
  acknowledge: (id) => apiClient.post(`/bordereaux/${id}/acknowledge`).then((r) => r.data),
  archive: (id) => apiClient.post(`/bordereaux/${id}/archive`).then((r) => r.data),
  remove: (id) => apiClient.delete(`/bordereaux/${id}`).then((r) => r.data),
  eligibles: (division_id) => apiClient.get('/bordereaux/eligibles', { params: { division_id } }).then((r) => r.data),
  stats: () => apiClient.get('/bordereaux/stats').then((r) => r.data),
};

export default bordereauService;