import apiClient from './apiClient.js';

/**
 * Correspondances d'un dossier (division Pensions et Secours).
 *
 * Une correspondance est une lettre ou une notification envoyée à un
 * destinataire : une prescription, une demande de dossier mère, une
 * opposition. Elle est suivie jusqu'au niveau central — réponse reçue,
 * bordereau de transmission, accusé de réception du central.
 *
 * Elle vit sur sa propre ressource (`/api/correspondances`) et non sous
 * `/api/dossiers/:id` : la route générique `/:id` du routeur des dossiers
 * intercepterait la demande avant même qu'elle n'atteigne le bon contrôleur.
 * Le rattachement au dossier passe donc par le paramètre `dossier_id`.
 */
export const correspondanceService = {
  /** Les correspondances d'un dossier ; sans `dossier_id`, toutes celles
   *  auxquelles l'agent a accès. */
  list: (dossierId) =>
    apiClient
      .get('/correspondances', { params: dossierId ? { dossier_id: dossierId } : {} })
      .then((r) => r.data || []),

  /** Nouvelle correspondance. Le destinataire et l'objet sont exigés par le
   *  serveur : une correspondance sans objet n'est pas une correspondance. */
  create: (data) => apiClient.post('/correspondances', data).then((r) => r.data),

  /** Mise à jour du suivi : réponse reçue, transmission centrale, état de
   *  réception. C'est ce qui permet de tracer une opposition jusqu'au
   *  niveau central. */
  update: (id, data) => apiClient.put(`/correspondances/${id}`, data).then((r) => r.data),
};

export default correspondanceService;
