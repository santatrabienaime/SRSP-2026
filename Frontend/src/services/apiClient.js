import axios from 'axios';
import { API_BASE } from '../config/constants.js';

// Jeton courant, détenu en mémoire par le contexte d'authentification.
// Il n'est **pas** persisté : un rafraîchissement du navigateur efface la
// session et ramène à la saisie du mot de passe, ce qui évite qu'un autre
// utilisateur hérite de l'interface du précédent.
let jetonCourant = null;

export function setAuthToken(token) {
  jetonCourant = token || null;
}

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  if (jetonCourant) config.headers.Authorization = `Bearer ${jetonCourant}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message || 'Erreur réseau';
    // Token absent, expiré ou invalide → déconnexion locale
    if (status === 401 && !error.config?.url?.includes('/auth/login')) {
      setAuthToken(null);
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