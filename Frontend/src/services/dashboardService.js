import apiClient from './apiClient.js';

/**
 * Récupère une valeur numérique depuis une réponse serveur.
 * Gère le cas où la valeur est un objet { count: X } ou directement un nombre.
 */
function extractValue(val) {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'object' && val.count !== undefined) return val.count;
  return typeof val === 'number' ? val : parseInt(val, 10) || 0;
}

export const dashboardService = {
  summary: () => apiClient.get('/dashboard/summary').then((r) => {
    const d = r.data || {};
    return {
      total: extractValue(d.total),
      valides: extractValue(d.valides),
      enCours: extractValue(d.enCours),
      enAttente: extractValue(d.enAttente),
      rejetes: extractValue(d.rejetes),
      aValider: extractValue(d.aValider),
      aSigner: extractValue(d.aSigner),
      aCloturer: extractValue(d.aCloturer),
      enRetard: extractValue(d.enRetard),
      aOrienter: extractValue(d.aOrienter),
      aTraiter: extractValue(d.aTraiter),
      aVerifier: extractValue(d.aVerifier),
      aCorriger: extractValue(d.aCorriger),
      termees: extractValue(d.termes),
      divisions: extractValue(d.divisions),
    };
  }),
  byDivision: () => apiClient.get('/dashboard/by-division').then((r) => r.data || []),
  byStatus: () => apiClient.get('/dashboard/by-status').then((r) => r.data || []),
  evolution: () => apiClient.get('/dashboard/evolution').then((r) => r.data || []),
  ressources: () => apiClient.get('/dashboard/ressources').then((r) => r.data || {}),
};

export default dashboardService;