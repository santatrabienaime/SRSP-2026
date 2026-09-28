import apiClient from './apiClient.js';

/**
 * Journal des actions.
 *
 * Les filtres sont envoyés au serveur, et la réponse est une enveloppe
 * `{ actions, total, tronque }` : le nombre d'événements peut dépasser ce qui est
 * renvoyé, et l'utilisateur doit le savoir plutôt que de croire avoir tout vu.
 */
export const historiqueService = {
  list: (params) => apiClient.get('/historique', { params }).then((r) => r.data),

  actions: () => apiClient.get('/historique/actions').then((r) => r.data.actions),

  /**
   * Télécharge l'export. Le serveur renvoie un fichier : sans passer par un
   * blob, le navigateur afficherait le CSV comme du texte dans un onglet.
   */
  exporter: async (format, filtres = {}) => {
    const reponse = await apiClient.get(`/historique/export/${format}`, {
      params: filtres,
      responseType: 'blob',
    });
    const nom = `historique-srsp-${new Date().toISOString().slice(0, 10)}.${format === 'excel' ? 'xlsx' : format}`;
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

export default historiqueService;
