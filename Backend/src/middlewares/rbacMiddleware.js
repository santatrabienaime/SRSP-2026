import db from '../config/db.js';

export function rbacMiddleware(requiredPermission) {
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
      if (!permissions.includes(requiredPermission)) {
        return res.status(403).json({ message: 'Accès refusé. Permission insuffisante.' });
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}
