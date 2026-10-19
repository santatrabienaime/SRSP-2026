import apiClient from './apiClient.js';

/**
 * Service de sauvegarde et restauration de la base de données SRSP.
 *
 * Conforme au CDC §16 : sauvegarde automatique, conservation de plusieurs
 * versions, restauration testée, chiffrement des sauvegardes.
 */

export const backupService = {
  /* Liste des sauvegardes disponibles.
     Le serveur nomme le champ « fichier » (nom du dump sur le disque) ;
     l'interface raisonne en « nom ». La traduction se fait ici, une fois,
     pour que les lignes du tableau et les actions (télécharger, vérifier,
     restaurer, supprimer) visent toutes le même fichier. */
  list: () =>
    apiClient.get('/admin/backup').then((r) =>
      (r.data || []).map((b) => ({
        nom: b.fichier ?? b.nom,
        taille: b.taille,
        date: b.date,
      }))
    ),

  /** Lance une sauvegarde manuelle. */
  creer: () => apiClient.post('/admin/backup').then((r) => r.data),

  /** Restaure une sauvegarde par son nom de fichier. */
  restaurer: (nomFichier) =>
    apiClient.post(`/admin/backup/${encodeURIComponent(nomFichier)}/restore`, { nom: nomFichier }).then((r) => r.data),

  /** Télécharge une sauvegarde. */
  telecharger: (nomFichier) =>
    apiClient.get(`/admin/backup/telecharger/${nomFichier}`, {
      responseType: 'blob',
    }).then((r) => r.data),

  /** Supprime une sauvegarde. */
  supprimer: (nomFichier) =>
    apiClient.delete(`/admin/backup/${nomFichier}`).then((r) => r.data),

  /** Vérifie l'intégrité d'une sauvegarde. */
  verifier: (nomFichier) =>
    apiClient.post(`/admin/backup/verifier/${nomFichier}`).then((r) => r.data),
};

export default backupService;