import apiClient from './apiClient.js';

export const referentielService = {
  get: () => apiClient.get('/referentiel').then((r) => r.data),
};

export default referentielService;