import apiClient from './apiClient.js';

/**
 * Performance par utilisateur.
 *
 * Volontairement distinct de `statistiqueService`, qui porte les statistiques
 * du SERVICE (combien de dossiers en circulation). Ici, la question est
 * « qu'ai-je fait, moi » — un point de vue individuel qui n'a pas le même
 * sens pour un chef de division et pour un vérificateur.
 */
const base = '/performance';

export const performanceService = {
  /** Mes propres indicateurs. */
  moi: () => apiClient.get(`${base}/moi`).then((r) => r.data),

  /**
   * Tableau d'une équipe.
   *
   * Le serveur le refuse (403) à un agent simple et limite un chef de division à
   * sa division. L'écran ne fait donc pas semblant de filtrer : si l'appel
   * échoue, il affiche l'avertissement plutôt qu'un tableau vide qui ferait
   * croire qu'il n'y a personne à superviser.
   */
  equipe: () => apiClient.get(`${base}/equipe`).then((r) => r.data),

  synthese: () => apiClient.get(`${base}/synthese`).then((r) => r.data),

  /** Indicateurs d'un agent précis. */
  agent: (id) => apiClient.get(`${base}/agent/${id}`).then((r) => r.data),
};

export default performanceService;
