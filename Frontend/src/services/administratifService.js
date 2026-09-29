import apiClient from './apiClient.js';

/**
 * Gestion administrative : immatriculation, insertion Augure, mode de paiement.
 *
 * Ces trois activités existaient comme permissions sans aucune implémentation.
 * Elles partagent le même objet — la personne fonctionnaire — et le même suivi.
 */
const base = '/administratif';

export const administratifService = {
  tableauDeBord: () => apiClient.get(`${base}/tableau-de-bord`).then((r) => r.data),

  immatriculations: {
    lister: (params) => apiClient.get(`${base}/immatriculations`, { params }).then((r) => r.data),
    get: (id) => apiClient.get(`${base}/immatriculations/${id}`).then((r) => r.data),
    creer: (data) => apiClient.post(`${base}/immatriculations`, data).then((r) => r.data),
    modifier: (id, data) => apiClient.put(`${base}/immatriculations/${id}`, data).then((r) => r.data),
    /**
     * Interroge le système sur un CIN.
     *
     * C'est une AIDE : elle signale un fonctionnaire déjà connu sans empêcher
     * une nouvelle immatriculation. Bloquer serait une faute — un agent
     * réimmatriculé après une erreur de saisie ne pourrait plus l'être.
     */
    verifierCIN: (cin) => apiClient.get(`${base}/immatriculations/verifier-cin`, { params: { cin } }).then((r) => r.data),
  },

  augure: {
    lister: (params) => apiClient.get(`${base}/augure`, { params }).then((r) => r.data),
    creer: (data) => apiClient.post(`${base}/augure`, data).then((r) => r.data),
    modifier: (id, data) => apiClient.put(`${base}/augure/${id}`, data).then((r) => r.data),
  },

  paiements: {
    lister: (params) => apiClient.get(`${base}/paiements`, { params }).then((r) => r.data),
    creer: (data) => apiClient.post(`${base}/paiements`, data).then((r) => r.data),
    traiter: (id, statut, observations) =>
      apiClient.put(`${base}/paiements/${id}`, { statut, observations }).then((r) => r.data),
  },
};

export default administratifService;
