import apiClient from './apiClient.js';

export const documentService = {
  list: (params) => apiClient.get('/documents', { params }).then((r) => r.data),
  /** Fiche d'un document, pour ouvrir son détail sans relire la liste. */
  get: (id) => apiClient.get(`/documents/${id}`).then((r) => r.data),
  upload: (formData) =>
    apiClient.post('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),
  valider: (id, valide) => apiClient.put(`/documents/${id}/valider`, { valide }).then((r) => r.data),
  remove: (id) => apiClient.delete(`/documents/${id}`).then((r) => r.data),
  download: (id) =>
    apiClient.get(`/documents/${id}/download`, { responseType: 'blob' }).then((r) => r.data),
};

export default documentService;