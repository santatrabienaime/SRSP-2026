import apiClient from './apiClient.js';
import { envoyerMessageAction } from './messageService.js';

/**
 * Aide pour envoyer un message après une action métier.
 * Le destinataire est extrait des données si présent, sinon on ne spécifie pas
 * (le serveur saura à qui notifier selon le rôle de l'action).
 */
const notifierApresAction = async (dossierId, action, message, destinataireId, type = 'INFO') => {
  await envoyerMessageAction({
    dossier_id: dossierId,
    action,
    message,
    destinataire_id: destinataireId,
    type,
  });
};

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
      envoyerMessageAction({
        dossier_id: id,
        action: 'COMMENTAIRE',
        message: `Nouveau commentaire ajouté : "${contenu}"`,
        type: 'INFO',
      });
      return r;
    }),
  deleteCommentaire: (id, cid) =>
    apiClient.delete(`/dossiers/${id}/commentaires/${cid}`).then((r) => r.data),

  create: (data) =>
    apiClient.post('/dossiers', data).then(async (r) => {
      // Notifier après création de dossier
      await envoyerMessageAction({
        dossier_id: r.data?.id || r.data?.numero || null,
        action: 'CREATION',
        message: `Nouveau dossier créé : "${data.objet}"`,
        type: 'INFO',
      });
      return r;
    }),

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
  orienter: (id, data) =>
    apiClient.post(`/dossiers/${id}/orienter`, data).then(async (r) => {
      // Notifier après orientation
      await envoyerMessageAction({
        dossier_id: id,
        action: 'ORIENTATION',
        message: `Dossier orienté : "${data.objet || ''}"`,
        destinataire_id: data.agent_id || data.division_id,
        type: 'INFO',
      });
      return r;
    }),
  affecter: (id, data) =>
    apiClient.post(`/dossiers/${id}/affecter`, data).then(async (r) => {
      // Notifier après affectation
      await envoyerMessageAction({
        dossier_id: id,
        action: 'AFFECTATION',
        message: `Dossier affecté à un agent`,
        destinataire_id: data.agent_id,
        type: 'INFO',
      });
      return r;
    }),
  traiter: (id, data) =>
    apiClient.post(`/dossiers/${id}/traiter`, data).then(async (r) => {
      // Notifier après traitement
      await envoyerMessageAction({
        dossier_id: id,
        action: 'TRAITEMENT',
        message: `Dossier en traitement : "${data.objet || ''}"`,
        type: 'INFO',
      });
      return r;
    }),
  verifier: (id, data) =>
    apiClient.post(`/dossiers/${id}/verifier`, data).then(async (r) => {
      // Notifier après vérification
      await envoyerMessageAction({
        dossier_id: id,
        action: 'VERIFICATION',
        message: `Dossier vérifié : "${data.objet || ''}"`,
        type: 'INFO',
      });
      return r;
    }),
  valider: (id, data) =>
    apiClient.post(`/dossiers/${id}/valider`, data).then(async (r) => {
      // Notifier après validation
      await envoyerMessageAction({
        dossier_id: id,
        action: 'VALIDATION',
        message: `Dossier validé : "${data.objet || ''}"`,
        type: 'INFO',
      });
      return r;
    }),
  signer: (id, data) =>
    apiClient.post(`/dossiers/${id}/signer`, data).then(async (r) => {
      // Notifier après signature
      await envoyerMessageAction({
        dossier_id: id,
        action: 'SIGNATURE',
        message: `Dossier signé : "${data.objet || ''}"`,
        type: 'INFO',
      });
      return r;
    }),
  /* Actions en masse : le serveur renvoie { reussis, echecs[] } — un échec
     sur un dossier n'annule pas les autres. */
  masseValider: (ids, data = {}) =>
    apiClient.post('/dossiers/masse/valider', { ids, ...data }).then(async (r) => {
      // Notifier après validation en masse
      await envoyerMessageAction({
        dossier_id: ids[0],
        action: 'VALIDATION',
        message: `Validation en masse de ${ids.length} dossier(s)`,
        type: 'INFO',
      });
      return r;
    }),
  masseSigner: (ids, data = {}) =>
    apiClient.post('/dossiers/masse/signer', { ids, ...data }).then(async (r) => {
      // Notifier après signature en masse
      await envoyerMessageAction({
        dossier_id: ids[0],
        action: 'SIGNATURE',
        message: `Signature en masse de ${ids.length} dossier(s)`,
        type: 'INFO',
      });
      return r;
    }),
  cloturer: (id) =>
    apiClient.post(`/dossiers/${id}/cloturer`).then(async (r) => {
      // Notifier après clôture
      await envoyerMessageAction({
        dossier_id: id,
        action: 'CLOTURE',
        message: `Dossier clôturé`,
        type: 'INFO',
      });
      return r;
    }),
  archiver: (id) =>
    apiClient.post(`/dossiers/${id}/archiver`).then(async (r) => {
      // Notifier après archivage
      await envoyerMessageAction({
        dossier_id: id,
        action: 'ARCHIVAGE',
        message: `Dossier archivé`,
        type: 'INFO',
      });
      return r;
    }),
  transition: (id, toStatus, details) =>
    apiClient.post(`/workflow/${id}/transition`, { toStatus, details }).then(async (r) => {
      // Notifier après transition de statut
      await envoyerMessageAction({
        dossier_id: id,
        action: 'TRANSITION',
        message: `Statut modifié : ${toStatus}`,
        type: 'INFO',
      });
      return r;
    }),
};

export default dossierService;