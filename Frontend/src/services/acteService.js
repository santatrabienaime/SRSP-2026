import apiClient from './apiClient.js';

/* Le registre des actes. Les réponses sont enveloppées : `list` rend
 * `{ lignes, total }` et `chronologie` rend `{ annee, familles }`. La liste des
 * courriers, elle, rend un tableau nu — deux formes pour deux registres, parce
 * que le registre des actes doit aussi dire combien il compte, et qu'un tableau
 * ne sait pas dire s'il est tronqué. */
export const acteService = {
  list: (params) => apiClient.get('/actes', { params }).then((r) => r.data),
  get: (id) => apiClient.get(`/actes/${id}`).then((r) => r.data),
  create: (data) => apiClient.post('/actes', data).then((r) => r.data),
  annuler: (id, motif) => apiClient.put(`/actes/${id}/annuler`, { motif }).then((r) => r.data),
  chronologie: (annee) => apiClient.get('/actes/chronologie', { params: { annee } }).then((r) => r.data),
  types: () => apiClient.get('/actes/types').then((r) => r.data),
  creerType: (data) => apiClient.post('/actes/types', data).then((r) => r.data),
};

export default acteService;
