import apiClient from './apiClient.js';

export const dossierService = {
  list: (params) => apiClient.get('/dossiers', { params }).then((r) => r.data),
  get: (id) => apiClient.get(`/dossiers/${id}`).then((r) => r.data),
  getStatut: (id) => apiClient.get(`/dossiers/${id}/statut`).then((r) => r.data),
  getTracabilite: (id) => apiClient.get(`/dossiers/${id}/tracabilite`).then((r) => r.data),

  /**
   * « À faire ensuite » : la prochaine action du dossier et l'acteur qui doit
   * l'accomplir. La règle est calculée par le serveur, en un seul endroit.
   */
  getProchaineAction: (id) =>
    apiClient.get(`/dossiers/${id}/prochaine-action`).then((r) => r.data),

  /**
   * Transmissions du dossier : bordereaux, expéditeur, destinataire, date et
   * référence.
   */
  getTransmissions: (id) =>
    apiClient.get(`/dossiers/${id}/transmissions`).then((r) => r.data || []),

  /** Publie un brouillon : le dossier entre dans le circuit. */
  publier: (id) => apiClient.post(`/dossiers/${id}/publier`, {}).then((r) => r.data),

  /** Mes brouillons : les dossiers saisis mais pas encore publiés. */
  mesBrouillons: (params) =>
    apiClient.get('/dossiers', { params: { ...params, brouillon: 1 } }).then((r) => r.data || []),
  getDepouillement: (id) => apiClient.get(`/dossiers/${id}/depouillement`).then((r) => r.data),
  /* La trace chronologique des contrôles : quelles pièces ont été contrôlées,
     par qui, et quand. La check-list montre l'état courant de chaque pièce ;
     l'historique répond à une autre question — « quand a-t-on contrôlé
     celle-ci ? », dans quel ordre. */
  getDepouillementHistorique: (id) =>
    apiClient.get(`/dossiers/${id}/depouillement/historique`).then((r) => r.data || []),
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

  /* ── Module Secours de décès ─────────────────────────────────────────
     Les cinq étapes du mandat : visa du contrôle financier, références du
     logiciel Secours, état d'émargement, signature de l'ordonnateur, cachet.
     L'« état » les rassemble toutes : c'est ainsi que l'agent les vit. */
  getSecoursEtat: (id) =>
    apiClient.get(`/dossiers/${id}/secours/etat`).then((r) => r.data),
  getSecoursReception: (id) =>
    apiClient.get(`/dossiers/${id}/secours/reception`).then((r) => r.data),
  getSecoursVisa: (id) =>
    apiClient.get(`/dossiers/${id}/secours/visa`).then((r) => r.data),
  enregistrerSecoursVisa: (id, data) =>
    apiClient.post(`/dossiers/${id}/secours/visa`, data).then((r) => r.data),
  getSecoursReferences: (id) =>
    apiClient.get(`/dossiers/${id}/secours/references`).then((r) => r.data),
  marquerSecoursReference: (id, code) =>
    apiClient.post(`/dossiers/${id}/secours/references/${code}`, {}).then((r) => r.data),
  getSecoursEmargement: (id) =>
    apiClient.get(`/dossiers/${id}/secours/emargement`).then((r) => r.data),
  genererSecoursEmargement: (id) =>
    apiClient.post(`/dossiers/${id}/secours/emargement`, {}).then((r) => r.data),
  signerSecoursEmargement: (id, beneficiaire, data) =>
    apiClient.put(`/dossiers/${id}/secours/emargement/${beneficiaire}`, data).then((r) => r.data),
  getSecoursSignature: (id) =>
    apiClient.get(`/dossiers/${id}/secours/signature`).then((r) => r.data),
  enregistrerSecoursSignature: (id, data) =>
    apiClient.post(`/dossiers/${id}/secours/signature`, data).then((r) => r.data),
  getSecoursCachet: (id) =>
    apiClient.get(`/dossiers/${id}/secours/cachet`).then((r) => r.data),
  apposerSecoursCachet: (id, data) =>
    apiClient.post(`/dossiers/${id}/secours/cachet`, data).then((r) => r.data),
  /* Archiver la copie signée : la dernière trace de l'acte de l'ordonnateur.
     Le serveur refuse si le mandat n'est pas signé — archiver dans le vide
     n'aurait aucun sens. */
  archiverSecoursSignature: (id) =>
    apiClient.post(`/dossiers/${id}/secours/signature/archiver`, {}).then((r) => r.data),

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
  demanderComplement: (id, data) =>
    apiClient.post(`/dossiers/${id}/demander-complement`, data).then((r) => r.data),
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
  delete: (id, motif) =>
    apiClient.delete(`/dossiers/${id}`, { data: { motif } }).then((r) => r.data),

  /* ── Trace des suppressions ───────────────────────────────────────────
     Un dossier supprimé n'existe plus : sans cette trace, la suppression
     serait muette. La table qui la porte survit au dossier. */
  listSuppressions: () =>
    apiClient.get('/dossiers/suppressions').then((r) => r.data || []),
  getSuppression: (id) =>
    apiClient.get(`/dossiers/suppressions/${id}`).then((r) => r.data),

  /* ── Pièces jointes ───────────────────────────────────────────────────
     Le fichier est envoyé en multipart ; le serveur valide l'extension, la
     taille et l'accès au dossier. */
  getDocuments: (id) =>
    apiClient.get(`/dossiers/${id}/documents`).then((r) => r.data || []),
  uploadDocument: (id, formData) =>
    apiClient
      .post(`/dossiers/${id}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data),
  downloadDocument: (id, documentId) =>
    apiClient
      .get(`/dossiers/${id}/documents/${documentId}/fichier`, { responseType: 'blob' })
      .then((r) => r.data),
  deleteDocument: (id, documentId) =>
    apiClient.delete(`/dossiers/${id}/documents/${documentId}`).then((r) => r.data),

  /* ── Données propres à l'opération ──────────────────────────────────
     Solde, Pensions et Secours portent, sur chacun de leurs dossiers, une
     ligne de données d'opération : la référence, la période, le montant et sa
     source. Elle appartient au dossier, d'où l'URL : /dossiers/:id/operation.

     Le type d'opération n'est pas transmis : le serveur le reprend du
     dossier, pour que la donnée ne puisse pas contredire le dossier qui la
     porte. */
  getOperation: (id) =>
    apiClient.get(`/dossiers/${id}/operation`).then((r) => r.data),

  /** Saisie des données d'opération. Un envoi partiel n'efface rien : le
      serveur n'écrit que les champs reçus. */
  saveOperation: (id, data) =>
    apiClient.put(`/dossiers/${id}/operation`, data).then((r) => r.data),

  /** Contrôle du chef de division : sa décision est conservée avec son auteur
      et sa date, et c'est elle qui distingue une opération contrôlée d'une
      opération seulement saisie. */
  controlerOperation: (id, data) =>
    apiClient.post(`/dossiers/${id}/operation/controler`, data).then((r) => r.data),

  /** Validation du montant. Le serveur refuse (422) si aucun montant n'est
      saisi : il n'y a alors rien à valider. */
  validerMontantOperation: (id, data = {}) =>
    apiClient.post(`/dossiers/${id}/operation/valider`, data).then((r) => r.data),

  /**
   * Télécharge la fiche de réception (PDF).
   */
  ficheReceptionPDF: (id) =>
    apiClient.get(`/dossiers/${id}/fiche-reception`, { responseType: 'blob' }).then((r) => r.data),

  transition: (id, toStatus, details) =>
    apiClient.post(`/workflow/${id}/transition`, { toStatus, details }).then(async (r) => {
      // Notifier après transition de statut
      return r.data;
    }),
};

export default dossierService;