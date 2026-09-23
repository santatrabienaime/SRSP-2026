import apiClient from './apiClient.js';

export const statistiqueService = {
  get: (params) => apiClient.get('/statistiques', { params }).then((r) => r.data),
};

export default statistiqueService;