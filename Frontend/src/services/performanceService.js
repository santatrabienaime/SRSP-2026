import apiClient from './apiClient.js';

/**
 * Module « Performance » — indicateurs de performance du service.
 *
 * Le serveur applique le **périmètre** de l'utilisateur sur chacun de ces
 * points d'entrée : un chef de division ne reçoit que sa division, un agent
 * que ses propres dossiers. Aucun paramètre de périmètre n'est donc envoyé
 * d'ici — l'isolement se fait sur les données, pas seulement à l'écran.
 *
 * Aucun calcul n'est refait côté client : le service renvoie exactement ce
 * qu'a mesuré le serveur (volumes, délais, taux).
 */
export const performanceService = {
  /** Indicateurs globaux : volumes par statut, délai moyen, taux de traitement. */
  stats: () =>
    apiClient.get('/performance/stats').then((r) => r.data || {}),

  /** Dossiers dont la date limite est dépassée (les plus anciens d'abord). */
  enRetard: () =>
    apiClient.get('/performance/en-retard').then((r) => (Array.isArray(r.data) ? r.data : [])),

  /** Performance par division. */
  parDivision: () =>
    apiClient.get('/performance/par-division').then((r) => (Array.isArray(r.data) ? r.data : [])),

  /** Performance par agent. */
  parAgent: () =>
    apiClient.get('/performance/par-agent').then((r) => (Array.isArray(r.data) ? r.data : [])),

  /** Évolution du volume des dossiers sur douze mois. */
  evolution: () =>
    apiClient.get('/performance/evolution').then((r) => (Array.isArray(r.data) ? r.data : [])),
};

export default performanceService;
