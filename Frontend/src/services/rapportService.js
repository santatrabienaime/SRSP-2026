import apiClient from './apiClient.js';

export const rapportService = {
  pdf: (params) =>
    apiClient.get('/rapports/pdf', { params, responseType: 'blob' }).then((r) => r.data),
  excel: () =>
    apiClient.get('/rapports/excel', { responseType: 'blob' }).then((r) => r.data),
};

export default rapportService;