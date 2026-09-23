import apiClient from './apiClient.js';

export const userService = {
  list: () => apiClient.get('/users').then((r) => r.data),
  create: (data) => apiClient.post('/users', data).then((r) => r.data),
  update: (id, data) => apiClient.put(`/users/${id}`, data).then((r) => r.data),
  resetPassword: (id, password) =>
    apiClient.post(`/users/${id}/reset-password`, { password }).then((r) => r.data),
};

export default userService;