import apiClient from './apiClient.js';

/**
 * Monitoring système et sauvegardes (administration, permission system_config).
 */
export const systemService = {
  /** Compteurs CPU / RAM / disque / uptime de l'hôte. */
  monitoring: () => apiClient.get('/admin/system').then((r) => r.data),
  /** Liste des sauvegardes (dumps SQL + archives de pièces jointes). */
  backups: () => apiClient.get('/admin/backup').then((r) => r.data),
  /** Lancer une sauvegarde. */
  createBackup: () => apiClient.post('/admin/backup').then((r) => r.data),
  /**
   * Restaurer une sauvegarde — destructif : le serveur crée automatiquement
   * une sauvegarde de sécurité avant de rejouer le dump.
   */
  restoreBackup: (fichier) =>
    apiClient.post(`/admin/backup/${encodeURIComponent(fichier)}/restore`).then((r) => r.data),
};

export default systemService;
