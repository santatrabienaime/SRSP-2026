import apiClient from './apiClient.js';

export const agentService = {
  list: (params) => apiClient.get('/agents', { params }).then((r) => r.data),
  create: (data) => apiClient.post('/agents', data).then((r) => r.data),
  update: (id, data) => apiClient.put(`/agents/${id}`, data).then((r) => r.data),
};

export default agentService;