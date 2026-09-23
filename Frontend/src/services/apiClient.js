import axios from 'axios';
import { API_BASE } from '../config/constants.js';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('srsp_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message || 'Erreur réseau';
    // Token absent, expiré ou invalide → déconnexion locale
    if (status === 401 && !error.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('srsp_token');
      localStorage.removeItem('srsp_user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    const err = new Error(message);
    err.status = status;
    err.details = error.response?.data?.details;
    throw err;
  }
);

export default apiClient;