import apiClient from './apiClient.js';

/**
 * Personnel : la fiche d'une personne et son compte de connexion.
 *
 * Les deux étaient gérés par deux services distincts (`agentService` pour les
 * fiches, `userService` pour les comptes), ce qui laissait créer un compte sans
 * personne et une personne sans compte. Un seul service, un seul écran : la
 * personne et son accès s'écrivent ensemble.
 */
export const personnelService = {
  list: () => apiClient.get('/personnel').then((r) => r.data),
  get: (id) => apiClient.get(`/personnel/${id}`).then((r) => r.data),
  create: (data) => apiClient.post('/personnel', data).then((r) => r.data),
  update: (id, data) => apiClient.put(`/personnel/${id}`, data).then((r) => r.data),
  /* La bascule est faite côté serveur (fiche + compte), pour qu'un compte ne
     reste pas capable de se connecter à une personne désactivée. */
  toggle: (id) => apiClient.put(`/personnel/${id}/toggle`).then((r) => r.data),
  resetPassword: (id, password) =>
    apiClient.post(`/personnel/${id}/reset-password`, { password }).then((r) => r.data),
  remove: (id) => apiClient.delete(`/personnel/${id}`).then((r) => r.data),
};

export default personnelService;
