import apiClient from './apiClient.js';

export const authService = {
  login: (identifiant, password) =>
    apiClient.post('/auth/login', { identifiant, password }).then((r) => r.data),
  me: () => apiClient.get('/auth/me').then((r) => r.data),
  logout: () => apiClient.post('/auth/logout').then((r) => r.data),
  changePassword: (ancien_mot_de_passe, nouveau_mot_de_passe) =>
    apiClient.put('/auth/password', { ancien_mot_de_passe, nouveau_mot_de_passe }).then((r) => r.data),

  /**
   * Demande de réinitialisation du mot de passe.
   *
   * La réponse du serveur est volontairement identique que le compte existe
   * ou non : l'interface n'a donc rien de plus à afficher qu'une confirmation.
   */
  forgotPassword: (identifiant) =>
    apiClient.post('/auth/password/forgot', { identifiant }).then((r) => r.data),

  /**
   * Consommation du code de réinitialisation.
   *
   * Le code est délivré par un administrateur après vérification d'identité ;
   * l'agent choisit ensuite lui-même son nouveau mot de passe.
   */
  resetPassword: (identifiant, code, nouveau_mot_de_passe) =>
    apiClient.post('/auth/password/reset', {
      identifiant, code, nouveau_mot_de_passe,
    }).then((r) => r.data),
};

export default authService;