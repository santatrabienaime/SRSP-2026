/**
 * Destination d'une notification : une notification doit mener à l'action.
 *
 * Règle : « Une notification = un lien direct vers l'action à effectuer ».
 *
 * Deux sources, dans cet ordre :
 *  1. le champ `lien` enregistré en base, s'il est un chemin interne sûr ;
 *  2. sinon, la déduction à partir de l'action et du dossier.
 *
 * Sécurité : un `lien` venant de la base n'est pas de confiance. Seuls les
 * chemins internes absolus sont acceptés — une URL absolue, un protocole
 * relative (« //hote ») ou un « javascript: » sont ignorés, sinon un lien
 * recorded en base pourrait envoyer l'utilisateur ailleurs.
 *
 * Le document de référence prévoit des destinations du type
 * /dossiers/:id/corriger ou /dossiers/:id/verifier. Ces écrans n'existent pas
 * dans l'application : ce sont des actions proposals depuis la fiche. On
 * ramène donc à la fiche du dossier et on désigne l'action à y exécuter, ce
 * qui évite d'inventer des routes qui ne mèneraient nulle part.
 */

/** Fragment de route qui amène directement à la section visée sur la fiche. */
export const FRAGMENTS = {
  // Panneaux financiers : ils ont leur propre carte sur la fiche.
  CONTROLE_DECOMPTE: 'controle-decompte',
  DECOMPTE_AVANCE: 'decompte-avance',
  LIQUIDATION_PENSION: 'liquidation-pension',
  // Contenu du dossier.
  MENTION: 'commentaires',
  COMMENTAIRE: 'commentaires',
  DOCUMENT: 'documents',
};

/** Un chemin interne est-il sûr à suivre ? */
export function estCheminInterne(chemin) {
  if (typeof chemin !== 'string' || !chemin) return false;
  if (!chemin.startsWith('/')) return false;      // http://, mailto:, javascript:
  if (chemin.startsWith('//')) return false;      // protocole-relative
  return true;
}

/**
 * Chemin de la fiche d'un dossier, avec le fragment de section si l'action en
 * désigne une. On n'invente l'ancre que si elle existe réellement sur la fiche :
 * un #fantôme ne ferait rien et laisserait l'utilisateur sans repère.
 *
 * Les actions de workflow (corriger, vérifier, signer) n'ont pas d'ancre : la
 * fiche s'ouvre en haut, et le panneau d'actions propose déjà l'action
 * correspondante selon le statut. Pointer vers un identifiant inexistant
 * donnerait l'illusion d'un lien précis alors qu'il n'y en a pas.
 */
export function ficheDossier(dossierId, action) {
  if (!dossierId) return null;
  const fragment = FRAGMENTS[action];
  return `/dossiers/${dossierId}${fragment ? `#${fragment}` : ''}`;
}

/**
 * Destination à suivre au clic sur une notification, ou null si l'action
 * n'a pas de cible connue — dans ce cas la notification n'est pas cliquable
 * plutôt que de mener à une page au hasard.
 */
export function destinationNotification(notification) {
  if (!notification) return null;

  // 1. Le lien enregistré, s'il est interne.
  if (estCheminInterne(notification.lien)) return notification.lien;

  // 2. Sinon, la déduction.
  return ficheDossier(notification.dossier_id, notification.action);
}

/** Une notification est-elle cliquable ? */
export function estCliquable(notification) {
  return destinationNotification(notification) !== null;
}

/**
 * Libellé du bouton d'action affiché sous la notification. Le document veut
 * que l'utilisateur sache où il va : « Ouvrir le dossier », « Corriger »,
 * « Signer »…
 */
export function libelleAction(notification) {
  const cible = destinationNotification(notification);
  if (!cible) return null;

  switch (notification.action) {
    case 'CORRECTION_DEMANDEE':
      return 'Corriger le dossier';
    case 'SOUMIS_A_VERIFICATION':
      return 'Vérifier le dossier';
    case 'VALIDE':
    case 'SIGNE':
      return 'Signer le dossier';
    case 'MENTION':
    case 'COMMENTAIRE':
      return 'Voir les commentaires';
    case 'DOCUMENT':
      return 'Voir les documents';
    case 'CONTROLE_DECOMPTE':
      return 'Contrôler le décompte';
    case 'DECOMPTE_AVANCE':
      return 'Voir le décompte';
    default:
      return 'Ouvrir le dossier';
  }
}

export default destinationNotification;
