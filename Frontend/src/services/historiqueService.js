import apiClient from './apiClient.js';

export const historiqueService = {
  list: (params) => apiClient.get('/historique', { params }).then((r) => r.data),
};

export default historiqueService;