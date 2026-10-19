import apiClient from './apiClient.js';

import { extractValue } from '../utils/extractValue.js';

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