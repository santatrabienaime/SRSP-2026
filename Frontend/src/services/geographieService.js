import apiClient from './apiClient.js';

/**
 * Module géographique : antennes, districts et rattachement des dossiers.
 *
 * Le service couvre six districts répartis sur deux antennes depuis 2022.
 * Cette dimension existait dans l'organigramme officiel et nulle part dans
 * la plateforme : un dossier ne disait pas de quel district venait le
 * demandeur. L'écran « Territoire » l'expose enfin.
 *
 * Le rattachement est un acte d'administration : il engage la compétence
 * territoriale de l'antenne. Le serveur en contrôle l'accès (403) ; le client
 * se contente de signaler l'échec.
 */
export const geographieService = {
  /** Antennes et districts du service, en une seule lecture. */
  referentiel: () => apiClient.get('/geographie/referentiel').then((r) => r.data),

  /** Antennes du service. */
  antennes: () => apiClient.get('/geographie/antennes').then((r) => r.data || []),

  /** Districts, tous ou ceux d'une antenne précise (`antenne_id`). */
  districts: (params) =>
    apiClient.get('/geographie/districts', { params }).then((r) => r.data || []),

  /** Synthèse par antenne ; `division_id` restreint le périmètre. */
  synthese: (params) =>
    apiClient.get('/geographie/synthese', { params }).then((r) => r.data),

  /** District actuellement applicable à un dossier (ou null). */
  districtCourant: (dossierId) =>
    apiClient.get(`/geographie/dossiers/${dossierId}/district`).then((r) => r.data),

  /**
   * Rattache un dossier à un district.
   *
   * L'historisation est faite par le serveur : l'ancienne ligne courante est
   * marquée non courante plutôt que supprimée, pour que « quel district était
   * le sien au moment où ce dossier a été ouvert » garde une réponse.
   */
  rattacher: (dossierId, data) =>
    apiClient.post(`/geographie/dossiers/${dossierId}/district`, data).then((r) => r.data),

  /** Rattachements successifs d'un dossier. */
  historique: (dossierId) =>
    apiClient
      .get(`/geographie/dossiers/${dossierId}/district/historique`)
      .then((r) => r.data || []),
};

export default geographieService;
