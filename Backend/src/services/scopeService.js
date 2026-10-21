import db from '../config/db.js';
import { FICHE_DU_COMPTE } from '../models/joins.js';

/**
 * Portée d'affichage d'un utilisateur.
 *
 * Elle sert à adapter les écrans (tableau de bord, listes) au rôle réel, sans
 * modifier les permissions : un Chef de Division conserve l'accès métier élargi
 * mais ne voit dans ses indicateurs que sa division, et un agent seulement ses
 * propres dossiers.
 */
export async function getScope(userId) {
  const perms = await db.query(
    `SELECT p.nom
     FROM permissions p
     JOIN role_permissions rp ON p.id = rp.permission_id
     WHERE rp.role_id = (SELECT role_id FROM users WHERE id = ?)`,
    [userId]
  );
  const permissions = perms.map((r) => r.nom);

  const [row] = await db.query(
    `SELECT u.role_id, r.nom AS role_nom, a.id AS agent_id, a.division_id
     FROM users u
     LEFT JOIN roles r ON r.id = u.role_id
     ${FICHE_DU_COMPTE}
     WHERE u.id = ?`,
    [userId]
  );

  const roleNom = row?.role_nom || null;
  const agentScoped =
    !permissions.includes('view_all_dossiers') &&
    permissions.includes('view_assigned_dossiers');

  return {
    userId,
    roleNom,
    permissions,
    agentId: row?.agent_id || null,
    divisionId: row?.division_id || null,
    // Agent : uniquement ses dossiers.
    agentScoped,
    // Chef de division : indicateurs limités à sa division.
    divisionScoped: roleNom?.startsWith('CHEF_DIVISION_') || false,
    // Rôle de pilotage (admin, chef de service, secrétaire, BAAF, coordinatrice).
    global: permissions.includes('view_all_dossiers'),
  };
}

/**
 * La règle de circuit : un brouillon n'est pas dans le circuit.
 *
 * Elle est exprimée sur le **statut du dossier** (`d.statut_id`) et non sur
 * un alias de table. La raison est simple : une condition qui nomme un alias
 * n'est valable que si la requête joint effectivement cet alias. Or la
 * même règle doit s'appliquer à des requêtes de formes différentes — un
 * dossier joint (`JOIN statuts_dossiers s`), un dossier joint à gauche
 * (`LEFT JOIN dossiers d`) — et il suffit que l'une d'elles oublie la
 * jointure pour que la condition devienne une erreur serveur au lieu d'une
 * exclusion.
 *
 * En passant par le sous-état, la condition reste vraie partout où les
 * dossiers sont présents, et elle devient une exclusion dans une clause ON
 * comme dans une clause WHERE.
 *
 * Un brouillon ne doit gonfler aucun compteur, apparaître dans aucune file
 * d'attente, ni fausser les statistiques du service. Son auteur le retrouve
 * seul, dans « Mes brouillons ».
 */
export const HORS_BROUILLONS = ` AND d.statut_id <> COALESCE(
  (SELECT id FROM statuts_dossiers WHERE code = 'BROUILLON'), -1)`;

/**
 * La même règle, lue du côté des statuts.
 *
 * Quand on **liste des statuts** — la répartition par statut du tableau de
 * bord — c'est le pseudo-statut BROUILLON qu'il faut retirer de la liste,
 * et non les dossiers qu'il contient : un brouillon n'appartient qu'à ce
 * statut, donc retirer le statut suffit à ce qu'aucun brouillon ne soit
 * compté.
 *
 * Les deux écritures ne se confondent pas : celle-ci porte sur `s.code`,
 * l'autre sur `d.statut_id`. Les employer à la place l'une de l'autre
 * ferait disparaître de la répartition les statuts qui n'ont aucun dossier
 * — le tableau cesserait de montrer le circuit complet.
 */
export const HORS_STATUT_BROUILLON = " AND s.code <> 'BROUILLON'";

/**
 * Le périmètre d'affichage : les dossiers que l'utilisateur voit.
 *
 * Il ne dépend que de `d` : il s'applique à toute requête sur les dossiers,
 * quelle que soit la manière dont ils sont joints.
 */
export async function perimetrePour(scope) {
  if (scope.agentScoped && scope.agentId) {
    return { where: ' AND d.agent_responsable_id = ?', params: [scope.agentId] };
  }
  if (scope.divisionScoped && scope.divisionId) {
    return { where: ' AND d.division_id = ?', params: [scope.divisionId] };
  }
  return { where: '', params: [] };
}

/**
 * Construit le fragment SQL de filtrage correspondant à la portée.
 * Retourne { where, params } à concaténer à une requête sur `dossiers d`.
 *
 * Le fragment est le **périmètre** plus l'**exclusion des brouillons**. Les
 * deux sont dans un même objet parce qu'ils se combinent toujours — mais
 * seule la seconde dépend du statut, et `perimetrePour` permet de l'isoler
 * pour les requêtes dont la jointure sur le statut est facultative.
 */
export async function filterFor(scope) {
  const perimetre = await perimetrePour(scope);
  return {
    where: `${perimetre.where}${HORS_BROUILLONS}`,
    params: perimetre.params,
  };
}

/** Libellé du périmètre, affiché dans l'interface. */
export function libellePerimetre(scope) {
  if (scope.agentScoped) return 'Vos dossiers';
  if (scope.divisionScoped) return 'Division';
  return 'Toutes les divisions';
}

/**
 * Un utilisateur a-t-il légitimement accès à CE dossier ?
 *
 * Mêmes règles que le cloisonnement des listes, pour qu'une information ne
 * puisse pas sortir par un autre chemin que la navigation elle-même : une
 * notification ou un détail renvoyé à quelqu'un qui n'a pas accès au dossier
 * lui révélerait son numéro — une fuite inter-division.
 */
export async function accesDossier(userId, dossierId) {
  if (!userId || !dossierId) return false;

  const scope = await getScope(userId);

  const [dossier] = await db.query(
    'SELECT division_id, agent_responsable_id FROM dossiers WHERE id = ? LIMIT 1',
    [dossierId]
  );
  if (!dossier) return false;

  /* L'ordre de ces tests est délibéré, et il était inversé.
     `view_all_dossiers` est détenue par les chefs de division autant que par
     les rôles de pilotage : tester cette permission EN PREMIER leur ouvrait
     l'accès à toutes les divisions, et le cloisonnement appliqué plus bas ne
     s'exécutait jamais. Le chef VISA pouvait ainsi ouvrir un dossier Solde.
     On teste donc d'abord le périmètre le plus restrictif. */

  // Chef de division : sa division uniquement.
  if (scope.divisionScoped && scope.divisionId) {
    return dossier.division_id === scope.divisionId;
  }

  // Rôle de pilotage : accès global.
  if (scope.permissions.includes('view_all_dossiers')) return true;

  // Agent : uniquement les dossiers dont il est responsable.
  if (scope.agentScoped && scope.agentId) {
    return dossier.agent_responsable_id === scope.agentId;
  }

  return false;
}

export default getScope;
