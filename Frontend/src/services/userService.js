import apiClient from './apiClient.js';

export const userService = {
  list: () => apiClient.get('/users').then((r) => r.data),
  create: (data) => apiClient.post('/users', data).then((r) => r.data),
  update: (id, data) => apiClient.put(`/users/${id}`, data).then((r) => r.data),
  /* Active / désactive un compte. La bascule est côté serveur (NOT actif) :
     l'envoyer depuis l'interface permettrait de réactiver un compte verrouillé
     en mentant sur son état réel. */
  toggle: (id) => apiClient.put(`/users/${id}/toggle`).then((r) => r.data),
  remove: (id) => apiClient.delete(`/users/${id}`).then((r) => r.data),
  resetPassword: (id, password) =>
    apiClient.post(`/users/${id}/reset-password`, { password }).then((r) => r.data),
};

export default userService;
