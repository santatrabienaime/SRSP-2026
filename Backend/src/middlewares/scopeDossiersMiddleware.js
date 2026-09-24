import db from '../config/db.js';

/**
 * Portée de lecture des dossiers.
 *
 * Un rôle qui possède `view_all_dossiers` voit tous les dossiers.
 * Un rôle qui ne possède QUE `view_assigned_dossiers` (agents : vérificateurs,
 * liquidateurs, chargés de secours) est automatiquement restreint aux dossiers
 * dont il est le responsable — sans quoi il verrait le travail des autres
 * divisions.
 *
 * Le rôle de l'utilisateur est résolu via agents.user_id ; s'il n'a pas de
 * fiche agent, on ne restreint pas (comportement historique) mais on journalise.
 */
export async function scopeDossiersMiddleware(req, res, next) {
  try {
    const rows = await db.query(
      `SELECT p.nom
       FROM permissions p
       JOIN role_permissions rp ON p.id = rp.permission_id
       WHERE rp.role_id = (SELECT role_id FROM users WHERE id = ?)`,
      [req.user.id]
    );
    const permissions = rows.map((r) => r.nom);

    // Rôle de pilotage : accès global, on ne touche à rien.
    if (permissions.includes('view_all_dossiers')) return next();

    // Ni global ni restreint : on laisse passer (comportement inchangé).
    if (!permissions.includes('view_assigned_dossiers')) return next();

    // Agent : on ne renvoie que SES dossiers.
    const agent = await db.query(
      'SELECT id FROM agents WHERE user_id = ? LIMIT 1',
      [req.user.id]
    );
    if (!agent[0]) return next();

    // Requête explicite d'un responsable : on la respecte seulement si c'est
    // le sien, sinon on refuse (pas de fuite inter-division).
    const demande = req.query.agent_id;
    if (demande && String(demande) !== String(agent[0].id)) {
      return res.status(403).json({
        message: 'Accès refusé : un agent ne peut consulter que ses propres dossiers.',
      });
    }
    // On force le filtre sur le responsable courant.
    req.query.agent_id = agent[0].id;
    req.dossierScope = { agentId: agent[0].id };
    return next();
  } catch (error) {
    next(error);
  }
}

export default scopeDossiersMiddleware;

/**
 * Vérifie qu'un utilisateur restreint ("agent") est bien le responsable du
 * dossier demandé. Empêche l'accès direct par ID à un dossier d'autrui
 * (GET /dossiers/:id), que le seul filtrage de liste ne protégeait pas.
 */
export async function assertDossierAccessMiddleware(req, res, next) {
  try {
    const rows = await db.query(
      `SELECT p.nom
       FROM permissions p
       JOIN role_permissions rp ON p.id = rp.permission_id
       WHERE rp.role_id = (SELECT role_id FROM users WHERE id = ?)`,
      [req.user.id]
    );
    const permissions = rows.map((r) => r.nom);

    if (
      permissions.includes('view_all_dossiers') ||
      !permissions.includes('view_assigned_dossiers')
    ) {
      return next();
    }

    const agent = await db.query('SELECT id FROM agents WHERE user_id = ? LIMIT 1', [
      req.user.id,
    ]);
    if (!agent[0]) return next();

    const dossier = await db.query(
      'SELECT agent_responsable_id FROM dossiers WHERE id = ?',
      [req.params.id]
    );
    if (!dossier[0]) return next(); // 404 géré par le contrôleur

    if (dossier[0].agent_responsable_id !== agent[0].id) {
      return res.status(403).json({
        message: 'Accès refusé : ce dossier ne vous est pas affecté.',
      });
    }
    return next();
  } catch (error) {
    next(error);
  }
}
