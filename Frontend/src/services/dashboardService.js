import apiClient from './apiClient.js';

export const dashboardService = {
  summary: () => apiClient.get('/dashboard/summary').then((r) => r.data),
  byDivision: () => apiClient.get('/dashboard/by-division').then((r) => r.data),
  byStatus: () => apiClient.get('/dashboard/by-status').then((r) => r.data),
  evolution: () => apiClient.get('/dashboard/evolution').then((r) => r.data),
};

export default dashboardService;