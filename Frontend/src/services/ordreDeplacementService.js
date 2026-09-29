import apiClient from './apiClient.js';

/**
 * Pièces de déplacement du Chef BAAF : ordres de route, ordres de mission,
 * autorisations de retrait de bon de caisse et notes d'intérim.
 *
 * Les transitions passent toutes par `transitionner` : le serveur applique la
 * permission propre à chaque étape, et l'interface n'a pas à les dupliquer.
 */
const base = '/ordres-deplacement';

export const ordreDeplacementService = {
  types: () => apiClient.get(`${base}/types`).then((r) => r.data),
  lister: (params) => apiClient.get(`${base}`, { params }).then((r) => r.data),
  get: (id) => apiClient.get(`${base}/${id}`).then((r) => r.data),
  tableauDeBord: () => apiClient.get(`${base}/tableau-de-bord`).then((r) => r.data),

  etablir: (data) => apiClient.post(`${base}`, data).then((r) => r.data),

  /**
   * Passage à l'étape suivante.
   *
   * `statut` détermine la permission vérifiée par le serveur : signer exige le
   * Chef de Service, établir et exécuter le BAAF. L'interface n'envoie donc que
   * le statut, jamais le nom de l'agent — celui-ci vient du jeton.
   */
  transitionner: (id, statut, complement = {}) =>
    apiClient.put(`${base}/${id}`, { statut, ...complement }).then((r) => r.data),

  /** Annulation, possible tant que la pièce n'est pas signée. */
  annuler: (id, motif) =>
    apiClient.delete(`${base}/${id}`, { data: { motif } }).then((r) => r.data),
};

export default ordreDeplacementService;
