import apiClient from './apiClient.js';

export const notificationService = {
  list: () => apiClient.get('/notifications').then((r) => r.data),
  markRead: (id) => apiClient.put(`/notifications/${id}/lu`).then((r) => r.data),
  markAllRead: () => apiClient.put('/notifications/lu/tout').then((r) => r.data),
};

export default notificationService;