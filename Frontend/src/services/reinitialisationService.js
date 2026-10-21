import apiClient from './apiClient.js';

/**
 * Demandes de réinitialisation de mot de passe — côté administration.
 *
 * L'administrateur vérifie l'identité du demandeur, puis délivre un code à
 * usage unique. Le code lui est renvoyé **une seule fois**, ici : il n'est
 * pas stocké, il n'est donc pas reconsultable.
 */
export const reinitialisationService = {
  /** Demandes, les plus récentes d'abord. */
  list: (params) =>
    apiClient.get('/reinitialisations', { params }).then((r) => r.data || []),

  /** Détail d'une demande. */
  get: (id) =>
    apiClient.get(`/reinitialisations/${id}`).then((r) => r.data),

  /** Délivre un code de réinitialisation. Le code est renvoyé une fois. */
  genererCode: (id, motif) =>
    apiClient.post(`/reinitialisations/${id}/code`, { motif }).then((r) => r.data),

  /** Annule une demande. */
  annuler: (id, motif) =>
    apiClient.post(`/reinitialisations/${id}/annuler`, { motif }).then((r) => r.data),
};

export default reinitialisationService;
