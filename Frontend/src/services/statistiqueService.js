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

export const statistiqueService = {
  /**
   * Récupère les statistiques globales du service.
   * Retourne un objet avec les propriétés normalisées (toujours des nombres).
   */
  get: (params) => apiClient.get('/statistiques', { params }).then((r) => {
    const data = r.data || {};
    return {
      total: extractValue(data.total),
      valides: extractValue(data.valides),
      enCours: extractValue(data.enCours),
      enAttente: extractValue(data.enAttente),
      rejetes: extractValue(data.rejetes),
      tauxValidation: extractValue(data.tauxValidation),
      tauxRejet: extractValue(data.tauxRejet),
    };
  }),
};

export default statistiqueService;