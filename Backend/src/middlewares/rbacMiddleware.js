import db from '../config/db.js';

/**
 * Garde RBAC : l'utilisateur doit posséder AU MOINS UNE des permissions requises.
 *
 *   rbacMiddleware('create_dossier')                → une permission
 *   rbacMiddleware(['verifier_dossier', 'valider_dossier']) → plusieurs (OU)
 */
export function rbacMiddleware(requiredPermission) {
  const required = Array.isArray(requiredPermission)
    ? requiredPermission
    : [requiredPermission];

  return async (req, res, next) => {
    try {
      const rows = await db.query(
        `SELECT p.nom FROM permissions p
         JOIN role_permissions rp ON p.id = rp.permission_id
         JOIN users u ON u.role_id = rp.role_id
         WHERE u.id = ?`,
        [req.user.id]
      );
      const permissions = rows.map((r) => r.nom);
      if (!required.some((p) => permissions.includes(p))) {
        return res.status(403).json({ message: 'Accès refusé. Permission insuffisante.' });
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}
