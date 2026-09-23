import apiClient from './apiClient.js';

export const permissionService = {
  list: () => apiClient.get('/permissions').then((r) => r.data),
  my: () => apiClient.get('/permissions/me').then((r) => r.data),
};

export default permissionService;