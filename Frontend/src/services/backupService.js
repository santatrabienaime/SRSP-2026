import apiClient from './apiClient.js';

/**
 * Service de sauvegarde et restauration de la base de données SRSP.
 *
 * Conforme au CDC §16 : sauvegarde automatique, conservation de plusieurs
 * versions, restauration testée, chiffrement des sauvegardes.
 */

export const backupService = {
  /** Liste des sauvegardes disponibles. */
  list: () => apiClient.get('/backup').then((r) => r.data || []),

  /** Lance une sauvegarde manuelle. */
  creer: () => apiClient.post('/backup/creer').then((r) => r.data),

  /** Restaure une sauvegarde par son nom de fichier. */
  restaurer: (nomFichier) =>
    apiClient.post('/backup/restaurer', { nom: nomFichier }).then((r) => r.data),

  /** Télécharge une sauvegarde. */
  telecharger: (nomFichier) =>
    apiClient.get(`/backup/telecharger/${nomFichier}`, {
      responseType: 'blob',
    }).then((r) => r.data),

  /** Supprime une sauvegarde. */
  supprimer: (nomFichier) =>
    apiClient.delete(`/backup/${nomFichier}`).then((r) => r.data),

  /** Vérifie l'intégrité d'une sauvegarde. */
  verifier: (nomFichier) =>
    apiClient.post(`/backup/verifier/${nomFichier}`).then((r) => r.data),
};

export default backupService;