import apiClient from './apiClient.js';

/**
 * Consultation des archives.
 *
 * Toutes les méthodes envoient les filtres au serveur : la liste affichée
 * n'est jamais un filtrage fait dans le navigateur, donc jamais un filtrage
 * approximatif ni une liste complète rapatriée pour être trier à la main.
 */
const base = '/archives';

export const archiveService = {
  lister: (filtres = {}) =>
    apiClient.get(base, { params: filtres }).then((r) => r.data),

  detail: (dossierId) => apiClient.get(`${base}/${dossierId}`).then((r) => r.data),

  tris: () => apiClient.get(`${base}/tris`).then((r) => r.data.tris),

  statistiques: (filtres = {}) =>
    apiClient.get(`${base}/statistiques`, { params: filtres }).then((r) => r.data),

  alertes: (filtres = {}) =>
    apiClient.get(`${base}/alertes`, { params: filtres }).then((r) => r.data.alertes),

  restaurer: (dossierId, motif) =>
    apiClient.post(`${base}/${dossierId}/restaurer`, { motif }).then((r) => r.data),

  /**
   * Télécharge un export. Le serveur renvoie un fichier : on le récupère en
   * blob et on déclenche l'enregistrement, sinon le navigateur afficherait le
   * CSV comme du texte.
   */
  exporter: async (format, filtres = {}) => {
    const reponse = await apiClient.get(`${base}/export/${format}`, {
      params: filtres,
      responseType: 'blob',
    });
    const nom = `archives-srsp-${new Date().toISOString().slice(0, 10)}.${format === 'excel' ? 'xlsx' : format}`;
    const url = URL.createObjectURL(new Blob([reponse.data]));
    const lien = document.createElement('a');
    lien.href = url;
    lien.download = nom;
    document.body.appendChild(lien);
    lien.click();
    lien.remove();
    // Sans révocation, l'objet reste en mémoire jusqu'au rechargement.
    URL.revokeObjectURL(url);
    return nom;
  },
};

/**
 * Recherches sauvegardées, conservées dans le navigateur.
 *
 * Volontairement local : ce sont des critères de travail, pas des données
 * métier, et il n'y a aucune raison de les partager entre postes.
 */
const CLE = 'srpt_archives_recherches';

export const recherchesSauvegardees = {
  lister() {
    try {
      const brut = window.localStorage.getItem(CLE);
      const liste = brut ? JSON.parse(brut) : [];
      return Array.isArray(liste) ? liste : [];
    } catch {
      return [];
    }
  },
  enregistrer(nom, criteres) {
    const liste = recherchesSauvegardees.lister().filter((r) => r.nom !== nom);
    liste.unshift({ nom, criteres, date: new Date().toISOString() });
    try {
      window.localStorage.setItem(CLE, JSON.stringify(liste.slice(0, 20)));
    } catch {
      /* quota atteint : la liste reste en mémoire pour la session */
    }
    return liste.slice(0, 20);
  },
  supprimer(nom) {
    const liste = recherchesSauvegardees.lister().filter((r) => r.nom !== nom);
    try { window.localStorage.setItem(CLE, JSON.stringify(liste)); } catch { /* ignore */ }
    return liste;
  },
};

export default archiveService;
