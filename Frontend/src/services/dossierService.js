import apiClient from './apiClient.js';

export const dossierService = {
  list: (params) => apiClient.get('/dossiers', { params }).then((r) => r.data),
  get: (id) => apiClient.get(`/dossiers/${id}`).then((r) => r.data),
  getStatut: (id) => apiClient.get(`/dossiers/${id}/statut`).then((r) => r.data),
  getTracabilite: (id) => apiClient.get(`/dossiers/${id}/tracabilite`).then((r) => r.data),
  getDepouillement: (id) => apiClient.get(`/dossiers/${id}/depouillement`).then((r) => r.data),
  saveDepouillement: (id, data) =>
    apiClient.post(`/dossiers/${id}/depouillement`, data).then((r) => r.data),

  // Mandatement (division Secours)
  getMandatement: (id) => apiClient.get(`/dossiers/${id}/mandatement`).then((r) => r.data),
  saveMandatement: (id, data) =>
    apiClient.post(`/dossiers/${id}/mandatement`, data).then((r) => r.data),
  marquerPieceMandatement: (id, piece) =>
    apiClient.post(`/dossiers/${id}/mandatement/piece`, { piece }).then((r) => r.data),
  ordonnancerMandatement: (id) =>
    apiClient.post(`/dossiers/${id}/mandatement/ordonnancer`, {}).then((r) => r.data),
  liquiderMandatement: (id) =>
    apiClient.post(`/dossiers/${id}/mandatement/liquider`, {}).then((r) => r.data),

  // Commentaires internes (article 2.8)
  getCommentaires: (id) =>
    apiClient.get(`/dossiers/${id}/commentaires`).then((r) => r.data),
  addCommentaire: (id, contenu) =>
    apiClient.post(`/dossiers/${id}/commentaires`, { contenu }).then((r) => {
      // Notifier après ajout de commentaire
      return r.data;
    }),
  deleteCommentaire: (id, cid) =>
    apiClient.delete(`/dossiers/${id}/commentaires/${cid}`).then((r) => r.data),

  create: (data) =>
    apiClient.post('/dossiers', data).then(async (r) => {
      // Notifier après création de dossier
      return r.data;
    }),

  /**
   * Recherche un demandeur par son matricule, pour pré-remplir le formulaire.
   *
   * C'est une aide à la saisie, pas un contrôle bloquant : la réponse indique ce
   * qui est déjà connu, et la secrétaire décide de l'utiliser ou non. Un client
   * revient légitimement avec un nouveau dossier.
   */
  rechercherParMatricule: (matricule) =>
    apiClient.get('/dossiers/rechercher-par-matricule', { params: { matricule } }).then((r) => r.data),
  update: (id, data) => apiClient.put(`/dossiers/${id}`, data).then((r) => r.data),
  orienter: (id, data) =>
    apiClient.post(`/dossiers/${id}/orienter`, data).then(async (r) => {
      // Notifier après orientation
      return r.data;
    }),
  affecter: (id, data) =>
    apiClient.post(`/dossiers/${id}/affecter`, data).then(async (r) => {
      // Notifier après affectation
      return r.data;
    }),
  traiter: (id, data) =>
    apiClient.post(`/dossiers/${id}/traiter`, data).then(async (r) => {
      // Notifier après traitement
      return r.data;
    }),
  verifier: (id, data) =>
    apiClient.post(`/dossiers/${id}/verifier`, data).then(async (r) => {
      // Notifier après vérification
      return r.data;
    }),
  valider: (id, data) =>
    apiClient.post(`/dossiers/${id}/valider`, data).then(async (r) => {
      // Notifier après validation
      return r.data;
    }),
  signer: (id, data) =>
    apiClient.post(`/dossiers/${id}/signer`, data).then(async (r) => {
      // Notifier après signature
      return r.data;
    }),
  /* Actions en masse : le serveur renvoie { reussis, echecs[] } — un échec
     sur un dossier n'annule pas les autres. */
  masseValider: (ids, data = {}) =>
    apiClient.post('/dossiers/masse/valider', { ids, ...data }).then(async (r) => {
      // Notifier après validation en masse
      return r.data;
    }),
  masseSigner: (ids, data = {}) =>
    apiClient.post('/dossiers/masse/signer', { ids, ...data }).then(async (r) => {
      // Notifier après signature en masse
      return r.data;
    }),
  cloturer: (id) =>
    apiClient.post(`/dossiers/${id}/cloturer`).then(async (r) => {
      // Notifier après clôture
      return r.data;
    }),
  archiver: (id) =>
    apiClient.post(`/dossiers/${id}/archiver`).then(async (r) => {
      // Notifier après archivage
      return r.data;
    }),
  delete: (id) =>
    apiClient.delete(`/dossiers/${id}`).then((r) => r.data),

  transition: (id, toStatus, details) =>
    apiClient.post(`/workflow/${id}/transition`, { toStatus, details }).then(async (r) => {
      // Notifier après transition de statut
      return r.data;
    }),
};

export default dossierService;