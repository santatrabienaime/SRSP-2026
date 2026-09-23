import apiClient from './apiClient.js';

export const authService = {
  login: (identifiant, password) =>
    apiClient.post('/auth/login', { identifiant, password }).then((r) => r.data),
  me: () => apiClient.get('/auth/me').then((r) => r.data),
  logout: () => apiClient.post('/auth/logout').then((r) => r.data),
  changePassword: (ancien_mot_de_passe, nouveau_mot_de_passe) =>
    apiClient.put('/auth/password', { ancien_mot_de_passe, nouveau_mot_de_passe }).then((r) => r.data),
};

export default authService;