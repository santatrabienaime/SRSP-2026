import apiClient from './apiClient.js';

/**
 * Signalements des dossiers bloqués.
 *
 * Deux points d'entrée, comme côté serveur :
 *   - `/dossiers/:id/signalements` : la fiche du dossier — ouvrir et lire ;
 *   - `/signalements` : la file de la hiérarchie — lister, prendre en charge,
 *     refermer.
 */
export const signalementService = {
  /* File de la hiérarchie, restreinte au périmètre par le serveur. */
  list: (params) => apiClient.get('/signalements', { params }).then((r) => r.data),
  get: (id) => apiClient.get(`/signalements/${id}`).then((r) => r.data),
  compte: () => apiClient.get('/signalements/compte').then((r) => r.data),

  /* Fiche du dossier. La lecture suit l'accès au dossier lui-même. */
  parDossier: (dossierId) =>
    apiClient.get(`/dossiers/${dossierId}/signalements`).then((r) => r.data),
  creer: (dossierId, data) =>
    apiClient.post(`/dossiers/${dossierId}/signalements`, data).then((r) => r.data),

  /* Actes de la hiérarchie. */
  prendre: (id) => apiClient.put(`/signalements/${id}/prendre`, {}).then((r) => r.data),
  resoudre: (id, data) =>
    apiClient.put(`/signalements/${id}/resoudre`, data).then((r) => r.data),
};

export default signalementService;
