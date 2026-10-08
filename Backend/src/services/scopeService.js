import db from '../config/db.js';

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
     LEFT JOIN agents a ON a.user_id = u.id
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
 * Construit le fragment SQL de filtrage correspondant à la portée.
 * Retourne { where, params } à concaténer à une requête sur `dossiers d`.
 */
export async function filterFor(scope) {
  if (scope.agentScoped && scope.agentId) {
    return { where: ' AND d.agent_responsable_id = ?', params: [scope.agentId] };
  }
  if (scope.divisionScoped && scope.divisionId) {
    return { where: ' AND d.division_id = ?', params: [scope.divisionId] };
  }
  return { where: '', params: [] };
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
