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
/**
 * Résout le périmètre d'un utilisateur : permissions, rôle, fiche agent et
 * division. Factorisé car les deux middlewares ont besoin des mêmes données et
 * doivent porter le MEME cloisonnement : s'ils divergeaient, un utilisateur
 * pourrait contourner le filtre de liste en ouvrant un dossier par son ID.
 */
async function resoudrePerimetre(userId) {
  const rows = await db.query(
    `SELECT p.nom
     FROM permissions p
     JOIN role_permissions rp ON p.id = rp.permission_id
     WHERE rp.role_id = (SELECT role_id FROM users WHERE id = ?)`,
    [userId]
  );
  const permissions = rows.map((r) => r.nom);

  const [user] = await db.query(
    `SELECT r.nom AS role_nom, a.id AS agent_id, a.division_id
     FROM users u
     LEFT JOIN roles r ON r.id = u.role_id
     LEFT JOIN agents a ON a.user_id = u.id
     WHERE u.id = ?`,
    [userId]
  );

  return {
    permissions,
    roleNom: user?.role_nom || null,
    agentId: user?.agent_id || null,
    divisionId: user?.division_id || null,
  };
}

export async function scopeDossiersMiddleware(req, res, next) {
  try {
    const { permissions, roleNom, agentId, divisionId } = await resoudrePerimetre(
      req.user.id
    );

    // Chef de division : accès métier large (view_all_dossiers), mais
    // cloisonnement sur SA division. Sans ce filtre, un chef de division Visa
    // voyait les dossiers Pension et Solde, ce que le document interdit
    // explicitement. Le cloisonnement prime sur l'étendue des permissions : une
    // permission d'accès n'est pas une permission de voir les autres divisions.
    const chefDivision = roleNom?.startsWith('CHEF_DIVISION_') && divisionId;
    if (chefDivision) {
      // Un filtre explicite vers une autre division ou un autre type est
      // refusé : on ne laisse pas croire à un résultat trompeur.
      const typeDemande = req.query.type;
      if (typeDemande) {
        const [attendu] = await db.query(
          `SELECT t.code FROM divisions d
           JOIN types_dossiers t ON t.id = d.type_dossier_id
           WHERE d.id = ? LIMIT 1`,
          [divisionId]
        );
        if (attendu && String(attendu.code).toUpperCase() !== String(typeDemande).toUpperCase()) {
          return res.status(403).json({
            message:
              'Accès refusé : un chef de division ne peut consulter que les dossiers de sa division.',
          });
        }
      }
      const divisionDemandee = req.query.division_id;
      if (divisionDemandee && String(divisionDemandee) !== String(divisionId)) {
        return res.status(403).json({
          message:
            'Accès refusé : un chef de division ne peut consulter que les dossiers de sa division.',
        });
      }
      req.query.division_id = divisionId;
      req.dossierScope = { divisionId };
      return next();
    }

    // Rôle de pilotage : accès global, on ne touche à rien.
    if (permissions.includes('view_all_dossiers')) return next();

    // Ni global ni restreint : on laisse passer (comportement inchangé).
    if (!permissions.includes('view_assigned_dossiers')) return next();

    // Agent : on ne renvoie que SES dossiers.
    if (!agentId) return next();

    // Requête explicite d'un responsable : on la respecte seulement si c'est
    // le sien, sinon on refuse (pas de fuite inter-division).
    const demande = req.query.agent_id;
    if (demande && String(demande) !== String(agentId)) {
      return res.status(403).json({
        message: 'Accès refusé : un agent ne peut consulter que ses propres dossiers.',
      });
    }
    // On force le filtre sur le responsable courant.
    req.query.agent_id = agentId;
    req.dossierScope = { agentId };
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
    const { permissions, roleNom, agentId, divisionId } = await resoudrePerimetre(
      req.user.id
    );

    // Même cloisonnement que scopeDossiersMiddleware : un chef de division
    // n'ouvre pas un dossier d'une autre division en devinant son identifiant.
    if (roleNom?.startsWith('CHEF_DIVISION_') && divisionId) {
      const [dossier] = await db.query(
        'SELECT division_id FROM dossiers WHERE id = ?',
        [req.params.id]
      );
      if (!dossier) return next(); // 404 géré par le contrôleur
      if (dossier.division_id !== divisionId) {
        return res.status(403).json({
          message:
            'Accès refusé : ce dossier n\'appartient pas à votre division.',
        });
      }
      return next();
    }

    if (
      permissions.includes('view_all_dossiers') ||
      !permissions.includes('view_assigned_dossiers')
    ) {
      return next();
    }

    if (!agentId) return next();

    const [dossier] = await db.query(
      'SELECT agent_responsable_id FROM dossiers WHERE id = ?',
      [req.params.id]
    );
    if (!dossier) return next(); // 404 géré par le contrôleur

    if (dossier.agent_responsable_id !== agentId) {
      return res.status(403).json({
        message: 'Accès refusé : ce dossier ne vous est pas affecté.',
      });
    }
    return next();
  } catch (error) {
    next(error);
  }
}
