import apiClient from './apiClient.js';

export const dossierService = {
  list: (params) => apiClient.get('/dossiers', { params }).then((r) => r.data),
  get: (id) => apiClient.get(`/dossiers/${id}`).then((r) => r.data),
  getStatut: (id) => apiClient.get(`/dossiers/${id}/statut`).then((r) => r.data),
  create: (data) => apiClient.post('/dossiers', data).then((r) => r.data),
  update: (id, data) => apiClient.put(`/dossiers/${id}`, data).then((r) => r.data),
  orienter: (id, data) => apiClient.post(`/dossiers/${id}/orienter`, data).then((r) => r.data),
  affecter: (id, data) => apiClient.post(`/dossiers/${id}/affecter`, data).then((r) => r.data),
  traiter: (id, data) => apiClient.post(`/dossiers/${id}/traiter`, data).then((r) => r.data),
  verifier: (id, data) => apiClient.post(`/dossiers/${id}/verifier`, data).then((r) => r.data),
  valider: (id, data) => apiClient.post(`/dossiers/${id}/valider`, data).then((r) => r.data),
  signer: (id, data) => apiClient.post(`/dossiers/${id}/signer`, data).then((r) => r.data),
  cloturer: (id) => apiClient.post(`/dossiers/${id}/cloturer`).then((r) => r.data),
  archiver: (id) => apiClient.post(`/dossiers/${id}/archiver`).then((r) => r.data),
  transition: (id, toStatus, details) =>
    apiClient.post(`/workflow/${id}/transition`, { toStatus, details }).then((r) => r.data),
};

export default dossierService;