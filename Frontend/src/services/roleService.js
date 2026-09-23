import apiClient from './apiClient.js';

export const roleService = {
  list: () => apiClient.get('/roles').then((r) => r.data),
  get: (id) => apiClient.get(`/roles/${id}`).then((r) => r.data),
  create: (data) => apiClient.post('/roles', data).then((r) => r.data),
  update: (id, data) => apiClient.put(`/roles/${id}`, data).then((r) => r.data),
  remove: (id) => apiClient.delete(`/roles/${id}`).then((r) => r.data),
  setPermissions: (id, permission_ids) =>
    apiClient.put(`/roles/${id}/permissions`, { permission_ids }).then((r) => r.data),
};

export default roleService;