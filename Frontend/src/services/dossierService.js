import apiClient from './apiClient.js';

export const dossierService = {
  list: (params) => apiClient.get('/dossiers', { params }).then((r) => r.data),
  get: (id) => apiClient.get(`/dossiers/${id}`).then((r) => r.data),
  getStatut: (id) => apiClient.get(`/dossiers/${id}/statut`).then((r) => r.data),
  getTracabilite: (id) => apiClient.get(`/dossiers/${id}/tracabilite`).then((r) => r.data),
  getDepouillement: (id) => apiClient.get(`/dossiers/${id}/depouillement`).then((r) => r.data),
  saveDepouillement: (id, data) =>
    apiClient.post(`/dossiers/${id}/depouillement`, data).then((r) => r.data),

  // Liquidation de pension (division Pension)
  getLiquidationPension: (id) =>
    apiClient.get(`/dossiers/${id}/liquidation-pension`).then((r) => r.data),
  saveLiquidationPension: (id, data) =>
    apiClient.post(`/dossiers/${id}/liquidation-pension`, data).then((r) => r.data),

  // Décompte d'avance (division Solde)
  getDecompteAvance: (id) =>
    apiClient.get(`/dossiers/${id}/decompte-avance`).then((r) => r.data),
  saveDecompteAvance: (id, data) =>
    apiClient.post(`/dossiers/${id}/decompte-avance`, data).then((r) => r.data),

  // Contrôle du décompte (Chef de Division Solde)
  getControleDecompte: (id) =>
    apiClient.get(`/dossiers/${id}/controle-decompte`).then((r) => r.data),
  saveControleDecompte: (id, data) =>
    apiClient.post(`/dossiers/${id}/controle-decompte`, data).then((r) => r.data),

  // Commentaires internes
  getCommentaires: (id) =>
    apiClient.get(`/dossiers/${id}/commentaires`).then((r) => r.data),
  addCommentaire: (id, contenu) =>
    apiClient.post(`/dossiers/${id}/commentaires`, { contenu }).then((r) => r.data),
  deleteCommentaire: (id, cid) =>
    apiClient.delete(`/dossiers/${id}/commentaires/${cid}`).then((r) => r.data),

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
  create: (data) => apiClient.post('/dossiers', data).then((r) => r.data),

  /**
   * Recherche un demandeur par son CIN, pour pré-remplir le formulaire.
   *
   * C'est une aide à la saisie, pas un contrôle bloquant : la réponse indique ce
   * qui est déjà connu, et la secrétaire décide de l'utiliser ou non. Un client
   * revient légitimement avec un nouveau dossier.
   */
  rechercherParCIN: (matricule) =>
    apiClient.get('/dossiers/rechercher-par-cin', { params: { matricule } }).then((r) => r.data),
  update: (id, data) => apiClient.put(`/dossiers/${id}`, data).then((r) => r.data),
  orienter: (id, data) => apiClient.post(`/dossiers/${id}/orienter`, data).then((r) => r.data),
  affecter: (id, data) => apiClient.post(`/dossiers/${id}/affecter`, data).then((r) => r.data),
  traiter: (id, data) => apiClient.post(`/dossiers/${id}/traiter`, data).then((r) => r.data),
  verifier: (id, data) => apiClient.post(`/dossiers/${id}/verifier`, data).then((r) => r.data),
  valider: (id, data) => apiClient.post(`/dossiers/${id}/valider`, data).then((r) => r.data),
  signer: (id, data) => apiClient.post(`/dossiers/${id}/signer`, data).then((r) => r.data),
  /* Actions en masse : le serveur renvoie { reussis, echecs[] } — un échec
     sur un dossier n'annule pas les autres. */
  masseValider: (ids, data = {}) =>
    apiClient.post('/dossiers/masse/valider', { ids, ...data }).then((r) => r.data),
  masseSigner: (ids, data = {}) =>
    apiClient.post('/dossiers/masse/signer', { ids, ...data }).then((r) => r.data),
  cloturer: (id) => apiClient.post(`/dossiers/${id}/cloturer`).then((r) => r.data),
  archiver: (id) => apiClient.post(`/dossiers/${id}/archiver`).then((r) => r.data),
  transition: (id, toStatus, details) =>
    apiClient.post(`/workflow/${id}/transition`, { toStatus, details }).then((r) => r.data),
};

export default dossierService;